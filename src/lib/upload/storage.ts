/**
 * Where an uploaded latihan file is stored.
 *
 * On Vercel with BLOB_READ_WRITE_TOKEN set, the file goes to Vercel Blob and a
 * public URL is returned. Without a token, the raw bytes come back so the caller
 * can persist them in Postgres (via the `file_data` bytea column) and serve them
 * through the download route — the app works end-to-end without any external
 * object storage. `@vercel/blob` is imported dynamically so the fallback path
 * never loads it. Server-only.
 */

export interface BlobStored {
  kind: "blob";
  url: string;
  pathname: string;
}

export interface BytesStored {
  kind: "bytes";
  bytes: Buffer;
  pathname: string;
}

export type StoredFile = BlobStored | BytesStored;

/** A storage key that keeps the original name but is safe and unique. */
function buildPathname(fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `latihan/${Date.now()}-${unique}-${safeName}`;
}

export async function storeUploadFile(file: File): Promise<StoredFile> {
  const pathname = buildPathname(file.name);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, file, { access: "public", token });
    return { kind: "blob", url: blob.url, pathname };
  }

  // No blob storage — read the bytes so the caller can persist them in Postgres.
  const bytes = Buffer.from(await file.arrayBuffer());
  return { kind: "bytes", bytes, pathname };
}
