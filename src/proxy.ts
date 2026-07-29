import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE,
  getAdminSecret,
  verifyAdminToken,
} from "@/lib/admin/auth-token";

/**
 * Route protection for the admin console (Next 16 Proxy — the renamed
 * middleware).
 *
 * Every `/admin/*` request is checked for a valid signed admin session before it
 * renders. Without one, the visitor is sent to the login page (remembering where
 * they were headed via `from`). The login page itself is exempt — and if an
 * already-signed admin lands there, they're bounced to the dashboard. Enforcing
 * this here means no admin page or data loads for an unauthenticated request,
 * not just that the UI is hidden.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminToken(token, getAdminSecret());

  if (pathname === "/admin/login") {
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
