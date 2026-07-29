"use client";

import { useState } from "react";
import { BookOpen, Layers, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toaster";
import { TRAINING_MODULES } from "@/lib/admin/cms-materi";

interface TrainingItem {
  id: string;
  judul: string;
  deskripsi: string;
  aktif: boolean;
  jumlahBab: number;
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
    })),
  );

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {items.filter((i) => i.aktif).length} aktif dari {items.length} training
        </p>
        <Button size="sm">
          <Plus />
          Tambah Training
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
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
            <label className="flex shrink-0 flex-col items-center gap-1">
              <Switch
                checked={item.aktif}
                onCheckedChange={(value) => toggle(item.id, value)}
                aria-label={`Aktifkan ${item.judul}`}
              />
              <span className="text-muted-foreground text-xs">
                {item.aktif ? "Aktif" : "Nonaktif"}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
