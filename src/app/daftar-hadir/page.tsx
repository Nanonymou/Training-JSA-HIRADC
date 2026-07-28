import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { RegistrationForm } from "@/components/daftar-hadir/registration-form";

export const metadata: Metadata = {
  title: "Daftar Hadir — Training JSA & HIRADC",
  description:
    "Isi daftar hadir (nama, email, jabatan, lokasi) untuk mencatat kehadiran dan membuka akses quiz pelatihan JSA & HIRADC.",
};

/**
 * The Daftar Hadir (attendance) screen.
 *
 * The gate before the quiz: the peserta records their identity here, the system
 * timestamps it, and that registration unlocks the quiz. The page supplies the
 * framing and a short intro; the form owns the fields, validation, and the
 * confirmation state.
 */
export default function DaftarHadirPage() {
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
          Daftar Hadir
        </span>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Daftar Hadir</h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Lengkapi data kehadiranmu terlebih dahulu. Setelah tersimpan, menu
            Quiz akan terbuka.
          </p>
        </div>

        <RegistrationForm />
      </main>
    </div>
  );
}
