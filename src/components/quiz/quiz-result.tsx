"use client";

import { RotateCcw, Trophy, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import type { QuizResult } from "@/lib/quiz/grade";
import { cn } from "@/lib/utils";

/**
 * The quiz result: score and pass/fail.
 *
 * Shown right after submit. The score leads — a big number in a ring tinted by
 * outcome — with a lulus/belum-lulus badge, how many were correct, and the
 * passing grade for context. A pop as it lands marks the moment; retry rebuilds
 * a fresh randomised attempt via `onRetry`.
 */
export function QuizResult({
  result,
  passingGrade,
  onRetry,
}: {
  result: QuizResult;
  passingGrade: number;
  onRetry: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const { score, correct, total, lulus } = result;

  return (
    <div className="bg-card border-border flex flex-col items-center gap-5 rounded-xl border px-6 py-10 text-center">
      <motion.div
        initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={cn(
          "flex size-28 flex-col items-center justify-center rounded-full border-4",
          lulus
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-destructive/40 bg-destructive/10 text-destructive",
        )}
      >
        <span className="text-3xl font-bold tabular-nums">{score}</span>
        <span className="text-xs font-medium opacity-80">dari 100</span>
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
            lulus
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/15 text-destructive",
          )}
        >
          {lulus ? (
            <>
              <Trophy className="size-4" />
              Lulus
            </>
          ) : (
            <>
              <XCircle className="size-4" />
              Belum Lulus
            </>
          )}
        </span>
        <p className="text-muted-foreground text-sm text-pretty">
          Kamu menjawab benar{" "}
          <span className="text-foreground font-semibold tabular-nums">
            {correct} dari {total}
          </span>{" "}
          soal. Nilai lulus minimal {passingGrade}.
        </p>
        {!lulus && (
          <p className="text-muted-foreground text-xs text-pretty">
            Pelajari kembali materi lalu coba lagi — soal akan diacak ulang.
          </p>
        )}
      </div>

      <Button onClick={onRetry} variant={lulus ? "outline" : "default"}>
        <RotateCcw />
        Ulangi Quiz
      </Button>
    </div>
  );
}
