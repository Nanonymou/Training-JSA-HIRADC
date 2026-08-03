"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { SoalForm } from "@/components/admin/soal-form";
import {
  CATEGORY_ALL,
  SoalCategorySelect,
} from "@/components/admin/soal-category-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import type { SoalDraft } from "@/lib/admin/soal-draft";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export interface SoalItem extends SoalDraft {
  id: string;
}

/**
 * The admin bank soal list with add/edit/delete, persisted via the API.
 *
 * Seeded from the database (passed in from the server page), it renders every
 * question with its options (the correct one marked) and saves each change to the
 * bank-soal API so it sticks — add (POST), edit (PUT), duplicate, and delete all
 * hit the server, updating optimistically and reverting on failure. The
 * correct-answer highlight and the shared SoalForm keep create and edit consistent.
 */
export function BankSoalList({ initialItems }: { initialItems: SoalItem[] }) {
  const [items, setItems] = useState<SoalItem[]>(initialItems);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SoalItem | null>(null);
  const [deleting, setDeleting] = useState<SoalItem | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(CATEGORY_ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== CATEGORY_ALL && item.kategori !== category) return false;
      if (!q) return true;
      return (
        item.soal.toLowerCase().includes(q) ||
        item.pilihan.some((option) => option.toLowerCase().includes(q))
      );
    });
  }, [items, query, category]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: SoalItem) {
    setEditing(item);
    setFormOpen(true);
  }

  const JSON_HEADERS = { "Content-Type": "application/json" };

  async function submit(draft: SoalDraft) {
    const target = editing;
    setFormOpen(false);
    setEditing(null);

    if (target) {
      const prev = items;
      setItems((current) =>
        current.map((item) =>
          item.id === target.id ? { ...item, ...draft } : item,
        ),
      );
      try {
        const res = await fetch(`/api/admin/bank-soal/${target.id}`, {
          method: "PUT",
          headers: JSON_HEADERS,
          body: JSON.stringify(draft),
        });
        if (!res.ok) throw new Error();
        toast({ title: "Soal diperbarui", variant: "success" });
      } catch {
        setItems(prev);
        toast({ title: "Gagal memperbarui soal", variant: "error" });
      }
      return;
    }

    try {
      const res = await fetch("/api/admin/bank-soal", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error();
      const { soal } = (await res.json()) as { soal: { id: string } };
      setItems((current) => [{ id: soal.id, ...draft }, ...current]);
      toast({ title: "Soal ditambahkan", variant: "success" });
    } catch {
      toast({ title: "Gagal menambah soal", variant: "error" });
    }
  }

  async function duplicate(item: SoalItem) {
    try {
      const res = await fetch(`/api/admin/bank-soal/${item.id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const { soal } = (await res.json()) as { soal: { id: string } };
      setItems((current) => {
        const index = current.findIndex((i) => i.id === item.id);
        const copy: SoalItem = {
          ...item,
          id: soal.id,
          soal: `${item.soal} (salinan)`,
          pilihan: [...item.pilihan],
        };
        const next = [...current];
        next.splice(index + 1, 0, copy);
        return next;
      });
      toast({ title: "Soal diduplikasi", variant: "info" });
    } catch {
      toast({ title: "Gagal menduplikasi soal", variant: "error" });
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const id = deleting.id;
    const prev = items;
    setItems((current) => current.filter((i) => i.id !== id));
    setDeleting(null);
    try {
      const res = await fetch(`/api/admin/bank-soal/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Soal dihapus", variant: "info" });
    } catch {
      setItems(prev);
      toast({ title: "Gagal menghapus soal", variant: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari soal atau jawaban…"
            aria-label="Cari soal"
            className="pl-8"
          />
        </div>
        <SoalCategorySelect
          value={category}
          onChange={setCategory}
          includeAll
          className="sm:w-48"
          id="filter-kategori"
        />
        <Button size="sm" onClick={openAdd} className="sm:shrink-0">
          <Plus />
          Tambah Soal
        </Button>
      </div>

      <p className="text-muted-foreground text-xs">
        Menampilkan {filtered.length} dari {items.length} soal.
      </p>

      {filtered.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground rounded-xl border px-4 py-12 text-center text-sm">
          Tidak ada soal yang cocok.
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {filtered.map((question, index) => (
          <li
            key={question.id}
            className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">
                <span className="text-muted-foreground mr-1.5 tabular-nums">
                  {index + 1}.
                </span>
                {question.soal}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <span className="bg-primary/10 text-primary mr-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                  {question.kategori}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Sunting soal ${index + 1}`}
                  onClick={() => openEdit(question)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Duplikat soal ${index + 1}`}
                  onClick={() => duplicate(question)}
                >
                  <Copy />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Hapus soal ${index + 1}`}
                  onClick={() => setDeleting(question)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {question.pilihan.map((option, optionIndex) => {
                const correct = optionIndex === question.kunci;
                return (
                  <li
                    key={optionIndex}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
                      correct
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded text-xs font-semibold",
                        correct
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {correct ? <Check className="size-3" /> : LETTERS[optionIndex]}
                    </span>
                    <span className="text-pretty">{option}</span>
                  </li>
                );
              })}
            </ul>
            </li>
          ))}
        </ol>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sunting Soal" : "Tambah Soal"}
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SoalForm
              key={editing?.id ?? "new"}
              initial={editing ?? undefined}
              onSubmit={submit}
              onCancel={() => setFormOpen(false)}
              submitLabel={editing ? "Simpan Perubahan" : "Tambah Soal"}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus soal?</DialogTitle>
            <DialogDescription className="text-pretty">
              Soal ini akan dihapus dari bank. Tindakan ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {deleting && (
            <p className="text-foreground/90 bg-muted/40 rounded-lg px-3 py-2 text-sm text-pretty">
              {deleting.soal}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleting(null)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              <Trash2 />
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
