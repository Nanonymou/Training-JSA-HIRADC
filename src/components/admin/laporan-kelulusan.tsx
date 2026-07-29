"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import { PeriodFilter, withinPeriod } from "@/components/admin/period-filter";
import { Input } from "@/components/ui/input";
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
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PESERTA_RECORDS.filter(
      (p) =>
        withinPeriod(p.waktuHadir, from, to) &&
        (!q ||
          p.nama.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)),
    );
  }, [from, to, query]);

  const lulus = rows.filter((p) => p.quizStatus === "Lulus").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PeriodFilter
          from={from}
          to={to}
          onFrom={setFrom}
          onTo={setTo}
          idPrefix="kelulusan"
        />
        <div className="relative sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari peserta…"
            aria-label="Cari peserta"
            className="pl-8"
          />
        </div>
      </div>

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
                rows.map((peserta) => {
                  const open = expanded === peserta.id;
                  return (
                    <Fragment key={peserta.id}>
                      <tr
                        onClick={() =>
                          setExpanded(open ? null : peserta.id)
                        }
                        className="border-border/60 hover:bg-muted/40 cursor-pointer border-b last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          <span className="flex items-center gap-1.5">
                            <ChevronDown
                              className={cn(
                                "text-muted-foreground size-3.5 transition-transform",
                                open && "rotate-180",
                              )}
                            />
                            {peserta.nama}
                          </span>
                        </td>
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
                      {open && (
                        <tr className="border-border/60 bg-muted/20 border-b last:border-0">
                          <td colSpan={5} className="px-4 py-3">
                            <dl className="text-muted-foreground grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
                              <div>
                                <dt>Jabatan</dt>
                                <dd className="text-foreground font-medium">
                                  {peserta.jabatan}
                                </dd>
                              </div>
                              <div>
                                <dt>Email</dt>
                                <dd className="text-foreground font-medium">
                                  {peserta.email}
                                </dd>
                              </div>
                              <div>
                                <dt>Upload latihan</dt>
                                <dd className="text-foreground font-medium">
                                  {peserta.uploadStatus}
                                </dd>
                              </div>
                              <div>
                                <dt>Waktu hadir</dt>
                                <dd className="text-foreground font-medium">
                                  {formatTanggal(peserta.waktuHadir)}
                                </dd>
                              </div>
                            </dl>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
