import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { buildReviewEmail, shouldNotify } from "@/lib/admin/email-template";
import { sendReviewEmail } from "@/lib/admin/email-service";
import { updateNotifStatus } from "@/lib/upload/repository";
import type { UploadStatus } from "@/lib/upload/types";

export const dynamic = "force-dynamic";

const VALID_STATUS: UploadStatus[] = [
  "Pending",
  "Disetujui",
  "Perlu Revisi",
  "Ditolak",
];

/**
 * POST /api/admin/notifikasi — send a peserta the review-decision email and
 * record its status on the upload. Admin-only.
 *
 * Body: { uploadId, pesertaNama, pesertaEmail, status, comment }. A Pending
 * status is skipped (no notification). The email is composed from the decision,
 * sent via the email service, and the Terkirim/Gagal outcome is stored.
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
  const pesertaNama =
    typeof source.pesertaNama === "string" ? source.pesertaNama : "";
  const pesertaEmail =
    typeof source.pesertaEmail === "string" ? source.pesertaEmail.trim() : "";
  const status = source.status as UploadStatus;
  const comment = typeof source.comment === "string" ? source.comment : "";

  if (!uploadId || !pesertaEmail) {
    return NextResponse.json(
      { error: "uploadId dan pesertaEmail wajib diisi." },
      { status: 400 },
    );
  }
  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "Status tidak dikenal." }, { status: 400 });
  }
  if (!shouldNotify(status)) {
    return NextResponse.json({ skipped: true, reason: "Status Pending tidak dikirim." });
  }

  const email = buildReviewEmail(pesertaNama, status, comment);
  const result = await sendReviewEmail({ to: pesertaEmail, content: email });

  await updateNotifStatus(uploadId, result.status, result.sentAt);

  if (result.status === "Gagal") {
    return NextResponse.json(
      { error: "Gagal mengirim email.", detail: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    status: result.status,
    sentAt: result.sentAt,
    dev: result.dev,
  });
}
