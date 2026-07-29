import { CheckCircle2, FileText } from "lucide-react";

import { CONVERSION_PREVIEW, type ConvertedChapter } from "@/lib/admin/cms-materi";

/**
 * Preview of a converted DOCX — the interactive chapters it produced.
 *
 * Lets the admin verify the structure (chapters and their sections) before
 * saving the material. Presentational: the parent supplies the converted
 * chapters; defaults to the sample so it can be shown standalone.
 */
export function ConversionResult({
  chapters = CONVERSION_PREVIEW,
}: {
  chapters?: ConvertedChapter[];
}) {
  const totalSections = chapters.reduce((sum, c) => sum + c.sections.length, 0);

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-sm font-semibold tracking-tight">Hasil Konversi</p>
          <p className="text-muted-foreground text-xs">
            {chapters.length} bab · {totalSections} bagian terdeteksi
          </p>
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {chapters.map((chapter, index) => (
          <li
            key={chapter.id}
            className="border-border/60 flex gap-3 rounded-lg border p-3"
          >
            <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{chapter.title}</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {chapter.sections.map((section) => (
                  <li
                    key={section}
                    className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
                  >
                    <FileText className="size-3" />
                    {section}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
