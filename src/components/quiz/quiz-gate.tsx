"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { QuizIntro } from "@/components/quiz/quiz-intro";
import { QuizLocked } from "@/components/quiz/quiz-locked";
import { QuizResult } from "@/components/quiz/quiz-result";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { Button } from "@/components/ui/button";
import { type QuizAttemptQuestion } from "@/lib/quiz/attempt";
import { QUIZ_CONFIG } from "@/lib/quiz/config";
import { type QuizResult as QuizResultData } from "@/lib/quiz/grade";
import { usePeserta } from "@/hooks/use-peserta";

type Stage = "intro" | "loading" | "running" | "submitted" | "error";

interface ServerQuestion {
  id: string;
  soal: string;
  pilihan: { id: string; label: string }[];
}

/**
 * The quiz's prerequisite gate and flow.
 *
 * No signed Daftar Hadir → the locked state. Otherwise it walks intro → runner →
 * result. Starting an attempt fetches a fresh random draw from the server so the
 * bank always reflects what admins have edited in Bank Soal (the correct answer
 * is withheld). Submitting posts the chosen option ids back to be graded and
 * recorded server-side.
 */
export function QuizGate() {
  const { peserta } = usePeserta();
  const [stage, setStage] = useState<Stage>("intro");
  const [attempt, setAttempt] = useState<QuizAttemptQuestion[]>([]);
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!peserta) {
    return <QuizLocked />;
  }

  async function start() {
    setStage("loading");
    setResult(null);
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/quiz/questions?count=${QUIZ_CONFIG.jumlahSoal}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        questions: ServerQuestion[];
      };
      const drawn = data.questions ?? [];
      if (drawn.length === 0) {
        setStage("error");
        setErrorMsg("Bank soal masih kosong. Hubungi admin.");
        return;
      }
      setAttempt(
        drawn.map((q) => ({
          id: q.id,
          soal: q.soal,
          pilihan: q.pilihan.map((p) => p.label),
          optionIds: q.pilihan.map((p) => p.id),
        })),
      );
      setStage("running");
    } catch {
      setStage("error");
      setErrorMsg(
        "Gagal memuat soal quiz. Cek koneksi atau coba lagi sebentar.",
      );
    }
  }

  async function handleSubmit(answers: Record<string, number>) {
    // Translate the selected option index to its stable id so the server can
    // grade by id (server never sent the client the kunci).
    const submitted = attempt
      .map((q) => {
        const idx = answers[q.id];
        const optionId = q.optionIds?.[idx];
        return optionId ? { questionId: q.id, optionId } : null;
      })
      .filter((v): v is { questionId: string; optionId: string } => v !== null);

    setStage("loading");
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: submitted,
          peserta: peserta && {
            nama: peserta.nama,
            email: peserta.email,
            jabatan: peserta.jabatan,
            lokasi: peserta.lokasi,
          },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const outcome = (await res.json()) as QuizResultData;
      setResult(outcome);
      setStage("submitted");
    } catch {
      setStage("error");
      setErrorMsg("Gagal mengirim jawaban. Coba lagi.");
    }
  }

  if (stage === "loading") {
    return (
      <div className="bg-card border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center text-sm">
        <Loader2 className="text-primary size-6 animate-spin" />
        Memuat…
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="bg-card border-border flex flex-col items-center gap-3 rounded-xl border p-6 text-center">
        <p className="text-sm">{errorMsg}</p>
        <Button size="sm" onClick={() => setStage("intro")}>
          Kembali
        </Button>
      </div>
    );
  }

  if (stage === "running") {
    return (
      <QuizRunner
        questions={attempt}
        onExit={() => setStage("intro")}
        onSubmit={handleSubmit}
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
