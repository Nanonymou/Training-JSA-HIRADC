import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CmsMateriList } from "@/components/admin/cms-materi-list";
import { AdminHeader } from "@/components/admin/admin-header";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "CMS Materi — Admin",
};

/**
 * Admin CMS for training materials (protected).
 *
 * Lists the training topics and (in later tasks) lets the admin add a training,
 * upload a DOCX, and manage chapters. Gated by the admin session; runs on mock
 * data for now.
 */
export default async function CmsMateriPage() {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="app-surface flex min-h-dvh flex-col">
      <AdminHeader page="CMS Materi" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">CMS Materi</h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Kelola topik training dan materinya. Tambahkan training baru atau
            unggah dokumen materi.
          </p>
        </div>

        <CmsMateriList />
      </main>
    </div>
  );
}
