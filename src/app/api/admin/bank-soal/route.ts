import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { createSoal } from "@/lib/admin/bank-soal-repository";
import { coerceDraft, hasErrors, validateDraft } from "@/lib/admin/soal-draft";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/bank-soal — add a question to the bank. Admin-only. Validates
 * the draft (question, options, correct answer) and returns the created record.
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

  const draft = coerceDraft(body);
  const errors = validateDraft(draft);
  if (hasErrors(errors)) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const soal = await createSoal({
    soal: draft.soal.trim(),
    pilihan: draft.pilihan.map((p) => p.trim()),
    kunci: draft.kunci,
    kategori: draft.kategori,
  });

  return NextResponse.json({ soal }, { status: 201 });
}
