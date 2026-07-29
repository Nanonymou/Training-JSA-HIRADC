import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { createSoal } from "@/lib/admin/bank-soal-repository";
import { DEFAULT_CATEGORY } from "@/lib/admin/soal-categories";
import {
  hasErrors,
  validateDraft,
  type SoalDraft,
} from "@/lib/admin/soal-draft";

export const dynamic = "force-dynamic";

/** Coerce a request body into a SoalDraft. */
function readDraft(body: unknown): SoalDraft {
  const source = (body ?? {}) as Record<string, unknown>;
  const pilihan = Array.isArray(source.pilihan)
    ? source.pilihan.map((p) => (typeof p === "string" ? p : ""))
    : [];
  return {
    soal: typeof source.soal === "string" ? source.soal : "",
    pilihan,
    kunci: typeof source.kunci === "number" ? source.kunci : 0,
    kategori: typeof source.kategori === "string" ? source.kategori : DEFAULT_CATEGORY,
  };
}

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

  const draft = readDraft(body);
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
