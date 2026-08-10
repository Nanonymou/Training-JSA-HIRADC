import { readAdminSession } from "@/lib/admin/auth";
import { getPesertaRecords } from "@/lib/admin/peserta-repository";
import type { PesertaRecord } from "@/lib/admin/peserta";

export const dynamic = "force-dynamic";

const HEADERS = [
  "Nama",
  "Email",
  "Jabatan",
  "Lokasi",
  "Status Quiz",
  "Nilai",
  "Upload",
  "Tanggal",
];

function tanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

/** CSV-escape a field (wrap in quotes, double embedded quotes). */
function csvField(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsvRow(p: PesertaRecord): string {
  return [
    p.nama,
    p.email,
    p.jabatan,
    p.lokasi,
    p.quizStatus,
    p.quizScore ?? "-",
    p.uploadStatus,
    tanggal(p.waktuHadir),
  ]
    .map(csvField)
    .join(",");
}

/**
 * GET /api/peserta/export?lokasi=&q=&from=&to= — download filtered peserta as CSV.
 *
 * Admin-only. Honours the same filters as the list endpoint and streams a CSV
 * attachment (a BOM is prepended so Excel reads UTF-8 correctly).
 */
export async function GET(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return new Response("Butuh login admin.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const lokasi = searchParams.get("lokasi") ?? undefined;
  const rows = await getPesertaRecords({
    lokasi,
    q: searchParams.get("q") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const csv = [HEADERS.map(csvField).join(","), ...rows.map(toCsvRow)].join("\n");
  const label = lokasi && lokasi !== "all" ? lokasi.replace(/\s+/g, "-") : "semua";

  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="data-peserta-${label}.csv"`,
    },
  });
}
