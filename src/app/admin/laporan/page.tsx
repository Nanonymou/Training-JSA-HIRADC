import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { LaporanTabs } from "@/components/admin/laporan-tabs";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Laporan — Admin",
};

/**
 * Admin reports (protected).
 *
 * Tabbed advanced reports — quiz pass rate, latihan submissions, and per-site
 * recap — each with its own table, chart, and export (added in later tasks).
 * Gated by the admin session.
 */
export default async function LaporanPage() {
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
        <span className="text-muted-foreground ml-1 text-sm">/ Laporan</span>
        <div className="ml-auto">
          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Laporan Lanjutan
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Rekap kelulusan, pengumpulan latihan, dan statistik per lokasi.
          </p>
        </div>

        <LaporanTabs />
      </main>
    </div>
  );
}
