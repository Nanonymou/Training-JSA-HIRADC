import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardView } from "@/components/admin/dashboard-view";
import { AdminHeader } from "@/components/admin/admin-header";
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
    <div className="app-surface flex min-h-dvh flex-col">
      <AdminHeader page="Monitoring" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Dashboard Monitoring
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Ringkasan peserta, kelulusan, nilai, dan pengumpulan latihan.
          </p>
        </div>

        <DashboardView />
      </main>
    </div>
  );
}
