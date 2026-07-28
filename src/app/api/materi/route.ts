import { NextResponse } from "next/server";

import { getMateriOverview } from "@/lib/materi/repository";

/**
 * GET /api/materi — the full material: every chapter in order, plus the chapter
 * count and total reading minutes. This is the contract the Materi screen reads
 * against; external clients (or a future client-side refresh) can consume the
 * same shape.
 */
export async function GET() {
  const overview = await getMateriOverview();
  return NextResponse.json(overview);
}
