import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  ListChecks,
  Upload,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
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
    <main className="tpb-aurora mx-auto flex min-h-dvh w-full flex-col items-center gap-8 px-6 py-16 text-center">
      <BrandLogo className="size-20 drop-shadow-sm" />

      <div className="flex max-w-2xl flex-col gap-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          PT Tiga Persada Benua
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Training Penyusunan dan Pengisian{" "}
          <span className="text-tpb-gradient">JSA &amp; HIRADC</span>
        </h1>
        <p className="text-muted-foreground text-base text-pretty sm:text-lg">
          Catering and Associated Service. Portal pelatihan interaktif untuk Tim
          QHSE: pelajari konsep, penyusunan, dan pengisian dokumen JSA &amp;
          HIRADC sesuai standar perusahaan.
        </p>
      </div>

      <Button asChild size="lg">
        <Link href="/materi">
          Mulai Training
          <ArrowRight />
        </Link>
      </Button>

      {/* Every peserta feature, one click away. */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
        {PESERTA_MENU.map(({ href, title, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="glass hover:border-primary/50 hover:tpb-glow group flex items-start gap-3 rounded-xl p-4 transition-all"
          >
            <span className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
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
