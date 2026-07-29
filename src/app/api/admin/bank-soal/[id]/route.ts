import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { updateSoal } from "@/lib/admin/bank-soal-repository";
import { coerceDraft, hasErrors, validateDraft } from "@/lib/admin/soal-draft";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/bank-soal/[id] — edit an existing question. Admin-only.
 * Validates the draft and replaces the question's text, category, and options.
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const draft = coerceDraft(body);
  const errors = validateDraft(draft);
  if (hasErrors(errors)) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const soal = await updateSoal(id, {
    soal: draft.soal.trim(),
    pilihan: draft.pilihan.map((p) => p.trim()),
    kunci: draft.kunci,
    kategori: draft.kategori,
  });

  return NextResponse.json({ soal });
}
