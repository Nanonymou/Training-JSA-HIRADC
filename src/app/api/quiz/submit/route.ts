import { NextResponse } from "next/server";

import {
  gradeSubmission,
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
 * POST /api/quiz/submit — grade a submitted attempt.
 *
 * Body: { answers: { questionId, optionId }[] }. Grading is done server-side by
 * option id against the stored bank, returning the score and pass/fail. The
 * client is never trusted to say what's correct.
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

  const outcome = await gradeSubmission(answers);
  return NextResponse.json(outcome);
}
