import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { convertDocxFile } from "@/lib/admin/docx-converter";
import { getExtension } from "@/lib/upload/config";

export const dynamic = "force-dynamic";

const ALLOWED = ["docx", "doc"];
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * POST /api/admin/materi/upload — convert an uploaded DOCX into chapters.
 *
 * Admin-only. Takes a multipart `file`, validates the type, and runs the
 * DOCX→chapters conversion server-side (mammoth), returning the chapter structure
 * for preview before saving. Saving a version is a separate endpoint.
 */
export async function POST(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Form tidak valid." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 400 });
  }
  if (!ALLOWED.includes(getExtension(file.name))) {
    return NextResponse.json(
      { error: "Hanya berkas DOCX atau DOC." },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Berkas kosong." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Ukuran melebihi batas 20 MB." },
      { status: 413 },
    );
  }

  let chapters: Awaited<ReturnType<typeof convertDocxFile>>;
  try {
    chapters = await convertDocxFile(file);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengonversi dokumen. Pastikan format DOCX valid." },
      { status: 422 },
    );
  }

  if (chapters.length === 0) {
    return NextResponse.json(
      {
        error:
          "Tidak ada bab terdeteksi. Gunakan Heading 1/2 untuk menandai bab.",
      },
      { status: 422 },
    );
  }

  const sectionCount = chapters.reduce((sum, c) => sum + c.sections.length, 0);
  return NextResponse.json({
    chapters,
    chapterCount: chapters.length,
    sectionCount,
  });
}
