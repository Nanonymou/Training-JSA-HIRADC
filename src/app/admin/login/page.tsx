import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Login Admin — Training JSA & HIRADC",
};

/**
 * The admin login screen.
 *
 * Exempt from the admin guard (an admin has to be able to reach it) and the only
 * public /admin route. The form reads `?from` via useSearchParams, so it sits
 * behind a Suspense boundary.
 */
export default function AdminLoginPage() {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
