import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { uploads } from "@/lib/db/schema";
import { readPesertaSession } from "@/lib/daftar-hadir/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/kirim-latihan/list?email=... — the peserta's own uploads with status.
 *
 * Identifies the peserta by cookie session first; falls back to `email` query
 * param when the cookie is missing (same fallback pattern as upload/quiz — the
 * training portal is intentionally un-authenticated). Newest first, filtered to
 * that email so peserta only see their own submissions. Public: same trust level
 * as the upload itself; no correct-answers to leak here.
 */
export async function GET(request: Request) {
  const cookiePeserta = await readPesertaSession();
  const { searchParams } = new URL(request.url);
  const emailRaw =
    cookiePeserta?.email ?? searchParams.get("email") ?? "";
  const email = emailRaw.trim().toLowerCase();

  if (!email) {
    return Response.json({ uploads: [] });
  }

  const db = getDb();
  if (!db) return Response.json({ uploads: [] });

  const rows = await db
    .select({
      id: uploads.id,
      fileName: uploads.fileName,
      fileExt: uploads.fileExt,
      fileSize: uploads.fileSize,
      urlBerkas: uploads.urlBerkas,
      status: uploads.status,
      adminComment: uploads.adminComment,
      waktuUnggah: uploads.waktuUnggah,
      pesertaEmail: uploads.pesertaEmail,
    })
    .from(uploads)
    .where(eq(uploads.pesertaEmail, emailRaw.trim()))
    .orderBy(desc(uploads.waktuUnggah));

  // Case-insensitive email match (belt & braces — DB filter above is exact).
  const filtered = rows.filter(
    (r) => r.pesertaEmail.toLowerCase() === email,
  );

  return Response.json({
    uploads: filtered.map((r) => ({
      id: r.id,
      name: r.fileName,
      size: r.fileSize,
      ext: r.fileExt,
      waktuUnggah: r.waktuUnggah.toISOString(),
      status: r.status,
      url: r.urlBerkas.startsWith("http://") || r.urlBerkas.startsWith("https://")
        ? r.urlBerkas
        : `/api/uploads/${r.id}/download`,
      adminComment: r.adminComment ?? null,
    })),
  });
}
