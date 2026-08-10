import { NextResponse } from "next/server";

import { readPesertaSession } from "@/lib/daftar-hadir/session";
import { getExtension, validateUpload } from "@/lib/upload/config";
import { saveUpload, setUploadUrl } from "@/lib/upload/repository";
import { storeUploadFile } from "@/lib/upload/storage";
import { DEFAULT_TRAINING_ID } from "@/lib/training/scope";

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
  const cookiePeserta = await readPesertaSession();

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

  // Peserta identity — prefer the signed cookie, fall back to the form fields
  // (the client keeps a copy in localStorage; the cookie may have expired).
  const asString = (v: FormDataEntryValue | null) =>
    typeof v === "string" ? v.trim() : "";
  const nama = cookiePeserta?.nama ?? asString(form.get("nama"));
  const email = cookiePeserta?.email ?? asString(form.get("email"));
  const lokasi = cookiePeserta?.lokasi ?? asString(form.get("lokasi"));

  if (!nama || !email) {
    return NextResponse.json(
      { error: "Identitas peserta tidak lengkap. Isi daftar hadir dulu." },
      { status: 403 },
    );
  }

  const invalid = validateUpload({ name: file.name, size: file.size });
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  try {
    const stored = await storeUploadFile(file);
    // Placeholder URL for the bytes case — we replace it with the download route
    // once the row's id is known.
    const urlBerkas = stored.kind === "blob" ? stored.url : "";
    const fileData = stored.kind === "bytes" ? stored.bytes : undefined;

    const upload = await saveUpload({
      trainingId: DEFAULT_TRAINING_ID,
      pesertaNama: nama,
      pesertaEmail: email,
      lokasi,
      fileName: file.name,
      fileSize: file.size,
      fileExt: getExtension(file.name),
      urlBerkas,
      status: "Pending",
      fileData,
    });

    // For the bytes case, resolve the URL to the download route now that we
    // have the row id, and persist that as `urlBerkas` for callers to link to.
    if (stored.kind === "bytes") {
      upload.urlBerkas = `/api/uploads/${upload.id}/download`;
      await setUploadUrl(upload.id, upload.urlBerkas);
    }

    return NextResponse.json({ upload }, { status: 201 });
  } catch (error) {
    // Surface a readable reason instead of a bare 500 HTML page. The most common
    // causes are storage misconfig (Blob token) or the DB not being migrated.
    console.error("[kirim-latihan] upload failed:", error);
    return NextResponse.json(
      {
        error:
          "Gagal menyimpan berkas di server. Pastikan penyimpanan & database sudah dikonfigurasi.",
      },
      { status: 500 },
    );
  }
}
