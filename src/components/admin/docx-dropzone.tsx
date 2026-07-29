"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes, getExtension } from "@/lib/upload/config";
import { cn } from "@/lib/utils";

const MAX_DOCX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED = ["docx", "doc"];

function validate(file: File): string | null {
  if (!ALLOWED.includes(getExtension(file.name))) {
    return "Hanya berkas DOCX atau DOC.";
  }
  if (file.size === 0) return "File kosong.";
  if (file.size > MAX_DOCX_BYTES) {
    return `Ukuran melebihi ${formatBytes(MAX_DOCX_BYTES)}.`;
  }
  return null;
}

/**
 * A drag-or-pick area for a DOCX material file (controlled).
 *
 * The admin's entry point for a training's source document — accepts DOC/DOCX,
 * validates type and size, and reports the chosen file up via `onChange`. Shows
 * the selected file with a remove control. Presentational: the parent decides
 * what to do with the file (upload, parse into chapters).
 */
export function DocxDropzone({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(next: File | undefined) {
    if (!next) return;
    const message = validate(next);
    if (message) {
      setError(message);
      onChange(null);
      return;
    }
    setError(null);
    onChange(next);
  }

  if (file) {
    return (
      <div className="bg-card border-border flex items-center gap-3 rounded-xl border p-3">
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <FileText className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-muted-foreground text-xs">
            {formatBytes(file.size)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Hapus berkas"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pick(event.dataTransfer.files[0]);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-card",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".doc,.docx"
          className="sr-only"
          onChange={(event) => pick(event.target.files?.[0])}
        />
        <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
          <UploadCloud className="size-5" />
        </span>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium">Tarik dokumen materi ke sini</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Pilih DOCX
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          DOC atau DOCX · maks {formatBytes(MAX_DOCX_BYTES)}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
