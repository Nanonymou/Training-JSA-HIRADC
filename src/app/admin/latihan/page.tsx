import type { Metadata } from "next";

import { LatihanReviewList } from "@/components/admin/latihan-review-list";
import { AdminHeader } from "@/components/admin/admin-header";
import { getReviewUploads } from "@/lib/admin/latihan-repository";
import { readAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Review Latihan — Admin",
};

export const dynamic = "force-dynamic";

/**
 * Admin review of submitted latihan files (protected).
 *
 * Lists every submission with a Preview action. Gated by the admin session (the
 * Proxy already enforces /admin, this is defence in depth). Runs on mock data;
 * later tasks add inline preview and status changes.
 */
export default async function AdminLatihanPage() {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  const uploads = await getReviewUploads();

  return (
    <div className="app-surface flex min-h-dvh flex-col">
      <AdminHeader page="Review Latihan" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Review Latihan
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Tinjau berkas yang dikirim peserta. Gunakan Pratinjau untuk melihat
            isi tanpa mengunduh.
          </p>
        </div>

        <LatihanReviewList uploads={uploads} />
      </main>
    </div>
  );
}
