import { getDb } from "@/lib/db/client";
import { uploads, type NewUploadRow, type UploadRow } from "@/lib/db/schema";

/**
 * Server-side persistence for latihan uploads.
 *
 * Inserts into the uploads table when the database is configured; without one it
 * returns a synthetic row so the endpoint still responds with a record in dev.
 * Server-only.
 */
export async function saveUpload(input: NewUploadRow): Promise<UploadRow> {
  const db = getDb();
  if (db) {
    const [row] = await db.insert(uploads).values(input).returning();
    return row;
  }

  // No database: echo back a complete row so the client gets a usable record.
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    trainingId: input.trainingId ?? "jsa-hiradc",
    pesertaNama: input.pesertaNama,
    pesertaEmail: input.pesertaEmail,
    lokasi: input.lokasi ?? null,
    fileName: input.fileName,
    fileSize: input.fileSize,
    fileExt: input.fileExt,
    urlBerkas: input.urlBerkas,
    status: input.status ?? "Pending",
    adminComment: input.adminComment ?? null,
    waktuUnggah: new Date(),
  };
}
