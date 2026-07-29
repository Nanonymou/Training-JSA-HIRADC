"use client";

import { useState } from "react";
import { Download, FileWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PreviewKind } from "@/lib/admin/latihan";

/**
 * Inline preview of an uploaded file.
 *
 * PDFs render in an embedded frame and images in an <img>; anything else (Office
 * docs) can't be shown inline, so it offers a download instead. If an inline
 * render fails to load, it falls back to the same download prompt rather than a
 * broken frame. A download / open-in-new-tab link is always available.
 */
export function FilePreview({
  url,
  fileName,
  previewKind,
}: {
  url: string;
  fileName: string;
  previewKind: PreviewKind;
}) {
  const [failed, setFailed] = useState(false);

  const downloadable = (
    <a href={url} download={fileName} target="_blank" rel="noreferrer">
      <Button variant="outline" size="sm">
        <Download />
        Unduh berkas
      </Button>
    </a>
  );

  if (previewKind === "unsupported" || failed) {
    return (
      <div className="bg-muted/40 flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg p-6 text-center">
        <FileWarning className="text-muted-foreground size-8" />
        <p className="text-muted-foreground text-sm text-pretty">
          {failed
            ? "Berkas tidak dapat dimuat untuk pratinjau."
            : "Format ini tidak bisa dipratinjau langsung."}
        </p>
        {downloadable}
      </div>
    );
  }

  if (previewKind === "image") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="bg-muted/40 flex max-h-[70dvh] w-full items-center justify-center overflow-auto rounded-lg p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Pratinjau ${fileName}`}
            className="max-h-[66dvh] max-w-full rounded object-contain"
            onError={() => setFailed(true)}
          />
        </div>
        {downloadable}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <object
        data={url}
        type="application/pdf"
        className="bg-muted/40 h-[70dvh] w-full rounded-lg"
        aria-label={`Pratinjau ${fileName}`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <FileWarning className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">
            Browser tidak dapat menampilkan PDF di sini.
          </p>
          {downloadable}
        </div>
      </object>
      {downloadable}
    </div>
  );
}
