import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TrainingList } from "@/components/admin/training-list";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminTrainings } from "@/lib/admin/training-repository";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Training — Admin",
};

export const dynamic = "force-dynamic";

/**
 * Admin multi-training management (protected).
 *
 * Lists training topics with an active toggle so the platform can offer more than
 * JSA & HIRADC. Gated by the admin session; the create form comes in later tasks.
 */
export default async function TrainingPage() {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");

  const items = await getAdminTrainings();

  return (
    <div className="app-surface flex min-h-dvh flex-col">
      <AdminHeader page="Training" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Manajemen Training
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            Kelola topik training yang tersedia untuk peserta dan aktif/nonaktifkan
            sesuai kebutuhan.
          </p>
        </div>

        <TrainingList initialItems={items} />
      </main>
    </div>
  );
}
