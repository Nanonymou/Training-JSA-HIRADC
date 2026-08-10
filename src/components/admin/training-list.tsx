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

export interface TrainingItem {
  id: string;
  judul: string;
  deskripsi: string;
  aktif: boolean;
  jumlahBab: number;
  archived: boolean;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/** Post a mutation, return the server's updated row (or throw). */
async function persist(
  action: string,
  payload: Record<string, unknown>,
): Promise<TrainingItem> {
  const res = await fetch("/api/admin/training", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { training: TrainingItem };
  return data.training;
}

/**
 * The admin multi-training list.
 *
 * Server-seeded from the training API; every add/edit/toggle/archive/restore
 * calls the API and updates from its response, so the list matches the DB and
 * changes survive a reload. Failures revert the optimistic UI and toast.
 */
export function TrainingList({
  initialItems,
}: {
  initialItems: TrainingItem[];
}) {
  const [items, setItems] = useState<TrainingItem[]>(initialItems);

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

  async function submitTraining(draft: TrainingDraft) {
    const target = editing;
    setFormOpen(false);
    setEditing(null);

    if (target) {
      const prev = items;
      setItems((current) =>
        current.map((item) =>
          item.id === target.id
            ? {
                ...item,
                judul: draft.judul,
                deskripsi: draft.deskripsi || item.deskripsi,
              }
            : item,
        ),
      );
      try {
        const training = await persist("update", {
          id: target.id,
          judul: draft.judul,
          deskripsi: draft.deskripsi,
        });
        setItems((current) =>
          current.map((i) =>
            i.id === target.id ? { ...i, ...training } : i,
          ),
        );
        toast({ title: "Training diperbarui", description: draft.judul, variant: "success" });
      } catch {
        setItems(prev);
        toast({ title: "Gagal memperbarui training", variant: "error" });
      }
      return;
    }

    try {
      const training = await persist("create", { ...draft });
      setItems((current) => [{ ...training, jumlahBab: 0 }, ...current]);
      toast({ title: "Training ditambahkan", description: draft.judul, variant: "success" });
    } catch {
      toast({ title: "Gagal menambah training", variant: "error" });
    }
  }

  async function toggle(id: string, aktif: boolean) {
    const item = items.find((i) => i.id === id);
    const prev = items;
    setItems((current) =>
      current.map((i) => (i.id === id ? { ...i, aktif } : i)),
    );
    try {
      await persist("toggle", { id, aktif });
      toast({
        title: aktif ? "Training diaktifkan" : "Training dinonaktifkan",
        description: item?.judul,
        variant: aktif ? "success" : "info",
      });
    } catch {
      setItems(prev);
      toast({ title: "Gagal mengubah status", variant: "error" });
    }
  }

  async function archive(item: TrainingItem) {
    const prev = items;
    setItems((current) =>
      current.map((i) =>
        i.id === item.id ? { ...i, archived: true, aktif: false } : i,
      ),
    );
    try {
      await persist("archive", { id: item.id });
      toast({ title: "Training diarsipkan", description: item.judul, variant: "info" });
    } catch {
      setItems(prev);
      toast({ title: "Gagal mengarsipkan training", variant: "error" });
    }
  }

  async function restore(item: TrainingItem) {
    const prev = items;
    setItems((current) =>
      current.map((i) => (i.id === item.id ? { ...i, archived: false } : i)),
    );
    try {
      await persist("restore", { id: item.id });
      toast({ title: "Training dipulihkan", description: item.judul, variant: "success" });
    } catch {
      setItems(prev);
      toast({ title: "Gagal memulihkan training", variant: "error" });
    }
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
