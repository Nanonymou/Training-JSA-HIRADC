import type { Metadata } from "next";

import { PesertaHeader } from "@/components/peserta-header";
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
      <PesertaHeader page="Quiz Pelatihan" />

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
