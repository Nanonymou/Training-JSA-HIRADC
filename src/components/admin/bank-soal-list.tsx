"use client";

import { Check, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * The admin bank soal list.
 *
 * Every question with its options — the correct one marked — and per-question
 * edit/delete actions, plus a toolbar to add a question. The add/edit form and
 * wiring land in later tasks; this is the list on the mock bank.
 */
export function BankSoalList() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {QUIZ_QUESTIONS.length} soal
        </p>
        <Button size="sm">
          <Plus />
          Tambah Soal
        </Button>
      </div>

      <ol className="flex flex-col gap-3">
        {QUIZ_QUESTIONS.map((question, index) => (
          <li
            key={question.id}
            className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">
                <span className="text-muted-foreground mr-1.5 tabular-nums">
                  {index + 1}.
                </span>
                {question.soal}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Sunting soal ${index + 1}`}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Hapus soal ${index + 1}`}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {question.pilihan.map((option, optionIndex) => {
                const correct = optionIndex === question.kunci;
                return (
                  <li
                    key={optionIndex}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
                      correct
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded text-xs font-semibold",
                        correct
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {correct ? <Check className="size-3" /> : LETTERS[optionIndex]}
                    </span>
                    <span className="text-pretty">{option}</span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
