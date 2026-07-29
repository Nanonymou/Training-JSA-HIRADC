import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { duplicateSoal } from "@/lib/admin/bank-soal-repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/bank-soal/[id]/duplicate — copy a question (text + options),
 * appending "(salinan)" to the prompt. Admin-only. Returns the new record.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { id } = await context.params;
  const soal = await duplicateSoal(id);
  if (!soal) {
    return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ soal }, { status: 201 });
}
