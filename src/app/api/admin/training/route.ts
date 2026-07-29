import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import {
  createTraining,
  getAdminTrainings,
  updateTraining,
} from "@/lib/admin/training-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/training — list every training topic for the admin.
 * Admin-only. Serves the seed modules when no database is configured.
 */
export async function GET() {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const trainings = await getAdminTrainings();
  return NextResponse.json({ trainings });
}

/**
 * POST /api/admin/training — mutate trainings. Admin-only. Dispatches on the
 * body's `action`; `create` adds a new (inactive) training from {judul,
 * deskripsi}. Other actions land in their own tasks.
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
  const action = typeof source.action === "string" ? source.action : "";

  if (action === "create") {
    const judul = typeof source.judul === "string" ? source.judul.trim() : "";
    const deskripsi =
      typeof source.deskripsi === "string" ? source.deskripsi.trim() : "";
    if (!judul) {
      return NextResponse.json(
        { error: "Judul wajib diisi." },
        { status: 400 },
      );
    }
    const training = await createTraining({ judul, deskripsi });
    return NextResponse.json({ training }, { status: 201 });
  }

  if (action === "update") {
    const id = typeof source.id === "string" ? source.id : "";
    const judul = typeof source.judul === "string" ? source.judul.trim() : "";
    const deskripsi =
      typeof source.deskripsi === "string" ? source.deskripsi.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
    }
    if (!judul) {
      return NextResponse.json(
        { error: "Judul wajib diisi." },
        { status: 400 },
      );
    }
    const training = await updateTraining(id, { judul, deskripsi });
    if (!training) {
      return NextResponse.json(
        { error: "Training tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json({ training });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
}
