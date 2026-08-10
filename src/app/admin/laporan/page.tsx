import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LaporanTabs } from "@/components/admin/laporan-tabs";
import { AdminHeader } from "@/components/admin/admin-header";
import { getPesertaRecords } from "@/lib/admin/peserta-repository";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Laporan — Admin",
};

export const dynamic = "force-dynamic";

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

  const records = await getPesertaRecords();

  return (
    <div className="app-surface flex min-h-dvh flex-col">
      <AdminHeader page="Laporan" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Laporan Lanjutan
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Rekap kelulusan, pengumpulan latihan, dan statistik per lokasi.
          </p>
        </div>

        <LaporanTabs records={records} />
      </main>
    </div>
  );
}
