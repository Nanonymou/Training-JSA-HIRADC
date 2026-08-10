import { NextResponse } from "next/server";

import { readPesertaSession } from "@/lib/daftar-hadir/session";
import {
  gradeSubmission,
  saveQuizAttempt,
  type SubmittedAnswer,
} from "@/lib/quiz/repository";

export const dynamic = "force-dynamic";

/** Max answers accepted in one submission, as a light abuse guard. */
const MAX_ANSWERS = 50;

/** Validate the request body into a clean answers array, or null if malformed. */
function parseAnswers(body: unknown): SubmittedAnswer[] | null {
  if (!body || typeof body !== "object") return null;
  const raw = (body as { answers?: unknown }).answers;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_ANSWERS) {
    return null;
  }

  const answers: SubmittedAnswer[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const { questionId, optionId } = entry as Record<string, unknown>;
    if (typeof questionId !== "string" || typeof optionId !== "string") {
      return null;
    }
    answers.push({ questionId, optionId });
  }
  return answers;
}

/**
 * POST /api/quiz/submit — grade a submitted attempt and record it.
 *
 * Body: { answers: { questionId, optionId }[], peserta?: { nama, email, ... } }.
 * Grading is server-side by option id against the stored bank; the client is
 * never trusted to say what's correct. The attempt is saved to quiz_attempts so
 * the admin's Data Peserta / Laporan / Dashboard reflect it.
 *
 * Peserta identity prefers the signed Daftar Hadir cookie, falling back to the
 * body — the cookie can expire (8h) or be blocked while the client's
 * localStorage copy still knows who the peserta is. Same trust level as Daftar
 * Hadir itself (un-authenticated training portal).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const answers = parseAnswers(body);
  if (!answers) {
    return NextResponse.json(
      { error: "Format jawaban tidak valid." },
      { status: 400 },
    );
  }

  const cookiePeserta = await readPesertaSession();
  const source = (body ?? {}) as Record<string, unknown>;
  const bodyPeserta = (source.peserta ?? {}) as Record<string, unknown>;
  const asString = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const nama = cookiePeserta?.nama ?? asString(bodyPeserta.nama);
  const email = cookiePeserta?.email ?? asString(bodyPeserta.email);
  const jabatan = cookiePeserta?.jabatan ?? asString(bodyPeserta.jabatan);
  const lokasi = cookiePeserta?.lokasi ?? asString(bodyPeserta.lokasi);

  if (!nama || !email) {
    return NextResponse.json(
      { error: "Identitas peserta tidak lengkap. Isi daftar hadir dulu." },
      { status: 400 },
    );
  }

  const outcome = await gradeSubmission(answers);
  await saveQuizAttempt({ nama, email, jabatan, lokasi }, outcome);

  return NextResponse.json(outcome);
}
