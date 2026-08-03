import { NextResponse } from "next/server";

import { readPesertaSession } from "@/lib/daftar-hadir/session";
import { QUIZ_CONFIG } from "@/lib/quiz/config";
import { saveQuizAttempt } from "@/lib/quiz/repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/quiz/record — persist a client-graded quiz result.
 *
 * The quiz is graded on the client (options are shuffled per-attempt, so the
 * kunci lives with the attempt). This endpoint records the outcome so the admin's
 * Data Peserta / Laporan / Dashboard can see that the attempt happened.
 *
 * Body: { score, correct, total, peserta?: { nama, email, jabatan, lokasi } }.
 * Peserta identity prefers the signed Daftar Hadir cookie, falling back to the
 * body — this training portal is intentionally un-authenticated (anyone can
 * register any name via Daftar Hadir), so accepting the identity from the client
 * is no weaker than the existing flow and covers the case where the cookie
 * expired or was blocked while the client still knows who the peserta is.
 * `lulus` is derived server-side from the configured passing grade.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const source = (body ?? {}) as Record<string, unknown>;
  const score = typeof source.score === "number" ? source.score : NaN;
  const correct = typeof source.correct === "number" ? source.correct : NaN;
  const total = typeof source.total === "number" ? source.total : NaN;
  if (
    !Number.isFinite(score) ||
    !Number.isFinite(correct) ||
    !Number.isFinite(total) ||
    total <= 0
  ) {
    return NextResponse.json(
      { error: "Nilai tidak valid." },
      { status: 400 },
    );
  }

  const cookiePeserta = await readPesertaSession();
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

  const passingGrade = QUIZ_CONFIG.passingGrade;
  await saveQuizAttempt(
    { nama, email, jabatan, lokasi },
    {
      total: Math.round(total),
      correct: Math.round(correct),
      score: Math.round(score),
      lulus: score >= passingGrade,
      passingGrade,
    },
  );

  return NextResponse.json({ ok: true });
}
