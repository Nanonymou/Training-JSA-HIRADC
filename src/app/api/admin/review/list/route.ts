import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getReviewUploads } from "@/lib/admin/latihan-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/review/list — list uploads with their current review status.
 * Admin-only. Serves the mock seed when no database is configured.
 */
export async function GET() {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const uploads = await getReviewUploads();
  return NextResponse.json({ uploads });
}
