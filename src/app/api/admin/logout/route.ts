import { NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/lib/admin/auth-token";

export const dynamic = "force-dynamic";

/** POST /api/admin/logout — clear the admin session. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
