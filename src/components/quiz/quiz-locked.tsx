import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The quiz's locked state.
 *
 * Shown when there's no signed Daftar Hadir yet: the quiz is a prerequisite-gated
 * menu, so instead of the questions the peserta sees why it's locked and a direct
 * way to unlock it.
 */
export function QuizLocked() {
  return (
    <div className="bg-card border-border flex flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center">
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <Lock className="size-6" />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-base font-semibold tracking-tight">
          Quiz masih terkunci
        </h2>
        <p className="text-muted-foreground text-sm text-pretty">
          Kamu perlu mengisi Daftar Hadir terlebih dahulu. Setelah kehadiran
          tercatat, menu Quiz akan otomatis terbuka.
        </p>
      </div>
      <Button asChild>
        <Link href="/daftar-hadir">
          Isi Daftar Hadir
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
