import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PesertaExplorer } from "@/components/admin/peserta-explorer";
import { AdminHeader } from "@/components/admin/admin-header";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Data Peserta — Admin",
};

/**
 * Admin Data Peserta screen (protected).
 *
 * A table of every peserta with their quiz and upload state. Gated by the admin
 * session (defence in depth behind the Proxy). Runs on mock data; filters,
 * search, and export land in later tasks.
 */
export default async function DataPesertaPage() {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="app-surface flex min-h-dvh flex-col">
      <AdminHeader page="Data Peserta" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Data Peserta</h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Daftar peserta training beserta status quiz dan pengumpulan latihan.
          </p>
        </div>

        <PesertaExplorer />
      </main>
    </div>
  );
}
