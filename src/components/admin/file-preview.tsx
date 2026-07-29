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
 * broken frame. The preview fills its container (`h-full`) so the modal can size
 * it to the viewport; a download / open-in-new-tab link is always available.
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
    <a
      href={url}
      download={fileName}
      target="_blank"
      rel="noreferrer"
      className="shrink-0"
    >
      <Button variant="outline" size="sm">
        <Download />
        Unduh berkas
      </Button>
    </a>
  );

  if (previewKind === "unsupported" || failed) {
    return (
      <div className="bg-muted/40 flex h-full min-h-52 flex-col items-center justify-center gap-3 rounded-lg p-6 text-center">
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
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="bg-muted/40 flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-lg p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Pratinjau ${fileName}`}
            className="max-h-full max-w-full rounded object-contain"
            onError={() => setFailed(true)}
          />
        </div>
        <div className="flex justify-center">{downloadable}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <object
        data={url}
        type="application/pdf"
        className="bg-muted/40 min-h-0 w-full flex-1 rounded-lg"
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
      <div className="flex justify-center">{downloadable}</div>
    </div>
  );
}
