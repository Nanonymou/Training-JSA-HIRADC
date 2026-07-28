"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";

import { QuizIntro } from "@/components/quiz/quiz-intro";
import { QuizLocked } from "@/components/quiz/quiz-locked";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { Button } from "@/components/ui/button";
import { QUIZ_CONFIG } from "@/lib/quiz/config";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";
import { usePeserta } from "@/hooks/use-peserta";

type Stage = "intro" | "running" | "submitted";

/**
 * The quiz's prerequisite gate and flow.
 *
 * No signed Daftar Hadir → the locked state. Otherwise it walks intro → runner →
 * a submitted acknowledgement. The served set is the first `jumlahSoal` of the
 * mock bank for now (random sampling and shuffling land in a later task), and
 * grading against the passing grade is its own upcoming task — so submit here
 * just acknowledges the attempt.
 */
export function QuizGate() {
  const { peserta } = usePeserta();
  const [stage, setStage] = useState<Stage>("intro");
  const [answeredCount, setAnsweredCount] = useState(0);

  if (!peserta) {
    return <QuizLocked />;
  }

  const served = QUIZ_QUESTIONS.slice(0, QUIZ_CONFIG.jumlahSoal);

  if (stage === "running") {
    return (
      <QuizRunner
        questions={served}
        onExit={() => setStage("intro")}
        onSubmit={(answers) => {
          setAnsweredCount(Object.keys(answers).length);
          setStage("submitted");
        }}
      />
    );
  }

  if (stage === "submitted") {
    return (
      <div className="bg-card border-border flex flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center">
        <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
          <ClipboardCheck className="size-6" />
        </span>
        <div className="flex max-w-sm flex-col gap-1.5">
          <h2 className="text-base font-semibold tracking-tight">
            Jawaban terkumpul
          </h2>
          <p className="text-muted-foreground text-sm text-pretty">
            {answeredCount} dari {served.length} soal terjawab. Penilaian
            otomatis dan nilai kelulusan akan aktif pada langkah berikutnya.
          </p>
        </div>
        <Button variant="outline" onClick={() => setStage("intro")}>
          Kembali ke awal
        </Button>
      </div>
    );
  }

  return (
    <QuizIntro
      pesertaNama={peserta.nama}
      onStart={() => setStage("running")}
    />
  );
}
