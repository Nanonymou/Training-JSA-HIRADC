import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { QuizGate } from "@/components/quiz/quiz-gate";

export const metadata: Metadata = {
  title: "Quiz Pelatihan — Training JSA & HIRADC",
  description:
    "Uji pemahaman JSA & HIRADC dengan 10 soal pilihan ganda. Terbuka setelah mengisi Daftar Hadir.",
};

/**
 * The Quiz screen.
 *
 * Prerequisite-gated: the page provides the framing and defers the lock check,
 * flow, and questions to the gate, which reads whether the Daftar Hadir has been
 * signed on the client.
 */
export default function QuizPage() {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="bg-card border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Link
          href="/"
          className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px]"
        >
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <GraduationCap className="size-4.5" />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            Training JSA &amp; HIRADC
          </span>
        </Link>
        <span className="text-muted-foreground text-sm font-medium">
          Quiz Pelatihan
        </span>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Quiz Pelatihan
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Uji pemahamanmu tentang penyusunan dan pengisian JSA &amp; HIRADC.
          </p>
        </div>

        <QuizGate />
      </main>
    </div>
  );
}
