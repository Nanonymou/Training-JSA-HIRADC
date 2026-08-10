import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { BrandLogo } from "@/components/brand/brand-logo";

/**
 * Shared admin top bar, so every admin screen matches the dashboard.
 *
 * Brand mark (links to the dashboard), the app name, and the current page as a
 * breadcrumb, with a back-to-dashboard link and logout on the right and a thin
 * tri-colour accent along the bottom. Pass no `page` on the dashboard itself.
 */
export function AdminHeader({ page }: { page?: string }) {
  return (
    <header className="bg-card/80 border-border sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur">
      <Link
        href="/admin"
        className="focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px]"
      >
        <BrandLogo className="size-8" />
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">
          Admin — Training JSA &amp; HIRADC
        </span>
      </Link>
      {page && (
        <span className="text-muted-foreground text-sm">/ {page}</span>
      )}
      <div className="ml-auto flex items-center gap-3">
        {page && (
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground hidden items-center gap-1.5 text-sm font-medium sm:flex"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        )}
        <AdminLogoutButton />
      </div>
      <span className="tpb-bar absolute inset-x-0 bottom-0 h-0.5" />
    </header>
  );
}
