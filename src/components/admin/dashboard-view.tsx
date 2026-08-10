"use client";

import { useMemo, useState } from "react";

import { DashboardStats } from "@/components/admin/dashboard-stats";
import { LokasiBarChart } from "@/components/admin/lokasi-bar-chart";
import { LOKASI_ALL, LokasiFilter } from "@/components/admin/lokasi-filter";
import { ProgressLineChart } from "@/components/admin/progress-line-chart";
import { getDashboardSummary } from "@/lib/admin/dashboard";
import type { PesertaRecord } from "@/lib/admin/peserta";

/**
 * The interactive monitoring dashboard.
 *
 * Holds the site filter and recomputes the summary from it, so the headline
 * cards react to the selected location (Semua = all sites). Everything derives
 * from the DB-backed records passed in through the shared aggregate helper.
 */
export function DashboardView({ records }: { records: PesertaRecord[] }) {
  const [lokasi, setLokasi] = useState(LOKASI_ALL);

  const rows = useMemo(
    () =>
      lokasi === LOKASI_ALL
        ? records
        : records.filter((p) => p.lokasi === lokasi),
    [records, lokasi],
  );

  const summary = useMemo(() => getDashboardSummary(rows), [rows]);

  const focusLabel = lokasi === LOKASI_ALL ? "semua lokasi" : lokasi;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Menampilkan data{" "}
          <span className="text-foreground font-medium">{focusLabel}</span>.
        </p>
        <LokasiFilter id="dash-lokasi" value={lokasi} onChange={setLokasi} />
      </div>

      <DashboardStats summary={summary} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <LokasiBarChart activeLokasi={lokasi} records={records} />
        <ProgressLineChart rows={rows} />
      </div>
    </div>
  );
}
