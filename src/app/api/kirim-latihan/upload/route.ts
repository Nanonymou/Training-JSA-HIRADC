import { NextResponse } from "next/server";

import { readPesertaSession } from "@/lib/daftar-hadir/session";
import { getExtension, validateUpload } from "@/lib/upload/config";
import { saveUpload } from "@/lib/upload/repository";
import { storeUploadFile } from "@/lib/upload/storage";

export const dynamic = "force-dynamic";

/**
 * POST /api/kirim-latihan/upload — store a latihan file.
 *
 * Multipart form with a `file` field. Requires a signed Daftar Hadir (the upload
 * is recorded against that peserta). The file is re-validated server-side
 * (type + size), stored in Vercel Blob, and a Pending record is saved. Returns
 * the created record.
 */
export async function POST(request: Request) {
  const peserta = await readPesertaSession();
  if (!peserta) {
    return NextResponse.json(
      { error: "Isi daftar hadir dulu sebelum mengunggah." },
      { status: 403 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Form tidak valid." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Berkas tidak ditemukan." },
      { status: 400 },
    );
  }

  const invalid = validateUpload({ name: file.name, size: file.size });
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const stored = await storeUploadFile(file);
  const upload = await saveUpload({
    trainingId: "jsa-hiradc",
    pesertaNama: peserta.nama,
    pesertaEmail: peserta.email,
    lokasi: peserta.lokasi,
    fileName: file.name,
    fileSize: file.size,
    fileExt: getExtension(file.name),
    urlBerkas: stored.url,
    status: "Pending",
  });

  return NextResponse.json({ upload }, { status: 201 });
}
