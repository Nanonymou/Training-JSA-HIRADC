"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { getLokasiStats } from "@/lib/admin/dashboard";
import { LOKASI_ALL } from "@/components/admin/lokasi-filter";
import { cn } from "@/lib/utils";

/**
 * Per-site comparison of peserta counts — a horizontal bar chart.
 *
 * One series (jumlah peserta), so one hue (the brand primary) and no legend; the
 * heading names the measure. Bars are baseline-anchored with rounded ends and
 * grow in on mount (respecting reduced motion). Each row is directly labelled
 * with the count, and hovering a bar reveals a tooltip with the lulus/upload
 * breakdown and pass rate. Runs on the mock aggregates.
 */
export function LokasiBarChart({
  activeLokasi = LOKASI_ALL,
}: {
  activeLokasi?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const stats = getLokasiStats();
  const max = Math.max(1, ...stats.map((s) => s.peserta));
  const hasFocus = activeLokasi !== LOKASI_ALL;

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold tracking-tight">
          Perbandingan per Lokasi
        </h2>
        <p className="text-muted-foreground text-xs">
          Jumlah peserta per site (dari {stats.length} lokasi).
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {stats.map((stat) => {
          const ratio = stat.peserta / max;
          const dimmed = hasFocus && stat.lokasi !== activeLokasi;
          const rate =
            stat.peserta === 0
              ? 0
              : Math.round((stat.lulus / stat.peserta) * 100);
          return (
            <li
              key={stat.lokasi}
              onMouseEnter={() => setHover(stat.lokasi)}
              onMouseLeave={() => setHover((cur) => (cur === stat.lokasi ? null : cur))}
              className={cn(
                "relative flex flex-col gap-1 transition-opacity",
                dimmed && "opacity-40",
              )}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stat.lokasi}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {stat.peserta} peserta
                </span>
              </div>
              <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  initial={reduceMotion ? false : { width: 0 }}
                  whileInView={{ width: `${Math.round(ratio * 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={reduceMotion ? { width: `${Math.round(ratio * 100)}%` } : undefined}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {stat.lulus} lulus · {stat.upload} upload
              </p>

              {hover === stat.lokasi && (
                <div className="bg-popover border-border pointer-events-none absolute top-0 right-0 z-10 -translate-y-full rounded-md border px-2.5 py-1.5 text-xs shadow-md">
                  <p className="font-medium">{stat.lokasi}</p>
                  <p className="text-muted-foreground tabular-nums">
                    {stat.peserta} peserta · {stat.lulus} lulus ({rate}%) ·{" "}
                    {stat.upload} upload
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
