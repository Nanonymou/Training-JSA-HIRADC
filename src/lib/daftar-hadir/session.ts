import { cookies } from "next/headers";

import { DEPARTEMEN } from "@/lib/daftar-hadir/options";

/**
 * The peserta's server-side session — the signal that gates the quiz.
 *
 * Signing the Daftar Hadir sets an httpOnly cookie carrying the peserta's
 * identity; the quiz endpoints require it before serving questions or grading.
 * The token is a base64url-encoded JSON payload, not a signed credential — it's a
 * presence gate for an un-authenticated training portal, and being httpOnly it
 * can only be set by our POST after validation (the PRD reserves signed sessions
 * for the admin side). Read only from server components and route handlers.
 */

export const PESERTA_COOKIE = "peserta_session";

/** Eight hours — long enough for one training session. */
export const PESERTA_COOKIE_MAX_AGE = 60 * 60 * 8;

export interface PesertaSession {
  nama: string;
  email: string;
  jabatan: string;
  lokasi: string;
  departemen: typeof DEPARTEMEN;
  waktuHadir: string;
}

export function encodeSession(session: PesertaSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeSession(value: string | undefined): PesertaSession | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as PesertaSession).email === "string" &&
      typeof (parsed as PesertaSession).waktuHadir === "string"
    ) {
      return parsed as PesertaSession;
    }
    return null;
  } catch {
    return null;
  }
}

/** The current peserta session from the request cookies, or null. */
export async function readPesertaSession(): Promise<PesertaSession | null> {
  const store = await cookies();
  return decodeSession(store.get(PESERTA_COOKIE)?.value);
}
