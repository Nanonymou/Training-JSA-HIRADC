import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { BankSoalList } from "@/components/admin/bank-soal-list";
import { getSoalRecords } from "@/lib/admin/bank-soal-repository";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Bank Soal — Admin",
};

export const dynamic = "force-dynamic";

/**
 * Admin bank soal management (protected).
 *
 * Loads the question bank from the database (seeded on first run) and hands it to
 * the client list, which persists every add/edit/delete/duplicate through the
 * bank-soal API. Gated by the admin session.
 */
export default async function BankSoalPage() {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  const items = await getSoalRecords();

  return (
    <div className="flex min-h-dvh flex-col">
      <AdminHeader page="Bank Soal" />

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

        <BankSoalList initialItems={items} />
      </main>
    </div>
  );
}
