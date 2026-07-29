/**
 * Signed admin session tokens.
 *
 * The admin cookie is privileged, so unlike the peserta gate it's HMAC-signed
 * and can't be forged. This module uses only Web Crypto and `process.env`, so it
 * runs in both the Edge middleware (which verifies the token on every /admin
 * request) and Node route handlers (which sign it at login). HMAC-SHA256 is
 * deterministic, so a token signed in Node verifies in Edge with the same secret.
 *
 * The default secret is for local dev only — set ADMIN_SESSION_SECRET in any
 * real deployment.
 */

export const ADMIN_COOKIE = "admin_session";
/** Four hours. */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 4;

export interface AdminTokenPayload {
  email: string;
  /** Expiry, epoch seconds. */
  exp: number;
}

export function getAdminSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-insecure-admin-secret-change-me";
}

const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function textToBase64Url(text: string): string {
  return bytesToBase64Url(encoder.encode(text));
}

function base64UrlToText(value: string): string {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Sign a payload into a `body.signature` token. */
export async function signAdminToken(
  payload: AdminTokenPayload,
  secret: string,
): Promise<string> {
  const body = textToBase64Url(JSON.stringify(payload));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(secret),
    encoder.encode(body),
  );
  return `${body}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

/** Verify a token's signature and expiry; returns the payload or null. */
export async function verifyAdminToken(
  token: string | undefined,
  secret: string,
): Promise<AdminTokenPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      base64UrlToBytes(signature),
      encoder.encode(body),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  try {
    const payload = JSON.parse(base64UrlToText(body)) as AdminTokenPayload;
    if (typeof payload.email !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
