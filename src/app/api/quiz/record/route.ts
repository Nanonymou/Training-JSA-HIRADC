import { NextResponse } from "next/server";

import { readPesertaSession } from "@/lib/daftar-hadir/session";
import { QUIZ_CONFIG } from "@/lib/quiz/config";
import { saveQuizAttempt } from "@/lib/quiz/repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/quiz/record — persist a client-graded quiz result.
 *
 * The quiz is graded on the client (options are shuffled per-attempt, so the
 * kunci lives with the attempt). This endpoint records the outcome against the
 * signed-in peserta so the admin's Data Peserta / Laporan / Dashboard can see
 * that the attempt happened. Body: { score, correct, total }. `lulus` is derived
 * server-side from the configured passing grade.
 *
 * Peserta session required (from Daftar Hadir).
 */
export async function POST(request: Request) {
  const peserta = await readPesertaSession();
  if (!peserta) {
    return NextResponse.json(
      { error: "Isi daftar hadir dulu." },
      { status: 403 },
    );
  }

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

  const passingGrade = QUIZ_CONFIG.passingGrade;
  await saveQuizAttempt(
    {
      nama: peserta.nama,
      email: peserta.email,
      jabatan: peserta.jabatan,
      lokasi: peserta.lokasi,
    },
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
