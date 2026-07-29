import type { PesertaRecord } from "@/lib/admin/peserta";

/**
 * Export the peserta table to Excel or PDF.
 *
 * The heavy libraries (`xlsx`, `jspdf`) are imported dynamically so they only
 * load when an admin actually exports, keeping them out of the page bundle. Both
 * export whatever rows are passed in — i.e. the current filter — and name the
 * file after the site label so per-site exports are distinguishable.
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

function fileLabel(label: string): string {
  return label.trim().replace(/\s+/g, "-").toLowerCase() || "semua";
}

export async function exportPesertaExcel(
  rows: PesertaRecord[],
  label: string,
): Promise<void> {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows.map(toRow)]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Peserta");
  XLSX.writeFile(book, `data-peserta-${fileLabel(label)}.xlsx`);
}

export async function exportPesertaPdf(
  rows: PesertaRecord[],
  label: string,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Data Peserta — Training JSA & HIRADC", 14, 16);
  doc.setFontSize(10);
  doc.text(`Lokasi: ${label} · ${rows.length} peserta`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [HEADERS],
    body: rows.map(toRow),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [124, 58, 237] },
  });

  doc.save(`data-peserta-${fileLabel(label)}.pdf`);
}
