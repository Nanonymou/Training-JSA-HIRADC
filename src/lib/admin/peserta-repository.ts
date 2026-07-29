import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  peserta as pesertaTable,
  quizAttempts,
  uploads,
} from "@/lib/db/schema";
import { PESERTA_RECORDS, type PesertaRecord } from "@/lib/admin/peserta";
import {
  DEFAULT_TRAINING_ID,
  isDefaultTraining,
  resolveTrainingId,
} from "@/lib/training/scope";

/**
 * Server-side access to peserta records, with filtering.
 *
 * Reads from Postgres when configured, otherwise from the seed records, so the
 * data-peserta screens work before a database exists. The DB path maps rows to
 * the same PesertaRecord shape the UI uses (quiz/upload status default until the
 * joins with quiz_attempts/uploads are added). Server-only.
 */

export interface PesertaFilter {
  lokasi?: string;
  q?: string;
  from?: string;
  to?: string;
  /** Training scope; defaults to the primary training. */
  trainingId?: string;
}

async function fromSource(trainingId: string): Promise<PesertaRecord[]> {
  const scope = resolveTrainingId(trainingId);
  const db = getDb();
  if (!db) return isDefaultTraining(scope) ? PESERTA_RECORDS : [];

  const [rows, attempts, ups] = await Promise.all([
    db.select().from(pesertaTable).where(eq(pesertaTable.trainingId, scope)),
    db.select().from(quizAttempts).where(eq(quizAttempts.trainingId, scope)),
    db.select().from(uploads).where(eq(uploads.trainingId, scope)),
  ]);

  // Latest quiz attempt per peserta email (attempts carry no peserta FK — the
  // Daftar Hadir is a cookie session — so we match on the denormalised email).
  const latestAttempt = new Map<string, (typeof attempts)[number]>();
  for (const a of attempts) {
    const key = a.pesertaEmail.toLowerCase();
    const prev = latestAttempt.get(key);
    if (!prev || a.createdAt > prev.createdAt) latestAttempt.set(key, a);
  }
  const hasUpload = new Set(ups.map((u) => u.pesertaEmail.toLowerCase()));

  return rows.map((row) => {
    const attempt = latestAttempt.get(row.email.toLowerCase());
    return {
      id: row.id,
      nama: row.nama,
      email: row.email,
      jabatan: row.jabatan,
      lokasi: row.lokasi,
      quizStatus: attempt
        ? attempt.lulus
          ? "Lulus"
          : "Belum Lulus"
        : "Belum Ikut",
      quizScore: attempt ? attempt.score : null,
      uploadStatus: hasUpload.has(row.email.toLowerCase())
        ? "Terkirim"
        : "Belum",
      waktuHadir: row.waktuHadir.toISOString(),
    };
  });
}

/**
 * Record a peserta's attendance in the database (if configured). Attendance is
 * also a cookie session for the quiz gate, but persisting it here is what makes
 * the admin's Data Peserta and reports show real registrations.
 */
export async function savePeserta(input: {
  nama: string;
  email: string;
  jabatan: string;
  lokasi: string;
  departemen?: string;
  ip?: string;
  browser?: string;
  trainingId?: string;
}): Promise<void> {
  const db = getDb();
  if (!db) return;

  await db.insert(pesertaTable).values({
    trainingId: resolveTrainingId(input.trainingId),
    nama: input.nama,
    email: input.email,
    jabatan: input.jabatan,
    lokasi: input.lokasi,
    departemen: input.departemen ?? "QHSE",
    ip: input.ip,
    browser: input.browser,
  });
}

/** Apply the filter to a set of records. */
export function filterPeserta(
  rows: PesertaRecord[],
  filter: PesertaFilter,
): PesertaRecord[] {
  const q = filter.q?.trim().toLowerCase();
  return rows.filter((row) => {
    if (filter.lokasi && filter.lokasi !== "all" && row.lokasi !== filter.lokasi) {
      return false;
    }
    if (q && !row.nama.toLowerCase().includes(q) && !row.email.toLowerCase().includes(q)) {
      return false;
    }
    const day = row.waktuHadir.slice(0, 10);
    if (filter.from && day < filter.from) return false;
    if (filter.to && day > filter.to) return false;
    return true;
  });
}

export async function getPesertaRecords(
  filter: PesertaFilter = {},
): Promise<PesertaRecord[]> {
  return filterPeserta(
    await fromSource(filter.trainingId ?? DEFAULT_TRAINING_ID),
    filter,
  );
}

/** One peserta by id within a training scope, or null if there's no match. */
export async function getPesertaById(
  id: string,
  trainingId: string = DEFAULT_TRAINING_ID,
): Promise<PesertaRecord | null> {
  const rows = await fromSource(trainingId);
  return rows.find((row) => row.id === id) ?? null;
}
