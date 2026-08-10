import { NextResponse } from "next/server";

import { DEPARTEMEN } from "@/lib/daftar-hadir/options";
import {
  PESERTA_COOKIE,
  PESERTA_COOKIE_MAX_AGE,
  encodeSession,
  readPesertaSession,
  type PesertaSession,
} from "@/lib/daftar-hadir/session";
import {
  validateForm,
  type PesertaFormValues,
} from "@/lib/daftar-hadir/validation";
import { savePeserta } from "@/lib/admin/peserta-repository";

export const dynamic = "force-dynamic";

/** Coerce raw JSON into the four form fields as strings. */
function readValues(body: unknown): PesertaFormValues {
  const source = (body ?? {}) as Record<string, unknown>;
  const asString = (value: unknown) =>
    typeof value === "string" ? value : "";
  return {
    nama: asString(source.nama),
    email: asString(source.email),
    jabatan: asString(source.jabatan),
    lokasi: asString(source.lokasi),
  };
}

/** GET /api/daftar-hadir — the current peserta session, or null. */
export async function GET() {
  const peserta = await readPesertaSession();
  return NextResponse.json({ peserta });
}

/**
 * POST /api/daftar-hadir — record attendance and open the quiz.
 *
 * Validates the fields, fixes the department to QHSE, stamps the time (and IP
 * from the request), then sets the httpOnly peserta session cookie the quiz
 * endpoints check.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const values = readValues(body);
  const errors = validateForm(values);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const session: PesertaSession = {
    nama: values.nama.trim(),
    email: values.email.trim(),
    jabatan: values.jabatan,
    lokasi: values.lokasi,
    departemen: DEPARTEMEN,
    waktuHadir: new Date().toISOString(),
  };

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  const browser = request.headers.get("user-agent") ?? undefined;

  // Persist attendance so the admin's Data Peserta and reports see it. Best
  // effort — a storage hiccup must not block the peserta from proceeding.
  try {
    await savePeserta({
      nama: session.nama,
      email: session.email,
      jabatan: session.jabatan,
      lokasi: session.lokasi,
      departemen: session.departemen,
      ip,
      browser,
    });
  } catch (error) {
    console.error("[daftar-hadir] gagal menyimpan peserta:", error);
  }

  const response = NextResponse.json({ peserta: { ...session, ip } });
  response.cookies.set(PESERTA_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: PESERTA_COOKIE_MAX_AGE,
  });
  return response;
}

/** DELETE /api/daftar-hadir — clear the session (e.g. "Ubah data"). */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PESERTA_COOKIE);
  return response;
}
