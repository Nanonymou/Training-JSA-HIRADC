import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LatihanReviewList } from "@/components/admin/latihan-review-list";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { readAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Review Latihan — Admin",
};

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
        <span className="text-muted-foreground ml-1 text-sm">
          / Review Latihan
        </span>
        <div className="ml-auto">
          <AdminLogoutButton />
        </div>
      </header>

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

        <LatihanReviewList />
      </main>
    </div>
  );
}
