"use client";

import { useState } from "react";
import { FileUp, GraduationCap, MapPin, type LucideIcon } from "lucide-react";

import { LaporanKelulusan } from "@/components/admin/laporan-kelulusan";
import type { PesertaRecord } from "@/lib/admin/peserta";
import { cn } from "@/lib/utils";

type TabId = "kelulusan" | "pengumpulan" | "lokasi";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "kelulusan", label: "Kelulusan Quiz", icon: GraduationCap },
  { id: "pengumpulan", label: "Pengumpulan Latihan", icon: FileUp },
  { id: "lokasi", label: "Rekap per Lokasi", icon: MapPin },
];

/**
 * The Laporan (reports) shell: a tab bar over the report panels.
 *
 * Holds the active tab; each panel's table, chart, and export land in later
 * tasks, so the panels are placeholders here. The tab list is keyboard- and
 * screen-reader-friendly (role="tab"/"tabpanel").
 */
export function LaporanTabs({ records }: { records: PesertaRecord[] }) {
  const [active, setActive] = useState<TabId>("kelulusan");

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Jenis laporan"
        className="border-border flex gap-1 overflow-x-auto border-b"
      >
        {TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "focus-visible:ring-ring/50 -mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px]",
                selected
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
        >
          {tab.id === active &&
            (tab.id === "kelulusan" ? (
              <LaporanKelulusan records={records} />
            ) : (
              <div className="bg-card border-border text-muted-foreground rounded-xl border px-4 py-16 text-center text-sm">
                Laporan {tab.label.toLowerCase()} akan tampil di sini.
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
