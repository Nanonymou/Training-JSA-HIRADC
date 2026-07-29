"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Only allow same-origin relative paths as the post-login destination. */
function safeFrom(from: string | null): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) return from;
  return "/admin";
}

/**
 * The admin login form.
 *
 * Posts credentials to the login endpoint; on success the server sets the admin
 * session cookie and the form routes to where the admin was headed (`from`) or
 * the dashboard. Errors are shown inline and kept generic, matching the API.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const destination = safeFrom(params.get("from"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Gagal masuk. Coba lagi.");
        setSubmitting(false);
        return;
      }
      // Cookie is set; navigate and refresh so the middleware sees the session.
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border-border flex w-full flex-col gap-4 rounded-xl border p-6"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
          <Lock className="size-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Login Admin</h1>
          <p className="text-muted-foreground text-sm">
            Masuk untuk mengelola pelatihan JSA &amp; HIRADC.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@perusahaan.com"
          autoComplete="username"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="animate-spin" />}
        {submitting ? "Memeriksa…" : "Masuk"}
      </Button>
    </form>
  );
}
