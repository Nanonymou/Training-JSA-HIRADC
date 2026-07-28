import { CheckCircle2, ListChecks, Shuffle, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QUIZ_CONFIG } from "@/lib/quiz/config";

/**
 * The quiz start screen, shown once the Daftar Hadir unlocks it.
 *
 * Sets expectations before the peserta begins — how many questions, the passing
 * grade, and that order is randomised — then hands off to the runner via
 * `onStart`. The rules read from QUIZ_CONFIG so the copy can't drift from the
 * grading.
 */
export function QuizIntro({
  pesertaNama,
  onStart,
}: {
  pesertaNama: string;
  onStart: () => void;
}) {
  const rules = [
    {
      icon: ListChecks,
      text: `${QUIZ_CONFIG.jumlahSoal} soal pilihan ganda.`,
    },
    {
      icon: Target,
      text: `Nilai minimal ${QUIZ_CONFIG.passingGrade} untuk lulus.`,
    },
    {
      icon: Shuffle,
      text: "Urutan soal dan jawaban diacak setiap percobaan.",
    },
  ];

  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Siap mengerjakan quiz?
          </h2>
          <p className="text-muted-foreground text-sm">
            Halo {peserataOrDefault(pesertaNama)}, baca aturan berikut sebelum
            mulai.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {rules.map((rule) => (
          <li key={rule.text} className="flex items-center gap-3 text-sm">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <rule.icon className="size-4" />
            </span>
            {rule.text}
          </li>
        ))}
      </ul>

      <Button onClick={onStart} className="self-start">
        Mulai Quiz
      </Button>
    </div>
  );
}

/** Guard against an empty name so the greeting still reads naturally. */
function peserataOrDefault(nama: string): string {
  return nama.trim() || "Peserta";
}
