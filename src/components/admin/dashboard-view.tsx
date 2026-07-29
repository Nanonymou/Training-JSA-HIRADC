"use client";

import { useMemo, useState } from "react";

import { DashboardStats } from "@/components/admin/dashboard-stats";
import { LokasiBarChart } from "@/components/admin/lokasi-bar-chart";
import { LOKASI_ALL, LokasiFilter } from "@/components/admin/lokasi-filter";
import { ProgressLineChart } from "@/components/admin/progress-line-chart";
import { getDashboardSummary } from "@/lib/admin/dashboard";
import { PESERTA_RECORDS } from "@/lib/admin/peserta";

/**
 * The interactive monitoring dashboard.
 *
 * Holds the site filter and recomputes the summary from it, so the headline
 * cards react to the selected location (Semua = all sites). Everything derives
 * from the mock records through the shared aggregate helper; the cards stay
 * presentational.
 */
export function DashboardView() {
  const [lokasi, setLokasi] = useState(LOKASI_ALL);

  const rows = useMemo(
    () =>
      lokasi === LOKASI_ALL
        ? PESERTA_RECORDS
        : PESERTA_RECORDS.filter((p) => p.lokasi === lokasi),
    [lokasi],
  );

  const summary = useMemo(() => getDashboardSummary(rows), [rows]);

  return (
    <div className="flex flex-col gap-4">
      <LokasiFilter id="dash-lokasi" value={lokasi} onChange={setLokasi} />
      <DashboardStats summary={summary} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LokasiBarChart activeLokasi={lokasi} />
        <ProgressLineChart rows={rows} />
      </div>
    </div>
  );
}
