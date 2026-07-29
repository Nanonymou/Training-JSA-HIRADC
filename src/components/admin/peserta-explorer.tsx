"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, FileText, RotateCcw, Search } from "lucide-react";

import { PesertaTable } from "@/components/admin/peserta-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { toast } from "@/components/ui/toaster";
import { LOKASI_OPTIONS } from "@/lib/daftar-hadir/options";
import {
  exportPesertaExcel,
  exportPesertaPdf,
} from "@/lib/admin/peserta-export";
import type { PesertaRecord } from "@/lib/admin/peserta";

/**
 * Data Peserta with a filter toolbar over the table.
 *
 * Combines a name search, a site filter, and a from/to attendance-date range —
 * all on the client over the DB-backed records passed in — so an admin can narrow
 * to, say, one site in a date window. Dates compare on the ISO day (yyyy-mm-dd),
 * which orders lexicographically. Reset clears everything.
 */
export function PesertaExplorer({ records }: { records: PesertaRecord[] }) {
  const [query, setQuery] = useState("");
  const [lokasi, setLokasi] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((peserta) => {
      if (lokasi !== "all" && peserta.lokasi !== lokasi) return false;
      if (
        q &&
        !peserta.nama.toLowerCase().includes(q) &&
        !peserta.email.toLowerCase().includes(q)
      ) {
        return false;
      }
      const day = peserta.waktuHadir.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }, [records, query, lokasi, from, to]);

  const active = query.trim() !== "" || lokasi !== "all" || from !== "" || to !== "";
  const label = lokasi === "all" ? "semua" : lokasi;

  const [exporting, setExporting] = useState(false);

  function reset() {
    setQuery("");
    setLokasi("all");
    setFrom("");
    setTo("");
  }

  async function runExport(kind: "excel" | "pdf") {
    if (filtered.length === 0 || exporting) return;
    setExporting(true);
    try {
      if (kind === "excel") {
        await exportPesertaExcel(filtered, label);
      } else {
        await exportPesertaPdf(filtered, label);
      }
      toast({
        title: `Ekspor ${kind === "excel" ? "Excel" : "PDF"} siap`,
        description: `${filtered.length} peserta (${label}).`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Gagal mengekspor",
        description: "Coba lagi.",
        variant: "error",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1.5 sm:flex-1 sm:min-w-48">
          <label htmlFor="cari" className="text-xs font-medium">
            Cari nama / email
          </label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              id="cari"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari peserta…"
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:w-44">
          <label htmlFor="lokasi" className="text-xs font-medium">
            Lokasi
          </label>
          <SelectNative
            id="lokasi"
            value={lokasi}
            onChange={(event) => setLokasi(event.target.value)}
          >
            <option value="all">Semua lokasi</option>
            {LOKASI_OPTIONS.map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </SelectNative>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dari" className="text-xs font-medium">
            Dari
          </label>
          <Input
            id="dari"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
            className="w-full sm:w-40"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sampai" className="text-xs font-medium">
            Sampai
          </label>
          <Input
            id="sampai"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            className="w-full sm:w-40"
          />
        </div>

        {active && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw />
            Reset
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Menampilkan {filtered.length} dari {records.length} peserta.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runExport("excel")}
            disabled={exporting || filtered.length === 0}
          >
            <FileSpreadsheet />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runExport("pdf")}
            disabled={exporting || filtered.length === 0}
          >
            <FileText />
            PDF
          </Button>
        </div>
      </div>

      <PesertaTable rows={filtered} />
    </div>
  );
}
