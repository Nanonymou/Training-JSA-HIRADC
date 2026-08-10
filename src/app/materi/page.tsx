import type { Metadata } from "next";

import { MateriShell } from "@/components/materi/materi-shell";
import { PesertaHeader } from "@/components/peserta-header";
import {
  getActiveTraining,
  getCurrentMateriVersion,
} from "@/lib/admin/cms-materi";
import { getMateriChapters } from "@/lib/materi/repository";

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export const metadata: Metadata = {
  title: "Materi Pelatihan — Training JSA & HIRADC",
  description:
    "Pelajari penyusunan dan pengisian JSA & HIRADC bab per bab, disajikan interaktif untuk Tim QHSE PT Tiga Persada Benua.",
};

/**
 * The Materi (training material) screen.
 *
 * Turns the JSA & HIRADC handbook into a browsable, chapter-based reader. The
 * page supplies the framing — brand row and a short intro — and hands the
 * chapter navigation and content to the shell, which manages the active chapter
 * on the client. Chapters are loaded server-side from the material repository
 * (the same source the /api/materi endpoint serves).
 */
export default async function MateriPage() {
  const chapters = await getMateriChapters();
  // The peserta view follows whichever training the CMS has marked active.
  const training = getActiveTraining();
  const judul = training?.judul ?? "Penyusunan dan Pengisian JSA & HIRADC";
  const deskripsi =
    training?.deskripsi ??
    "Materi pelatihan interaktif untuk Tim QHSE PT Tiga Persada Benua.";
  const version = getCurrentMateriVersion();

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <PesertaHeader page="Materi Pelatihan" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="mb-5 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{judul}</h1>
            {version && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                Versi {version.version}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm text-pretty">
            {deskripsi} Pilih bab di samping untuk mulai belajar.
          </p>
          {version && (
            <p className="text-muted-foreground text-xs">
              Materi diperbarui {formatTanggal(version.updatedAt)}.
            </p>
          )}
        </div>

        <MateriShell chapters={chapters} />
      </main>
    </div>
  );
}
