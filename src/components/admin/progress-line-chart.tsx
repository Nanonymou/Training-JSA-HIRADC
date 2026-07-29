"use client";

import { useId, useState } from "react";

import { getProgressTrend } from "@/lib/admin/dashboard";
import type { PesertaRecord } from "@/lib/admin/peserta";

const WIDTH = 320;
const HEIGHT = 150;
const PAD = { top: 12, right: 12, bottom: 24, left: 24 };

function shortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Cumulative attendance trend — a single-series line chart.
 *
 * One measure (cumulative peserta), so one hue (brand primary), no legend, a soft
 * area under the line, and points that respond to hover with a tooltip. Built as
 * plain SVG with a token-coloured recessive baseline; reads the mock daily trend.
 */
export function ProgressLineChart({ rows }: { rows?: PesertaRecord[] }) {
  const gradientId = useId();
  const [active, setActive] = useState<number | null>(null);
  const points = getProgressTrend(rows);

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const maxValue = Math.max(1, ...points.map((p) => p.peserta));
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((point, index) => ({
    ...point,
    x: PAD.left + index * stepX,
    y: PAD.top + innerH - (point.peserta / maxValue) * innerH,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x} ${PAD.top + innerH} L ${coords[0].x} ${PAD.top + innerH} Z`
      : "";

  const activePoint = active !== null ? coords[active] : null;

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold tracking-tight">Tren Progress</h2>
        <p className="text-muted-foreground text-xs">
          Jumlah peserta kumulatif dari waktu ke waktu.
        </p>
      </div>

      {points.length === 0 ? (
        <div className="text-muted-foreground flex h-44 items-center justify-center text-sm">
          Belum ada data untuk lokasi ini.
        </div>
      ) : (
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-44 w-full"
          role="img"
          aria-label="Grafik tren peserta kumulatif"
          onMouseLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Baseline */}
          <line
            x1={PAD.left}
            y1={PAD.top + innerH}
            x2={WIDTH - PAD.right}
            y2={PAD.top + innerH}
            stroke="var(--border)"
            strokeWidth={1}
          />

          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {coords.map((c, index) => (
            <g key={c.date}>
              {activePoint && active === index && (
                <line
                  x1={c.x}
                  y1={PAD.top}
                  x2={c.x}
                  y2={PAD.top + innerH}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
              )}
              <circle
                cx={c.x}
                cy={c.y}
                r={active === index ? 4.5 : 3}
                fill="var(--primary)"
                stroke="var(--card)"
                strokeWidth={1.5}
              />
              {/* Larger transparent hit target */}
              <circle
                cx={c.x}
                cy={c.y}
                r={10}
                fill="transparent"
                onMouseEnter={() => setActive(index)}
              />
              {index % 2 === 0 && (
                <text
                  x={c.x}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={8}
                >
                  {shortDate(c.date)}
                </text>
              )}
            </g>
          ))}
        </svg>

        {activePoint && (
          <div
            className="bg-popover border-border pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border px-2 py-1 text-xs shadow-md"
            style={{
              left: `${(activePoint.x / WIDTH) * 100}%`,
              top: `${(activePoint.y / HEIGHT) * 100}%`,
            }}
          >
            <p className="font-medium">{shortDate(activePoint.date)}</p>
            <p className="text-muted-foreground tabular-nums">
              {activePoint.peserta} peserta · {activePoint.lulus} lulus
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
