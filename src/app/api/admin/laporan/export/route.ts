import { readAdminSession } from "@/lib/admin/auth";
import { getLaporanPeriode } from "@/lib/admin/laporan-repository";
import {
  buildLaporanExcel,
  buildLaporanPdf,
  fileLabel,
} from "@/lib/admin/laporan-export";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/laporan/export — download the period report as Excel or PDF.
 * Admin-only. Query params: `format` (excel|pdf, default excel) plus the shared
 * laporan filters (from/to/q/sites). Streams the file as an attachment.
 */
export async function GET(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return Response.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const format = params.get("format") === "pdf" ? "pdf" : "excel";
  const sites = (params.get("sites") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { rows, recap } = await getLaporanPeriode({
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    q: params.get("q") ?? undefined,
    sites,
  });

  const label =
    sites.length === 1 ? sites[0] : sites.length > 1 ? "multi-site" : "semua";
  const name = `laporan-kelulusan-${fileLabel(label)}`;

  if (format === "pdf") {
    const pdf = await buildLaporanPdf(rows, recap, label);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}.pdf"`,
      },
    });
  }

  const excel = await buildLaporanExcel(rows, recap);
  return new Response(new Uint8Array(excel), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}.xlsx"`,
    },
  });
}
