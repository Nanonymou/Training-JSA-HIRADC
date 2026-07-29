import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { CmsMateriList } from "@/components/admin/cms-materi-list";
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
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="bg-card border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <span className="text-muted-foreground ml-1 text-sm">/ CMS Materi</span>
        <div className="ml-auto">
          <AdminLogoutButton />
        </div>
      </header>

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
