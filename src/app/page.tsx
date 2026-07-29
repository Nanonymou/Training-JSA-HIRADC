import Link from "next/link";
import { ArrowRight, BookOpen, Layers, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getActiveTrainings } from "@/lib/admin/cms-materi";

/**
 * Landing page for the training portal.
 *
 * A hero for the JSA & HIRADC training that routes into the material. Kept
 * deliberately small — this fresh project ships the Materi screen first; the
 * remaining menus (Daftar Hadir, Quiz, Upload Latihan, Data Peserta) land in
 * later phases.
 */
export default function Home() {
  const trainings = getActiveTrainings();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <span className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-2xl">
        <ShieldCheck className="size-7" />
      </span>

      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Training Penyusunan dan Pengisian JSA &amp; HIRADC
        </h1>
        <p className="text-muted-foreground text-base text-pretty sm:text-lg">
          PT Tiga Persada Benua — Catering and Associated Service. Portal
          pelatihan interaktif untuk Tim QHSE: pelajari konsep, penyusunan, dan
          pengisian dokumen JSA &amp; HIRADC sesuai standar perusahaan.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/materi">
            Mulai Training
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/materi">
            <BookOpen />
            Lihat Materi
          </Link>
        </Button>
      </div>

      {trainings.length > 0 && (
        <div className="flex w-full max-w-2xl flex-col gap-3">
          <p className="text-muted-foreground text-sm font-medium">
            Pilih training
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trainings.map((training) => (
              <Link
                key={training.id}
                href="/materi"
                className="bg-card border-border hover:border-primary/40 flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors"
              >
                <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                  <BookOpen className="size-4.5" />
                </span>
                <span className="text-sm font-semibold tracking-tight text-pretty">
                  {training.judul}
                </span>
                <span className="text-muted-foreground line-clamp-2 text-xs text-pretty">
                  {training.deskripsi}
                </span>
                <span className="text-muted-foreground mt-1 inline-flex items-center gap-1.5 text-xs">
                  <Layers className="size-3.5" />
                  {training.jumlahBab} bab
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
