"use client";

import { useRef, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Trash2,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toaster";
import {
  ACCEPT_ATTR,
  formatBytes,
  getExtension,
  MAX_UPLOAD_BYTES,
  sizeRatio,
  validateUpload,
} from "@/lib/upload/config";
import type { UploadItem } from "@/lib/upload/types";
import { usePeserta } from "@/hooks/use-peserta";
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
  const { peserta } = usePeserta();

  const [selected, setSelected] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState<UploadItem[]>([]);

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
    setError(null);
    setUploading(true);
    setProgress(0);

    // XMLHttpRequest (not fetch) so the progress bar tracks the real upload.
    const form = new FormData();
    form.append("file", selected);
    // Include peserta identity as a fallback in case the server cookie is gone.
    if (peserta) {
      form.append("nama", peserta.nama);
      form.append("email", peserta.email);
      form.append("lokasi", peserta.lokasi);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/kirim-latihan/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(event.loaded / event.total);
    };

    xhr.onload = () => {
      setUploading(false);
      setProgress(0);

      if (xhr.status === 201) {
        try {
          const { upload: saved } = JSON.parse(xhr.responseText) as {
            upload: {
              id: string;
              fileName: string;
              fileSize: number;
              fileExt: string;
              waktuUnggah: string;
              status: UploadItem["status"];
              urlBerkas: string;
            };
          };
          const item: UploadItem = {
            id: saved.id,
            name: saved.fileName,
            size: saved.fileSize,
            ext: saved.fileExt,
            waktuUnggah: saved.waktuUnggah,
            status: saved.status,
            url: saved.urlBerkas,
          };
          setItems((current) => [item, ...current]);
          setSelected(null);
          if (inputRef.current) inputRef.current.value = "";
          toast({
            title: "Berkas berhasil dikirim",
            description: item.name,
            variant: "success",
          });
        } catch {
          setError("Respons server tidak dapat dibaca.");
        }
        return;
      }

      let message = "Gagal mengunggah berkas.";
      if (xhr.status === 403) {
        message = "Isi daftar hadir dulu sebelum mengunggah.";
      } else {
        try {
          message = (JSON.parse(xhr.responseText) as { error?: string }).error ?? message;
        } catch {
          // keep the default message
        }
      }
      setError(message);
      toast({ title: "Gagal mengunggah", description: message, variant: "error" });
    };

    xhr.onerror = () => {
      setUploading(false);
      setProgress(0);
      const message = "Tidak dapat terhubung ke server.";
      setError(message);
      toast({ title: "Gagal mengunggah", description: message, variant: "error" });
    };

    xhr.send(form);
  }

  function remove(id: string) {
    const target = items.find((item) => item.id === id);
    setItems((current) => current.filter((item) => item.id !== id));
    if (target) {
      toast({ title: "Berkas dihapus", description: target.name, variant: "info" });
    }
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
          onChange={(event) => pick(event.target.files?.[0])}
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
