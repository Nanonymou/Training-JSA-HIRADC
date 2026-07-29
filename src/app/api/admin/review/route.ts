import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { updateReview } from "@/lib/upload/repository";
import type { UploadStatus } from "@/lib/upload/types";

export const dynamic = "force-dynamic";

const VALID_STATUS: UploadStatus[] = [
  "Pending",
  "Disetujui",
  "Perlu Revisi",
  "Ditolak",
];

/**
 * POST /api/admin/review — save an admin's review decision for an upload
 * (status + comment). Admin-only. Records the reviewer and time on the row.
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
  const uploadId = typeof source.uploadId === "string" ? source.uploadId : "";
  const status = source.status as UploadStatus;
  const comment = typeof source.comment === "string" ? source.comment : "";

  if (!uploadId) {
    return NextResponse.json({ error: "uploadId wajib diisi." }, { status: 400 });
  }
  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "Status tidak dikenal." }, { status: 400 });
  }

  const result = await updateReview(uploadId, {
    status,
    comment: comment.trim(),
    reviewer: admin.email,
  });

  if (!result.found) {
    return NextResponse.json(
      { error: "Upload tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, upload: result.row });
}
