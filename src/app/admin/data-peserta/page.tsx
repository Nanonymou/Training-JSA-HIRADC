import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { PesertaTable } from "@/components/admin/peserta-table";
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
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="bg-card border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <span className="text-muted-foreground ml-1 text-sm">/ Data Peserta</span>
        <div className="ml-auto">
          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Data Peserta</h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Daftar peserta training beserta status quiz dan pengumpulan latihan.
          </p>
        </div>

        <PesertaTable />
      </main>
    </div>
  );
}
