"use client";

import { motion, useReducedMotion } from "motion/react";

import { getLokasiStats } from "@/lib/admin/dashboard";

/**
 * Per-site comparison of peserta counts — a horizontal bar chart.
 *
 * One series (jumlah peserta), so one hue (the brand primary) and no legend; the
 * heading names the measure. Bars are baseline-anchored with rounded ends and
 * grow in on mount (respecting reduced motion). Each row is directly labelled
 * with the count and a lulus/upload breakdown, so the small dataset needs no
 * hover tooltip to be read. Runs on the mock aggregates.
 */
export function LokasiBarChart() {
  const reduceMotion = useReducedMotion();
  const stats = getLokasiStats();
  const max = Math.max(1, ...stats.map((s) => s.peserta));

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
          return (
            <li key={stat.lokasi} className="flex flex-col gap-1">
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
