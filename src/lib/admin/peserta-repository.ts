import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { peserta as pesertaTable } from "@/lib/db/schema";
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

  const rows = await db
    .select()
    .from(pesertaTable)
    .where(eq(pesertaTable.trainingId, scope));
  return rows.map((row) => ({
    id: row.id,
    nama: row.nama,
    email: row.email,
    jabatan: row.jabatan,
    lokasi: row.lokasi,
    quizStatus: "Belum Ikut",
    quizScore: null,
    uploadStatus: "Belum",
    waktuHadir: row.waktuHadir.toISOString(),
  }));
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
