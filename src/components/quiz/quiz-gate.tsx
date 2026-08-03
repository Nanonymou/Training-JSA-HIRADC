"use client";

import { useState } from "react";

import { QuizIntro } from "@/components/quiz/quiz-intro";
import { QuizLocked } from "@/components/quiz/quiz-locked";
import { QuizResult } from "@/components/quiz/quiz-result";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { buildQuizAttempt, type QuizAttemptQuestion } from "@/lib/quiz/attempt";
import { QUIZ_CONFIG } from "@/lib/quiz/config";
import { gradeAttempt, type QuizResult as QuizResultData } from "@/lib/quiz/grade";
import { usePeserta } from "@/hooks/use-peserta";

type Stage = "intro" | "running" | "submitted";

/**
 * The quiz's prerequisite gate and flow.
 *
 * No signed Daftar Hadir → the locked state. Otherwise it walks intro → runner →
 * result. Starting an attempt draws a fresh randomised set (random questions,
 * shuffled options) so every run differs; submitting grades it against the
 * passing grade and shows the score with a lulus/gagal status. Retry starts a
 * new randomised attempt.
 */
export function QuizGate() {
  const { peserta } = usePeserta();
  const [stage, setStage] = useState<Stage>("intro");
  const [attempt, setAttempt] = useState<QuizAttemptQuestion[]>([]);
  const [result, setResult] = useState<QuizResultData | null>(null);

  if (!peserta) {
    return <QuizLocked />;
  }

  function start() {
    // Build the randomised attempt here (a client event) so Math.random never
    // runs during render/SSR.
    setAttempt(buildQuizAttempt(QUIZ_CONFIG.jumlahSoal));
    setResult(null);
    setStage("running");
  }

  if (stage === "running") {
    return (
      <QuizRunner
        questions={attempt}
        onExit={() => setStage("intro")}
        onSubmit={(answers) => {
          const graded = gradeAttempt(
            attempt,
            answers,
            QUIZ_CONFIG.passingGrade,
          );
          setResult(graded);
          setStage("submitted");
          // Persist the attempt so the admin sees it. Best effort — a failure
          // here won't affect what the peserta sees on the result screen.
          void fetch("/api/quiz/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              score: graded.score,
              correct: graded.correct,
              total: graded.total,
            }),
          }).catch(() => {
            // ignore; peserta already sees their result
          });
        }}
      />
    );
  }

  if (stage === "submitted" && result) {
    return (
      <QuizResult
        result={result}
        passingGrade={QUIZ_CONFIG.passingGrade}
        onRetry={start}
      />
    );
  }

  return <QuizIntro pesertaNama={peserta.nama} onStart={start} />;
}
