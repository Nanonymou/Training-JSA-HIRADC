/**
 * Where an uploaded latihan file is stored.
 *
 * On Vercel (with BLOB_READ_WRITE_TOKEN set) the file goes to Vercel Blob and its
 * public URL is returned. Without a token — local dev or a preview without Blob —
 * it returns a placeholder URL so the upload flow still works end-to-end; the
 * file isn't persisted. `@vercel/blob` is imported dynamically so the dev path
 * never loads it. Server-only.
 */

export interface StoredFile {
  url: string;
  pathname: string;
}

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
    return { url: blob.url, pathname };
  }

  return { url: `/_dev-blob/${pathname}`, pathname };
}
