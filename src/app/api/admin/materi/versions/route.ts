import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getMateriVersions, saveMateriVersion } from "@/lib/admin/cms-repository";
import type { MateriChapter } from "@/lib/materi/chapters";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/materi/versions?training=jsa-hiradc — a training's material
 * revision history, newest first. Admin-only.
 */
export async function GET(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const trainingId = searchParams.get("training") ?? "jsa-hiradc";
  const versions = await getMateriVersions(trainingId);

  return NextResponse.json({ versions });
}

/**
 * POST /api/admin/materi/versions — save a new version from converted chapters.
 * Admin-only. Body: { trainingId?, catatan?, chapters, makeCurrent? }.
 * Version number auto-increments per training; when makeCurrent (default true),
 * previous versions for that training are marked non-current.
 */
export async function POST(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const source = (body ?? {}) as Record<string, unknown>;
  const chapters = source.chapters;
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return NextResponse.json(
      { error: "chapters wajib berisi minimal satu bab." },
      { status: 400 },
    );
  }

  const saved = await saveMateriVersion({
    trainingId: typeof source.trainingId === "string" ? source.trainingId : undefined,
    catatan: typeof source.catatan === "string" ? source.catatan : "",
    updatedBy: admin.email,
    chapters: chapters as MateriChapter[],
    makeCurrent: source.makeCurrent !== false,
  });

  if (!saved) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi." },
      { status: 503 },
    );
  }

  return NextResponse.json({ version: saved }, { status: 201 });
}
