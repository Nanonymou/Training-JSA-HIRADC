"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QuizQuestion } from "@/lib/quiz/questions";
import { cn } from "@/lib/utils";

/** A → B → C … labels for the options. */
const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * The quiz runner over a served set of questions (mock data for now).
 *
 * Renders every question with selectable options and tracks the peserta's
 * answers, showing how many are done. Submit stays disabled until all are
 * answered, then hands the answers up via `onSubmit`. Random sampling/shuffling
 * and automatic grading arrive in later tasks; this task establishes the
 * answering UI on the mock question bank.
 */
export function QuizRunner({
  questions,
  onSubmit,
  onExit,
}: {
  questions: QuizQuestion[];
  onSubmit: (answers: Record<string, number>) => void;
  onExit: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const answeredCount = useMemo(
    () => questions.filter((question) => question.id in answers).length,
    [answers, questions],
  );
  const allAnswered = answeredCount === questions.length;
  const ratio = questions.length === 0 ? 0 : answeredCount / questions.length;

  function choose(questionId: string, optionIndex: number) {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card border-border sticky top-4 z-10 flex flex-col gap-2 rounded-xl border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progres quiz</span>
          <span className="text-muted-foreground tabular-nums">
            {answeredCount}/{questions.length} terjawab
          </span>
        </div>
        <Progress
          value={ratio}
          aria-label={`${answeredCount} dari ${questions.length} soal terjawab`}
        />
      </div>

      <ol className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <li
            key={question.id}
            className="bg-card border-border flex flex-col gap-3 rounded-xl border p-5"
          >
            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold tracking-tight">
                <span className="text-muted-foreground mr-1.5 tabular-nums">
                  {index + 1}.
                </span>
                {question.soal}
              </legend>

              <div className="flex flex-col gap-2">
                {question.pilihan.map((option, optionIndex) => {
                  const selected = answers[question.id] === optionIndex;
                  return (
                    <label
                      key={optionIndex}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={optionIndex}
                        checked={selected}
                        onChange={() => choose(question.id, optionIndex)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {LETTERS[optionIndex]}
                      </span>
                      <span className="text-pretty">{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onExit}>
          Kembali
        </Button>
        <Button
          onClick={() => onSubmit(answers)}
          disabled={!allAnswered}
          title={allAnswered ? undefined : "Jawab semua soal dulu"}
        >
          Kumpulkan Jawaban
        </Button>
      </div>
    </div>
  );
}
