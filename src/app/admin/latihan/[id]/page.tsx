import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { EmailPreview } from "@/components/admin/email-preview";
import { FilePreview } from "@/components/admin/file-preview";
import { ReviewPanel } from "@/components/admin/review-panel";
import { StatusBadge } from "@/components/admin/status-badge";
import { readAdminSession } from "@/lib/admin/auth";
import { getReviewUploadById } from "@/lib/admin/latihan-repository";
import { formatBytes } from "@/lib/upload/config";

export const metadata: Metadata = {
  title: "Detail Unggahan — Admin",
};

export const dynamic = "force-dynamic";

function formatWaktu(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Admin detail view for a single latihan submission (protected).
 *
 * Full submitter context, the file preview inline, and review + email panels.
 * Reads the upload from the database via getReviewUploadById.
 */
export default async function UploadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const upload = await getReviewUploadById(id);
  if (!upload) notFound();

  return (
    <div className="app-surface flex min-h-dvh flex-col">
      <AdminHeader page={upload.fileName} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {upload.fileName}
            </h1>
            <StatusBadge status={upload.status} />
          </div>
          <dl className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <div className="flex gap-1.5">
              <dt>Peserta:</dt>
              <dd className="text-foreground font-medium">
                {upload.pesertaNama}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Lokasi:</dt>
              <dd className="text-foreground font-medium">{upload.lokasi}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Ukuran:</dt>
              <dd>{formatBytes(upload.fileSize)}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Diunggah:</dt>
              <dd>{formatWaktu(upload.waktuUnggah)}</dd>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="h-[70dvh]">
            <FilePreview
              url={upload.url}
              fileName={upload.fileName}
              previewKind={upload.previewKind}
            />
          </div>
          <div className="flex flex-col gap-4">
            <ReviewPanel uploadId={upload.id} initialStatus={upload.status} />
            <EmailPreview
              uploadId={upload.id}
              pesertaNama={upload.pesertaNama}
              pesertaEmail={upload.pesertaEmail}
              fallbackStatus={upload.status}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
