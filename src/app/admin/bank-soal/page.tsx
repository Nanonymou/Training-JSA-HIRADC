import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { BankSoalList } from "@/components/admin/bank-soal-list";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Bank Soal — Admin",
};

/**
 * Admin bank soal management (protected).
 *
 * Lists the quiz questions with their options and the correct answer, and (in
 * later tasks) lets the admin add, edit, and remove questions. Gated by the admin
 * session; runs on the mock question bank.
 */
export default async function BankSoalPage() {
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
        <span className="text-muted-foreground ml-1 text-sm">/ Bank Soal</span>
        <div className="ml-auto">
          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Manajemen Bank Soal
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Kelola soal quiz: tambah, sunting, atau hapus. Jawaban benar ditandai
            hijau.
          </p>
        </div>

        <BankSoalList />
      </main>
    </div>
  );
}
