import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Dashboard Monitoring — Admin",
};

/**
 * Admin monitoring dashboard (protected).
 *
 * A glance at training health — headline tiles now, with per-site charts added in
 * later tasks. Gated by the admin session (defence in depth behind the Proxy);
 * runs on mock data.
 */
export default async function DashboardMonitoringPage() {
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
        <span className="text-muted-foreground ml-1 text-sm">/ Monitoring</span>
        <div className="ml-auto">
          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Dashboard Monitoring
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Ringkasan peserta, kelulusan, nilai, dan pengumpulan latihan.
          </p>
        </div>

        <DashboardStats />
      </main>
    </div>
  );
}
