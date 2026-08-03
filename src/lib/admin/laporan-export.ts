import type { PesertaRecord } from "@/lib/admin/peserta";
import type { SiteRecap } from "@/lib/admin/laporan-repository";

/**
 * Server-side generation of the period report as an Excel workbook or a PDF.
 *
 * Returns the file bytes (not a browser download) so an API route can stream
 * them with a Content-Disposition header. The heavy libraries (`xlsx`, `jspdf`)
 * are imported dynamically so they load only when an export is requested.
 * Server-only.
 */

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

const RECAP_HEADERS = ["Lokasi", "Peserta", "Lulus", "Rata-rata"];

function tanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function toRow(peserta: PesertaRecord): (string | number)[] {
  return [
    peserta.nama,
    peserta.email,
    peserta.jabatan,
    peserta.lokasi,
    peserta.quizStatus,
    peserta.quizScore ?? "-",
    peserta.uploadStatus,
    tanggal(peserta.waktuHadir),
  ];
}

export function fileLabel(label: string): string {
  return label.trim().replace(/\s+/g, "-").toLowerCase() || "semua";
}

export async function buildLaporanExcel(
  rows: PesertaRecord[],
  recap: SiteRecap[],
): Promise<Buffer> {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();

  const recapSheet = XLSX.utils.aoa_to_sheet([
    RECAP_HEADERS,
    ...recap.map((s) => [s.lokasi, s.peserta, s.lulus, s.rata]),
  ]);
  XLSX.utils.book_append_sheet(book, recapSheet, "Rekap Site");

  const detailSheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows.map(toRow)]);
  XLSX.utils.book_append_sheet(book, detailSheet, "Peserta");

  return XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function buildLaporanPdf(
  rows: PesertaRecord[],
  recap: SiteRecap[],
  label: string,
): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Laporan Kelulusan — Training JSA & HIRADC", 14, 16);
  doc.setFontSize(10);
  doc.text(`Lokasi: ${label} · ${rows.length} peserta`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [RECAP_HEADERS],
    body: recap.map((s) => [s.lokasi, s.peserta, s.lulus, s.rata]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [124, 58, 237] },
  });

  const recapEnd =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 28;

  autoTable(doc, {
    startY: recapEnd + 8,
    head: [HEADERS],
    body: rows.map(toRow),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [124, 58, 237] },
  });

  return Buffer.from(doc.output("arraybuffer"));
}
