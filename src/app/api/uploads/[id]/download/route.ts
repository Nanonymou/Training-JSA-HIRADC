import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { uploads } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/** Very small MIME lookup for the file types the app accepts. */
const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

function mimeFor(ext: string): string {
  return MIME[ext.toLowerCase()] ?? "application/octet-stream";
}

/**
 * GET /api/uploads/[id]/download — serve a latihan upload's bytes.
 *
 * Returns the file with its real MIME and original filename so the browser
 * downloads (or previews) it correctly. Used when the file is stored inline in
 * Postgres — the bytes fallback for when Vercel Blob isn't configured. Public
 * on purpose: same trust level as the upload itself.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const db = getDb();
  if (!db) return new Response("Not configured", { status: 503 });

  const [row] = await db
    .select({
      fileName: uploads.fileName,
      fileExt: uploads.fileExt,
      fileData: uploads.fileData,
      urlBerkas: uploads.urlBerkas,
    })
    .from(uploads)
    .where(eq(uploads.id, id))
    .limit(1);

  if (!row) return new Response("Not found", { status: 404 });

  // File is on Blob — send the caller there directly.
  if (
    row.urlBerkas &&
    (row.urlBerkas.startsWith("http://") ||
      row.urlBerkas.startsWith("https://"))
  ) {
    return Response.redirect(row.urlBerkas, 302);
  }

  if (!row.fileData) {
    return new Response("File tidak tersedia.", { status: 404 });
  }

  // ASCII-safe filename for the header (browsers use RFC 5987 filename* for UTF-8).
  const asciiName = row.fileName.replace(/[^\x20-\x7E]+/g, "_");
  const encoded = encodeURIComponent(row.fileName);

  return new Response(new Uint8Array(row.fileData), {
    headers: {
      "Content-Type": mimeFor(row.fileExt),
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encoded}`,
      "Content-Length": String(row.fileData.length),
      "Cache-Control": "private, max-age=300",
    },
  });
}
