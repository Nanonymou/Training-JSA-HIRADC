import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  getAdminSecret,
  signAdminToken,
} from "@/lib/admin/auth-token";
import { getAdminEmail, verifyCredentials } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login — verify admin credentials and open a session.
 *
 * On success, sets the httpOnly signed admin cookie the middleware checks; on
 * failure, a generic 401 (no hint whether it was the email or the password).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const source = (body ?? {}) as Record<string, unknown>;
  const email = typeof source.email === "string" ? source.email : "";
  const password = typeof source.password === "string" ? source.password : "";

  if (!verifyCredentials(email, password)) {
    return NextResponse.json(
      { error: "Email atau password salah." },
      { status: 401 },
    );
  }

  const token = await signAdminToken(
    {
      email: getAdminEmail(),
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
    },
    getAdminSecret(),
  );

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
