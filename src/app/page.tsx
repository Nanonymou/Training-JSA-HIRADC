import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  ListChecks,
  ShieldCheck,
  Upload,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { TrainingSelector } from "@/components/training-selector";
import { Button } from "@/components/ui/button";
import { getActiveTrainings } from "@/lib/admin/cms-materi";

/**
 * Landing page for the training portal.
 *
 * A hero for the JSA & HIRADC training plus a menu of every peserta feature —
 * Materi, Daftar Hadir, Quiz, and Kirim Latihan — so each screen is reachable
 * with a click, not just by typing its URL. A discreet Admin link sits in the
 * footer for the QHSE team.
 */

interface MenuItem {
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const PESERTA_MENU: MenuItem[] = [
  {
    href: "/materi",
    title: "Materi",
    desc: "Pelajari konsep & pengisian JSA & HIRADC secara interaktif.",
    icon: BookOpen,
  },
  {
    href: "/daftar-hadir",
    title: "Daftar Hadir",
    desc: "Isi kehadiran dulu untuk membuka akses Quiz.",
    icon: ClipboardList,
  },
  {
    href: "/quiz",
    title: "Quiz",
    desc: "Uji pemahaman — terkunci sampai daftar hadir diisi.",
    icon: ListChecks,
  },
  {
    href: "/kirim-latihan",
    title: "Kirim Latihan",
    desc: "Unggah berkas latihan JSA/HIRADC untuk ditinjau admin.",
    icon: Upload,
  },
];

export default function Home() {
  const trainings = getActiveTrainings();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center gap-8 px-6 py-16 text-center">
      <span className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-2xl">
        <ShieldCheck className="size-7" />
      </span>

      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Training Penyusunan dan Pengisian JSA &amp; HIRADC
        </h1>
        <p className="text-muted-foreground text-base text-pretty sm:text-lg">
          PT Tiga Persada Benua — Catering and Associated Service. Portal
          pelatihan interaktif untuk Tim QHSE: pelajari konsep, penyusunan, dan
          pengisian dokumen JSA &amp; HIRADC sesuai standar perusahaan.
        </p>
      </div>

      <Button asChild size="lg">
        <Link href="/materi">
          Mulai Training
          <ArrowRight />
        </Link>
      </Button>

      {/* Every peserta feature, one click away. */}
      <div className="grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
        {PESERTA_MENU.map(({ href, title, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-card border-border hover:border-primary/40 flex items-start gap-3 rounded-xl border p-4 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-muted-foreground text-xs text-pretty">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <TrainingSelector initial={trainings} />

      <Link
        href="/admin/login"
        className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1.5 text-xs underline-offset-4 hover:underline"
      >
        <UserCog className="size-3.5" />
        Masuk sebagai Admin
      </Link>
    </main>
  );
}
