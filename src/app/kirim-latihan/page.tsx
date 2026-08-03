import type { Metadata } from "next";

import { LatihanStatus } from "@/components/kirim-latihan/latihan-status";
import { PesertaHeader } from "@/components/peserta-header";
import { UploadForm } from "@/components/kirim-latihan/upload-form";

export const metadata: Metadata = {
  title: "Kirim Latihan — Training JSA & HIRADC",
  description:
    "Unggah berkas latihan JSA & HIRADC (DOC, DOCX, XLS, XLSX, PDF, maks 20 MB) untuk ditinjau admin.",
};

/**
 * The Kirim Latihan (upload) screen.
 *
 * Where a peserta submits their latihan file for review. The page supplies the
 * framing and hands the picking, validation, and submitted list to the form,
 * which runs on mock state for now; the Vercel Blob upload arrives in the backend
 * phase.
 */
export default function KirimLatihanPage() {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <PesertaHeader page="Kirim Latihan" />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Kirim Latihan</h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Unggah berkas latihanmu untuk ditinjau. Format yang didukung: DOC,
            DOCX, XLS, XLSX, PDF (maks 20 MB).
          </p>
        </div>

        <UploadForm />

        <div className="mt-8">
          <LatihanStatus />
        </div>
      </main>
    </div>
  );
}
