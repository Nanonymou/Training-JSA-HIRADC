import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { FilePreview } from "@/components/admin/file-preview";
import { ReviewPanel } from "@/components/admin/review-panel";
import { StatusBadge } from "@/components/admin/status-badge";
import { readAdminSession } from "@/lib/admin/auth";
import { getAdminUpload } from "@/lib/admin/latihan";
import { formatBytes } from "@/lib/upload/config";

export const metadata: Metadata = {
  title: "Detail Unggahan — Admin",
};

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
 * Full submitter context, the file preview inline, and current status. Review
 * actions (status change, comment) land in later tasks. Runs on mock data.
 */
export default async function UploadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const upload = getAdminUpload(id);
  if (!upload) notFound();

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="bg-card border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Link
          href="/admin/latihan"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          Review Latihan
        </Link>
        <span className="text-muted-foreground ml-1 truncate text-sm">
          / {upload.fileName}
        </span>
        <div className="ml-auto">
          <AdminLogoutButton />
        </div>
      </header>

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
          <ReviewPanel uploadId={upload.id} initialStatus={upload.status} />
        </div>
      </main>
    </div>
  );
}
