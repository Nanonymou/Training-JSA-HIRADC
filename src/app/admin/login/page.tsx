import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { BrandLogo } from "@/components/brand/brand-logo";

export const metadata: Metadata = {
  title: "Login Admin — Training JSA & HIRADC",
};

/**
 * The admin login screen.
 *
 * Exempt from the admin guard (an admin has to be able to reach it) and the only
 * public /admin route. The form reads `?from` via useSearchParams, so it sits
 * behind a Suspense boundary. A link back to the portal home lets a visitor who
 * landed here by mistake return without editing the URL.
 */
export default function AdminLoginPage() {
  return (
    <div className="tpb-aurora flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo className="size-9" />
          <span className="text-sm font-semibold tracking-tight">
            Training JSA &amp; HIRADC
          </span>
        </Link>

        <div className="w-full">
          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>

        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
