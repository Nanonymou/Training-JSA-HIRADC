import { NextResponse } from "next/server";

import { QUIZ_CONFIG } from "@/lib/quiz/config";
import { getRandomQuizQuestions } from "@/lib/quiz/repository";

// Each request is a fresh random draw, so never cache this route.
export const dynamic = "force-dynamic";

/**
 * GET /api/quiz/questions?count=10 — a random attempt: `count` questions (default
 * from QUIZ_CONFIG, capped) with their options shuffled. The correct answer is
 * withheld; grading happens server-side on submit. Option ids are stable so the
 * submit endpoint can score by id.
 *
 * Not session-gated: the peserta-session cookie can expire (8h) or be blocked
 * while the client still has a valid registration in localStorage, and blocking
 * here would strand them mid-quiz. The correct answers aren't shipped, so this
 * is safe — the UI already prevents an unregistered visitor from reaching the
 * runner (QuizGate renders QuizLocked).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = Number(searchParams.get("count"));
  const count =
    Number.isFinite(requested) && requested > 0
      ? Math.min(Math.floor(requested), 50)
      : QUIZ_CONFIG.jumlahSoal;

  const questions = await getRandomQuizQuestions(count);
  return NextResponse.json({ questions, count: questions.length });
}
