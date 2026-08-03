import { NextResponse } from "next/server";

import { getActiveTrainingModules } from "@/lib/admin/training-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/training — active trainings for the peserta training selector.
 * Public (peserta-facing). Returns only active, non-archived trainings, or the
 * seed's active modules when no database is configured.
 */
export async function GET() {
  const trainings = await getActiveTrainingModules();
  return NextResponse.json({ trainings });
}
