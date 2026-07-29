import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import {
  ADMIN_COOKIE,
  getAdminSecret,
  verifyAdminToken,
  type AdminTokenPayload,
} from "@/lib/admin/auth-token";

/**
 * Admin credentials and session reads (Node only).
 *
 * Credentials come from the environment — ADMIN_EMAIL plus either a scrypt
 * ADMIN_PASSWORD_HASH ("saltHex:hashHex") or a plain ADMIN_PASSWORD that gets
 * hashed at boot. With neither set, a dev default (admin@tpb.co.id / admin123) is
 * derived so the login works locally; production must set real values. This is
 * the interim stand-in for the ADMIN table until it's provisioned. Uses
 * node:crypto, so import it only from route handlers and server components.
 */

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@tpb.co.id")
  .trim()
  .toLowerCase();

const SCRYPT_KEYLEN = 64;

function deriveHash(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Prefer a provided hash; otherwise hash the plain password (or the dev default).
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ??
  deriveHash(process.env.ADMIN_PASSWORD ?? "admin123");

function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** True when the email matches the admin and the password verifies. */
export function verifyCredentials(email: string, password: string): boolean {
  const emailMatches = email.trim().toLowerCase() === ADMIN_EMAIL;
  // Always run the password check so a wrong email doesn't return faster.
  const passwordMatches = verifyPassword(password, ADMIN_PASSWORD_HASH);
  return emailMatches && passwordMatches;
}

/** The canonical admin email (for the session payload). */
export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}

/** The current admin session from the request cookies, or null. */
export async function readAdminSession(): Promise<AdminTokenPayload | null> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value, getAdminSecret());
}
