import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Landing page for the training portal.
 *
 * A hero for the JSA & HIRADC training that routes into the material. Kept
 * deliberately small — this fresh project ships the Materi screen first; the
 * remaining menus (Daftar Hadir, Quiz, Upload Latihan, Data Peserta) land in
 * later phases.
 */
export default function Home() {
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
    </main>
  );
}
