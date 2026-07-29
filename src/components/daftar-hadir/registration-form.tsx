"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import {
  DEPARTEMEN,
  JABATAN_OPTIONS,
  LOKASI_OPTIONS,
} from "@/lib/daftar-hadir/options";
import type { Peserta } from "@/lib/daftar-hadir/peserta";
import {
  validateField,
  validateForm,
  type PesertaFormErrors,
  type PesertaFormValues,
} from "@/lib/daftar-hadir/validation";
import { usePeserta } from "@/hooks/use-peserta";

const EMPTY: PesertaFormValues = {
  nama: "",
  email: "",
  jabatan: "",
  lokasi: "",
};

/** Format the captured timestamp for the confirmation card. */
function formatWaktu(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** A labelled field with an inline error slot. */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The Daftar Hadir form — and its confirmation.
 *
 * Captures the peserta's identity (name, email, job, site) with the department
 * fixed to QHSE and the timestamp filled by the system on submit. Email is
 * validated inline because notifications depend on it. Once signed, the same
 * card flips to a confirmation showing the recorded time and that the quiz is
 * unlocked; the registration persists per device (the stub for the eventual
 * Daftar Hadir POST), so returning here shows the confirmation, not a blank form.
 */
/** How long the success card shows before the quiz redirect fires. */
const REDIRECT_DELAY_MS = 1600;

export function RegistrationForm() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { peserta, register, clear } = usePeserta();

  const [values, setValues] = useState<PesertaFormValues>(EMPTY);
  const [errors, setErrors] = useState<PesertaFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  // Set right after a successful submit so the quiz redirect only fires for a
  // fresh registration — not every time an already-signed peserta reopens this.
  const [redirecting, setRedirecting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const goToQuiz = useCallback(() => router.push("/quiz"), [router]);

  // "Ubah data": clear the server session too, so it doesn't outlive the local
  // record and leave the gated endpoints open.
  async function handleClear() {
    try {
      await fetch("/api/daftar-hadir", { method: "DELETE" });
    } catch {
      // Ignore — the local clear below is what the UI reacts to.
    }
    clear();
  }

  // Once the daftar hadir is saved, hand the peserta straight to the (now
  // unlocked) quiz after a short beat so they can see the confirmation.
  useEffect(() => {
    if (!redirecting) return;
    const timer = setTimeout(goToQuiz, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [redirecting, goToQuiz]);

  function update(field: keyof PesertaFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear a field's error as soon as it's corrected; don't nag mid-typing.
    if (errors[field]) {
      const message = validateField(field, value);
      setErrors((current) => ({ ...current, [field]: message }));
    }
  }

  function handleBlur(field: keyof PesertaFormValues) {
    const message = validateField(field, values[field]);
    setErrors((current) => ({ ...current, [field]: message }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first field with an error.
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        "[aria-invalid='true']",
      );
      firstInvalid?.focus();
      return;
    }

    setSubmitting(true);
    // Establish the server session (sets the peserta cookie) so the gated
    // endpoints — quiz and upload — accept this peserta. Best-effort: if the
    // server is unreachable, the local record below still drives the UI.
    try {
      await fetch("/api/daftar-hadir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: values.nama.trim(),
          email: values.email.trim(),
          jabatan: values.jabatan,
          lokasi: values.lokasi,
        }),
      });
    } catch {
      // Offline or server down — proceed with the local record.
    }

    const record: Peserta = {
      nama: values.nama.trim(),
      email: values.email.trim(),
      jabatan: values.jabatan as Peserta["jabatan"],
      lokasi: values.lokasi as Peserta["lokasi"],
      departemen: DEPARTEMEN,
      waktuHadir: new Date().toISOString(),
      browser:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };

    register(record);
    setSubmitting(false);
    setValues(EMPTY);
    setErrors({});
    setRedirecting(true);
  }

  const fade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.25, ease: "easeOut" as const },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {peserta ? (
        <motion.div
          key="confirmation"
          {...fade}
          className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Daftar hadir tersimpan
              </h2>
              <p className="text-muted-foreground text-sm">
                {redirecting
                  ? "Kehadiran tercatat. Mengalihkan ke Quiz…"
                  : `Terima kasih, ${peserta.nama}. Menu Quiz kini terbuka.`}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-0">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{peserta.email}</dd>
            </div>
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-0">
              <dt className="text-muted-foreground">Jabatan</dt>
              <dd className="font-medium">{peserta.jabatan}</dd>
            </div>
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-0">
              <dt className="text-muted-foreground">Lokasi</dt>
              <dd className="font-medium">{peserta.lokasi}</dd>
            </div>
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-0">
              <dt className="text-muted-foreground">Departemen</dt>
              <dd className="font-medium">{peserta.departemen}</dd>
            </div>
          </dl>

          <div className="text-muted-foreground flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <CalendarClock className="size-3.5 shrink-0" />
            Tercatat otomatis: {formatWaktu(peserta.waktuHadir)}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={goToQuiz}>
              {redirecting && <Loader2 className="animate-spin" />}
              {redirecting ? "Ke Quiz sekarang" : "Lanjut ke Quiz"}
              {!redirecting && <ArrowRight />}
            </Button>
            {!redirecting && (
              <Button variant="outline" size="sm" onClick={handleClear}>
                Ubah data
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          ref={formRef}
          {...fade}
          noValidate
          onSubmit={handleSubmit}
          className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6"
        >
          <Field id="nama" label="Nama Lengkap" error={errors.nama}>
            <Input
              id="nama"
              value={values.nama}
              onChange={(event) => update("nama", event.target.value)}
              onBlur={() => handleBlur("nama")}
              placeholder="mis. Budi Santoso"
              aria-invalid={Boolean(errors.nama)}
              aria-describedby={errors.nama ? "nama-error" : undefined}
              autoComplete="name"
            />
          </Field>

          <Field id="email" label="Email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="nama@perusahaan.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              autoComplete="email"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="jabatan" label="Jabatan" error={errors.jabatan}>
              <SelectNative
                id="jabatan"
                value={values.jabatan}
                onChange={(event) => update("jabatan", event.target.value)}
                onBlur={() => handleBlur("jabatan")}
                aria-invalid={Boolean(errors.jabatan)}
                aria-describedby={errors.jabatan ? "jabatan-error" : undefined}
              >
                <option value="" disabled>
                  Pilih jabatan…
                </option>
                {JABATAN_OPTIONS.map((jabatan) => (
                  <option key={jabatan} value={jabatan}>
                    {jabatan}
                  </option>
                ))}
              </SelectNative>
            </Field>

            <Field id="lokasi" label="Lokasi / Site" error={errors.lokasi}>
              <SelectNative
                id="lokasi"
                value={values.lokasi}
                onChange={(event) => update("lokasi", event.target.value)}
                onBlur={() => handleBlur("lokasi")}
                aria-invalid={Boolean(errors.lokasi)}
                aria-describedby={errors.lokasi ? "lokasi-error" : undefined}
              >
                <option value="" disabled>
                  Pilih lokasi…
                </option>
                {LOKASI_OPTIONS.map((lokasi) => (
                  <option key={lokasi} value={lokasi}>
                    {lokasi}
                  </option>
                ))}
              </SelectNative>
            </Field>
          </div>

          <Field id="departemen" label="Departemen">
            <div className="border-input text-muted-foreground flex h-9 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm">
              <ShieldCheck className="size-4" />
              {DEPARTEMEN}
              <span className="ml-auto text-xs">otomatis</span>
            </div>
          </Field>

          <div className="text-muted-foreground flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <CalendarClock className="size-3.5 shrink-0" />
            Tanggal dan jam kehadiran diisi otomatis oleh sistem saat kamu
            mengirim.
          </div>

          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting && <Loader2 className="animate-spin" />}
            {submitting ? "Menyimpan…" : "Simpan Daftar Hadir"}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
