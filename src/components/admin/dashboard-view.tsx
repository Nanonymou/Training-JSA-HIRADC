"use client";

import { useMemo, useState } from "react";

import { DashboardStats } from "@/components/admin/dashboard-stats";
import { SelectNative } from "@/components/ui/select-native";
import { getDashboardSummary } from "@/lib/admin/dashboard";
import { PESERTA_RECORDS } from "@/lib/admin/peserta";
import { LOKASI_OPTIONS } from "@/lib/daftar-hadir/options";

/**
 * The interactive monitoring dashboard.
 *
 * Holds the site filter and recomputes the summary from it, so the headline
 * cards react to the selected location (Semua = all sites). Everything derives
 * from the mock records through the shared aggregate helper; the cards stay
 * presentational.
 */
export function DashboardView() {
  const [lokasi, setLokasi] = useState("all");

  const rows = useMemo(
    () =>
      lokasi === "all"
        ? PESERTA_RECORDS
        : PESERTA_RECORDS.filter((p) => p.lokasi === lokasi),
    [lokasi],
  );

  const summary = useMemo(() => getDashboardSummary(rows), [rows]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="dash-lokasi" className="text-sm font-medium">
          Lokasi
        </label>
        <SelectNative
          id="dash-lokasi"
          value={lokasi}
          onChange={(event) => setLokasi(event.target.value)}
          className="w-44"
        >
          <option value="all">Semua lokasi</option>
          {LOKASI_OPTIONS.map((site) => (
            <option key={site} value={site}>
              {site}
            </option>
          ))}
        </SelectNative>
      </div>

      <DashboardStats summary={summary} />
    </div>
  );
}
