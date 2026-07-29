"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Logs the admin out by clearing the session cookie, then returns to login.
 * Refreshes so the middleware re-evaluates on the way out.
 */
export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={logout} disabled={busy}>
      <LogOut />
      Keluar
    </Button>
  );
}
