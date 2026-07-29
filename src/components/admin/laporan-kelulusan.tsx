"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import { PeriodFilter, withinPeriod } from "@/components/admin/period-filter";
import { Input } from "@/components/ui/input";
import { LOKASI_OPTIONS } from "@/lib/daftar-hadir/options";
import { PESERTA_RECORDS, type PesertaRecord } from "@/lib/admin/peserta";
import { cn } from "@/lib/utils";

interface SiteRecap {
  lokasi: string;
  peserta: number;
  lulus: number;
  rata: number;
}

/** Group rows by site into a combined recap. */
function recapBySite(rows: PesertaRecord[]): SiteRecap[] {
  const map = new Map<string, PesertaRecord[]>();
  for (const row of rows) {
    const list = map.get(row.lokasi) ?? [];
    list.push(row);
    map.set(row.lokasi, list);
  }
  return [...map.entries()]
    .map(([lokasi, list]) => {
      const scored = list.filter((p) => p.quizScore !== null);
      const rata =
        scored.length === 0
          ? 0
          : Math.round(
              scored.reduce((sum, p) => sum + (p.quizScore ?? 0), 0) /
                scored.length,
            );
      return {
        lokasi,
        peserta: list.length,
        lulus: list.filter((p) => p.quizStatus === "Lulus").length,
        rata,
      };
    })
    .sort((a, b) => b.peserta - a.peserta);
}

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
  const [sites, setSites] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleSite(site: string) {
    setSites((current) =>
      current.includes(site)
        ? current.filter((s) => s !== site)
        : [...current, site],
    );
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PESERTA_RECORDS.filter(
      (p) =>
        withinPeriod(p.waktuHadir, from, to) &&
        (sites.length === 0 || sites.includes(p.lokasi)) &&
        (!q ||
          p.nama.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)),
    );
  }, [from, to, query, sites]);

  const lulus = rows.filter((p) => p.quizStatus === "Lulus").length;
  const recap = useMemo(() => recapBySite(rows), [rows]);

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

      <div className="flex flex-wrap gap-1.5">
        {LOKASI_OPTIONS.map((site) => {
          const on = sites.includes(site);
          return (
            <button
              key={site}
              type="button"
              onClick={() => toggleSite(site)}
              aria-pressed={on}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                on
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {site}
            </button>
          );
        })}
        {sites.length > 0 && (
          <button
            type="button"
            onClick={() => setSites([])}
            className="text-muted-foreground hover:text-foreground px-2 py-1 text-xs underline-offset-2 hover:underline"
          >
            Semua site
          </button>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        {rows.length} peserta · {lulus} lulus{" "}
        {sites.length > 0 ? `di ${sites.length} site terpilih` : "semua site"}.
      </p>

      {/* Combined per-site recap */}
      {recap.length > 0 && (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="border-border text-muted-foreground border-b text-left text-xs">
                  <th className="px-4 py-2.5 font-medium">Lokasi</th>
                  <th className="px-4 py-2.5 font-medium">Peserta</th>
                  <th className="px-4 py-2.5 font-medium">Lulus</th>
                  <th className="px-4 py-2.5 font-medium">Rata-rata</th>
                </tr>
              </thead>
              <tbody>
                {recap.map((site) => (
                  <tr
                    key={site.lokasi}
                    className="border-border/60 border-b last:border-0"
                  >
                    <td className="px-4 py-2.5 font-medium">{site.lokasi}</td>
                    <td className="px-4 py-2.5 tabular-nums">{site.peserta}</td>
                    <td className="px-4 py-2.5 tabular-nums">{site.lulus}</td>
                    <td className="px-4 py-2.5 tabular-nums">{site.rata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
