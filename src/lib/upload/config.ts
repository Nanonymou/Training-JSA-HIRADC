/**
 * Rules for the Kirim Latihan upload.
 *
 * Per the PRD: DOC, DOCX, XLS, XLSX, or PDF, up to 20 MB. Kept in one place so
 * the form, the accept attribute, and a future server validator agree. Isomorphic
 * (no server/client marker) so both sides can import it.
 */

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB

export const ALLOWED_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "pdf"] as const;
export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

/** Value for an <input type="file"> accept attribute. */
export const ACCEPT_ATTR = ".doc,.docx,.xls,.xlsx,.pdf";

/** Lowercased extension without the dot, or "" if none. */
export function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function isAllowedExtension(ext: string): ext is AllowedExtension {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

/** Human-readable byte size, e.g. "3.4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const decimals = value < 10 && unit > 0 ? 1 : 0;
  return `${value.toFixed(decimals)} ${units[unit]}`;
}

/** Validate a picked file; returns an error message, or null when it's fine. */
export function validateUpload(file: { name: string; size: number }): string | null {
  const ext = getExtension(file.name);
  if (!isAllowedExtension(ext)) {
    return "Format tidak didukung. Gunakan DOC, DOCX, XLS, XLSX, atau PDF.";
  }
  if (file.size === 0) return "File kosong.";
  if (file.size > MAX_UPLOAD_BYTES) {
    return `Ukuran melebihi batas ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
}
