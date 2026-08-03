import type { Metadata } from "next";

import { PesertaHeader } from "@/components/peserta-header";
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
      <PesertaHeader page="Daftar Hadir" />

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
