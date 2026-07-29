import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CmsMateriList } from "@/components/admin/cms-materi-list";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminTrainings } from "@/lib/admin/training-repository";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "CMS Materi — Admin",
};

export const dynamic = "force-dynamic";

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

  const items = await getAdminTrainings();

  return (
    <div className="app-surface flex min-h-dvh flex-col">
      <AdminHeader page="CMS Materi" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">CMS Materi</h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Ringkasan topik training. Untuk menambah, menyunting, mengaktifkan,
            atau mengarsipkan training, buka halaman{" "}
            <span className="text-foreground font-medium">Multi-Training</span>.
          </p>
        </div>

        <CmsMateriList items={items} />
      </main>
    </div>
  );
}
