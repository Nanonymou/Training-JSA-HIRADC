"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";

import { SoalForm } from "@/components/admin/soal-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";
import type { SoalDraft } from "@/lib/admin/soal-draft";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface SoalItem extends SoalDraft {
  id: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}`;
}

/**
 * The admin bank soal list with add/edit/delete on mock state.
 *
 * Renders every question with its options (the correct one marked). Add opens the
 * form blank; a question's edit opens it seeded from that question; both save into
 * the in-memory list ahead of a real API. Delete removes it. The correct-answer
 * highlight and the shared SoalForm keep create and edit consistent.
 */
export function BankSoalList() {
  const [items, setItems] = useState<SoalItem[]>(() =>
    QUIZ_QUESTIONS.map((q) => ({
      id: q.id,
      soal: q.soal,
      pilihan: q.pilihan,
      kunci: q.kunci,
    })),
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SoalItem | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: SoalItem) {
    setEditing(item);
    setFormOpen(true);
  }

  function submit(draft: SoalDraft) {
    if (editing) {
      setItems((current) =>
        current.map((item) =>
          item.id === editing.id ? { ...item, ...draft } : item,
        ),
      );
      toast({ title: "Soal diperbarui", variant: "success" });
    } else {
      setItems((current) => [{ id: newId(), ...draft }, ...current]);
      toast({ title: "Soal ditambahkan", variant: "success" });
    }
    setFormOpen(false);
    setEditing(null);
  }

  function remove(item: SoalItem) {
    setItems((current) => current.filter((i) => i.id !== item.id));
    toast({ title: "Soal dihapus", variant: "info" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{items.length} soal</p>
        <Button size="sm" onClick={openAdd}>
          <Plus />
          Tambah Soal
        </Button>
      </div>

      <ol className="flex flex-col gap-3">
        {items.map((question, index) => (
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
                  aria-label={`Hapus soal ${index + 1}`}
                  onClick={() => remove(question)}
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
              initial={
                editing
                  ? {
                      soal: editing.soal,
                      pilihan: editing.pilihan,
                      kunci: editing.kunci,
                    }
                  : undefined
              }
              onSubmit={submit}
              onCancel={() => setFormOpen(false)}
              submitLabel={editing ? "Simpan Perubahan" : "Tambah Soal"}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
