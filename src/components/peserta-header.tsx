import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";

/**
 * Shared top bar for the peserta-facing screens.
 *
 * Carries the TPB brand mark (a link home, so every screen has a way back) and
 * the current page name, with a thin tri-colour accent along the bottom edge.
 */
export function PesertaHeader({ page }: { page: string }) {
  return (
    <header className="bg-card/80 border-border sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur">
      <Link
        href="/"
        className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px]"
      >
        <BrandLogo className="size-8" />
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">
          Training JSA &amp; HIRADC
        </span>
      </Link>
      <span className="text-muted-foreground text-sm font-medium">{page}</span>
      <span className="tpb-bar absolute inset-x-0 bottom-0 h-0.5" />
    </header>
  );
}
