import { cn } from "@/lib/utils";

/**
 * The PT Tiga Persada Benua brand mark.
 *
 * A hollow tri-colour triangle — merah (kiri), biru (kanan), hijau (bawah) —
 * with "TPB" in the centre, rendered as inline SVG so it stays crisp at any size
 * and needs no external asset. "TPB" uses currentColor so it reads on both light
 * and dark surfaces.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-8", className)}
      role="img"
      aria-label="Logo PT Tiga Persada Benua"
    >
      {/* Sisi kiri — merah */}
      <polygon points="50,8 8,90 29,76.3 50,35.3" fill="#E11D22" />
      {/* Sisi kanan — biru */}
      <polygon points="50,8 50,35.3 71,76.3 92,90" fill="#2536E8" />
      {/* Sisi bawah — hijau */}
      <polygon points="8,90 29,76.3 71,76.3 92,90" fill="#35D835" />
      <text
        x="50"
        y="71"
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        TPB
      </text>
    </svg>
  );
}
