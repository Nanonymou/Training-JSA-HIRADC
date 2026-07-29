import {
  Award,
  FileUp,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";

import { getDashboardSummary } from "@/lib/admin/dashboard";

interface Tile {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
}

/**
 * The dashboard's headline tiles: total peserta, pass rate, average score, and
 * uploads. Four across on desktop, computed from the mock records.
 */
export function DashboardStats() {
  const summary = getDashboardSummary();

  const tiles: Tile[] = [
    {
      label: "Total Peserta",
      value: `${summary.totalPeserta}`,
      note: "terdaftar hadir",
      icon: Users,
    },
    {
      label: "Kelulusan",
      value: `${summary.kelulusan}%`,
      note: `${summary.lulus} peserta lulus`,
      icon: GraduationCap,
    },
    {
      label: "Rata-rata Nilai",
      value: `${summary.rataNilai}`,
      note: "dari 100",
      icon: Award,
    },
    {
      label: "Upload Latihan",
      value: `${summary.totalUpload}`,
      note: "berkas terkirim",
      icon: FileUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">{tile.label}</span>
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <tile.icon className="size-4" />
            </span>
          </div>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {tile.value}
          </span>
          {tile.note && (
            <span className="text-muted-foreground text-xs">{tile.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}
