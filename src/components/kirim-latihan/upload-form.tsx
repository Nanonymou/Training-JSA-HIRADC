"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Trash2,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ACCEPT_ATTR,
  formatBytes,
  getExtension,
  MAX_UPLOAD_BYTES,
  sizeRatio,
  validateUpload,
} from "@/lib/upload/config";
import type { UploadItem } from "@/lib/upload/types";
import { cn } from "@/lib/utils";

/** Spreadsheet vs document icon by extension. */
function iconFor(ext: string): LucideIcon {
  return ext === "xls" || ext === "xlsx" ? FileSpreadsheet : FileText;
}

function formatWaktu(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * The Kirim Latihan uploader (mock state).
 *
 * Pick or drop a file, validate its type and size against the limits, then
 * "upload" it — a simulated progress bar standing in for the Vercel Blob upload
 * to come — and it joins the submitted list with a success note. Everything runs
 * on in-memory mock state for this task; the backend phase stores the file and
 * the record.
 */
export function UploadForm() {
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [justSent, setJustSent] = useState<string | null>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    const message = validateUpload(file);
    if (message) {
      setError(message);
      setSelected(null);
      return;
    }
    setError(null);
    setSelected(file);
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    setJustSent(null);
    const dropped = event.dataTransfer.files;
    if (dropped.length > 1) {
      setSelected(null);
      setError("Kirim satu berkas saja.");
      return;
    }
    pick(dropped[0]);
  }

  function upload() {
    if (!selected || uploading) return;
    setUploading(true);
    setProgress(0);

    // Simulate the upload progressing to completion.
    const timer = setInterval(() => {
      setProgress((current) => {
        const next = current + 0.12;
        if (next >= 1) {
          clearInterval(timer);
          finish();
          return 1;
        }
        return next;
      });
    }, 120);
  }

  function finish() {
    const file = selected;
    if (!file) return;
    const item: UploadItem = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      name: file.name,
      size: file.size,
      ext: getExtension(file.name),
      waktuUnggah: new Date().toISOString(),
      status: "Pending",
    };
    setItems((current) => [item, ...current]);
    setSelected(null);
    setUploading(false);
    setProgress(0);
    setJustSent(item.name);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Dropzone */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-xl border border-dashed p-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-card",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          onChange={(event) => {
            setJustSent(null);
            pick(event.target.files?.[0]);
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
            <UploadCloud className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              Tarik berkas ke sini, atau
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mx-auto"
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              Pilih File
            </Button>
          </div>
          <p className="text-muted-foreground text-xs text-pretty">
            DOC, DOCX, XLS, XLSX, atau PDF · maks {formatBytes(MAX_UPLOAD_BYTES)}
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      {/* Selected file + upload action */}
      {selected && (
        <div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              {(() => {
                const Icon = iconFor(getExtension(selected.name));
                return <Icon className="size-4.5" />;
              })()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selected.name}</p>
              <p className="text-muted-foreground text-xs">
                {formatBytes(selected.size)}
              </p>
            </div>
            {!uploading && (
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Batal
              </Button>
            )}
          </div>

          {!uploading && (
            <div className="flex flex-col gap-1">
              <Progress
                value={sizeRatio(selected.size)}
                aria-label="Ukuran berkas terhadap batas"
              />
              <p className="text-muted-foreground text-xs tabular-nums">
                {formatBytes(selected.size)} dari {formatBytes(MAX_UPLOAD_BYTES)}
              </p>
            </div>
          )}

          {uploading ? (
            <div className="flex flex-col gap-1.5">
              <Progress value={progress} aria-label="Mengunggah berkas" />
              <p className="text-muted-foreground text-xs tabular-nums">
                Mengunggah… {Math.round(progress * 100)}%
              </p>
            </div>
          ) : (
            <Button onClick={upload} className="self-start">
              <UploadCloud />
              Unggah Sekarang
            </Button>
          )}
        </div>
      )}

      {/* Success confirmation */}
      {justSent && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          Berkas <span className="font-medium">{justSent}</span> berhasil
          dikirim.
        </div>
      )}

      {/* Submitted list */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-tight">
            Berkas Terkirim ({items.length})
          </p>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const Icon = iconFor(item.ext);
                return (
                  <motion.li
                    key={item.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border-border flex items-center gap-3 rounded-xl border p-3"
                  >
                    <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatBytes(item.size)} · {formatWaktu(item.waktuUnggah)}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      {item.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Hapus ${item.name}`}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 />
                    </Button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}
