"use client";

import { useMemo, useState } from "react";

import { PeriodFilter, withinPeriod } from "@/components/admin/period-filter";
import { PESERTA_RECORDS } from "@/lib/admin/peserta";
import { cn } from "@/lib/utils";

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

/**
 * Quiz pass-rate report: a period-filtered table of peserta and their quiz
 * outcome, with a summary line. The period filter and table are the report's
 * core; export lands in a later task.
 */
export function LaporanKelulusan() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(
    () => PESERTA_RECORDS.filter((p) => withinPeriod(p.waktuHadir, from, to)),
    [from, to],
  );

  const lulus = rows.filter((p) => p.quizStatus === "Lulus").length;

  return (
    <div className="flex flex-col gap-4">
      <PeriodFilter
        from={from}
        to={to}
        onFrom={setFrom}
        onTo={setTo}
        idPrefix="kelulusan"
      />

      <p className="text-muted-foreground text-xs">
        {rows.length} peserta · {lulus} lulus dalam periode ini.
      </p>

      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Lokasi</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Nilai</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground px-4 py-10 text-center"
                  >
                    Tidak ada data pada periode ini.
                  </td>
                </tr>
              ) : (
                rows.map((peserta) => (
                  <tr
                    key={peserta.id}
                    className="border-border/60 border-b last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{peserta.nama}</td>
                    <td className="px-4 py-3">{peserta.lokasi}</td>
                    <td
                      className={cn(
                        "px-4 py-3 font-medium",
                        peserta.quizStatus === "Lulus"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : peserta.quizStatus === "Belum Lulus"
                            ? "text-destructive"
                            : "text-muted-foreground",
                      )}
                    >
                      {peserta.quizStatus}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {peserta.quizScore ?? "-"}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                      {formatTanggal(peserta.waktuHadir)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
