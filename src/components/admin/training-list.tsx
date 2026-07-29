"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  Layers,
  Pencil,
  Plus,
} from "lucide-react";

import { TrainingForm, type TrainingDraft } from "@/components/admin/training-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toaster";
import { TRAINING_MODULES } from "@/lib/admin/cms-materi";

interface TrainingItem {
  id: string;
  judul: string;
  deskripsi: string;
  aktif: boolean;
  jumlahBab: number;
  archived: boolean;
}

/**
 * The admin multi-training list.
 *
 * Every training topic with an active toggle so more than one training can be
 * offered — activating/deactivating updates the mock state with a toast. Add and
 * the create form land in later tasks.
 */
export function TrainingList() {
  const [items, setItems] = useState<TrainingItem[]>(() =>
    TRAINING_MODULES.map((m) => ({
      id: m.id,
      judul: m.judul,
      deskripsi: m.deskripsi,
      aktif: m.aktif,
      jumlahBab: m.jumlahBab,
      archived: false,
    })),
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingItem | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: TrainingItem) {
    setEditing(item);
    setFormOpen(true);
  }

  function submitTraining(draft: TrainingDraft) {
    if (editing) {
      setItems((current) =>
        current.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                judul: draft.judul,
                deskripsi: draft.deskripsi || item.deskripsi,
              }
            : item,
        ),
      );
      toast({ title: "Training diperbarui", description: draft.judul, variant: "success" });
    } else {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`;
      setItems((current) => [
        {
          id,
          judul: draft.judul,
          deskripsi: draft.deskripsi || "Belum ada deskripsi.",
          aktif: false,
          jumlahBab: 0,
          archived: false,
        },
        ...current,
      ]);
      toast({ title: "Training ditambahkan", description: draft.judul, variant: "success" });
    }
    setFormOpen(false);
    setEditing(null);
  }

  function toggle(id: string, aktif: boolean) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, aktif } : item)),
    );
    const item = items.find((i) => i.id === id);
    toast({
      title: aktif ? "Training diaktifkan" : "Training dinonaktifkan",
      description: item?.judul,
      variant: aktif ? "success" : "info",
    });
  }

  function archive(item: TrainingItem) {
    setItems((current) =>
      current.map((i) =>
        i.id === item.id ? { ...i, archived: true, aktif: false } : i,
      ),
    );
    toast({ title: "Training diarsipkan", description: item.judul, variant: "info" });
  }

  function restore(item: TrainingItem) {
    setItems((current) =>
      current.map((i) => (i.id === item.id ? { ...i, archived: false } : i)),
    );
    toast({ title: "Training dipulihkan", description: item.judul, variant: "success" });
  }

  const activeItems = useMemo(
    () => items.filter((i) => !i.archived),
    [items],
  );
  const archivedItems = useMemo(
    () => items.filter((i) => i.archived),
    [items],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {activeItems.filter((i) => i.aktif).length} aktif dari{" "}
          {activeItems.length} training
        </p>
        <Button size="sm" onClick={openAdd}>
          <Plus />
          Tambah Training
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {activeItems.map((item) => (
          <li
            key={item.id}
            className="bg-card border-border flex items-start gap-3 rounded-xl border p-4"
          >
            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <BookOpen className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.judul}</p>
              <p className="text-muted-foreground mt-0.5 text-sm text-pretty">
                {item.deskripsi}
              </p>
              <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                <Layers className="size-3.5" />
                {item.jumlahBab} bab
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Sunting ${item.judul}`}
                onClick={() => openEdit(item)}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Arsipkan ${item.judul}`}
                onClick={() => archive(item)}
              >
                <Archive />
              </Button>
              <label className="flex flex-col items-center gap-1">
                <Switch
                  checked={item.aktif}
                  onCheckedChange={(value) => toggle(item.id, value)}
                  aria-label={`Aktifkan ${item.judul}`}
                />
                <span className="text-muted-foreground text-xs">
                  {item.aktif ? "Aktif" : "Nonaktif"}
                </span>
              </label>
            </div>
          </li>
        ))}
      </ul>

      {archivedItems.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium">
            Diarsipkan ({archivedItems.length})
          </p>
          <ul className="flex flex-col gap-2">
            {archivedItems.map((item) => (
              <li
                key={item.id}
                className="border-border flex items-center gap-3 rounded-xl border border-dashed p-3"
              >
                <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
                  {item.judul}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => restore(item)}
                >
                  <ArchiveRestore />
                  Pulihkan
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sunting Training" : "Tambah Training"}
            </DialogTitle>
          </DialogHeader>
          <TrainingForm
            key={editing?.id ?? "new"}
            initial={
              editing
                ? { judul: editing.judul, deskripsi: editing.deskripsi }
                : undefined
            }
            onSubmit={submitTraining}
            onCancel={() => setFormOpen(false)}
            submitLabel={editing ? "Simpan Perubahan" : "Tambah Training"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
