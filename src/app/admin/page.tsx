import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileBarChart,
  FileCheck2,
  Layers,
  ListChecks,
  Users,
} from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Dashboard Admin — Training JSA & HIRADC",
};

/**
 * The admin dashboard (protected).
 *
 * The middleware already gates every /admin route, but the session is also read
 * here — both to greet the signed-in admin and as defence in depth, redirecting
 * to login if it's somehow missing. The management surfaces (CMS, bank soal,
 * review, reports) land in later phases; this establishes the authenticated shell.
 */
export default async function AdminDashboardPage() {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="bg-card/80 border-border sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur">
        <BrandLogo className="size-8" />
        <span className="text-sm font-semibold tracking-tight">
          Admin — Training JSA &amp; HIRADC
        </span>
        <div className="ml-auto">
          <AdminLogoutButton />
        </div>
        <span className="tpb-bar absolute inset-x-0 bottom-0 h-0.5" />
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Masuk sebagai{" "}
            <span className="text-foreground font-medium">{session.email}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/admin/latihan"
            className="bg-card border-border hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <FileCheck2 className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Review Latihan</p>
              <p className="text-muted-foreground text-xs">
                Tinjau &amp; pratinjau berkas peserta
              </p>
            </div>
          </Link>

          <Link
            href="/admin/data-peserta"
            className="bg-card border-border hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Data Peserta</p>
              <p className="text-muted-foreground text-xs">
                Status quiz &amp; upload per peserta
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard"
            className="bg-card border-border hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <BarChart3 className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Monitoring</p>
              <p className="text-muted-foreground text-xs">
                Statistik &amp; grafik training
              </p>
            </div>
          </Link>

          <Link
            href="/admin/cms-materi"
            className="bg-card border-border hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <BookOpen className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">CMS Materi</p>
              <p className="text-muted-foreground text-xs">
                Kelola topik &amp; materi training
              </p>
            </div>
          </Link>

          <Link
            href="/admin/bank-soal"
            className="bg-card border-border hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <ListChecks className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Bank Soal</p>
              <p className="text-muted-foreground text-xs">
                Kelola soal quiz
              </p>
            </div>
          </Link>

          <Link
            href="/admin/laporan"
            className="bg-card border-border hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <FileBarChart className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Laporan</p>
              <p className="text-muted-foreground text-xs">
                Rekap &amp; ekspor laporan
              </p>
            </div>
          </Link>

          <Link
            href="/admin/training"
            className="bg-card border-border hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <Layers className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Multi-Training</p>
              <p className="text-muted-foreground text-xs">
                Kelola beberapa topik training
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
