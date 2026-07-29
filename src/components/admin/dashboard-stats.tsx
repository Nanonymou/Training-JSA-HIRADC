import {
  Award,
  FileUp,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";

import { SummaryCard } from "@/components/admin/summary-card";
import { getDashboardSummary } from "@/lib/admin/dashboard";

interface Tile {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
}

/**
 * The dashboard's headline row: total peserta, pass rate, average score, and
 * uploads — computed from the mock records and laid out as summary cards.
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
        <SummaryCard
          key={tile.label}
          label={tile.label}
          value={tile.value}
          note={tile.note}
          icon={tile.icon}
        />
      ))}
    </div>
  );
}
