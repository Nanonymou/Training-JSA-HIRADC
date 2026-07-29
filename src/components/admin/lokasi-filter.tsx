import { SelectNative } from "@/components/ui/select-native";
import { LOKASI_OPTIONS } from "@/lib/daftar-hadir/options";

/** Sentinel value for "no site filter". */
export const LOKASI_ALL = "all";

/**
 * A site filter dropdown: "Semua lokasi" plus the nine baku sites.
 *
 * Controlled and presentational — the parent owns the value — so the dashboard
 * and any other per-site view can share one consistent control and option list.
 */
export function LokasiFilter({
  value,
  onChange,
  id = "lokasi-filter",
  label = "Lokasi",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <SelectNative
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className ?? "w-44"}
      >
        <option value={LOKASI_ALL}>Semua lokasi</option>
        {LOKASI_OPTIONS.map((site) => (
          <option key={site} value={site}>
            {site}
          </option>
        ))}
      </SelectNative>
    </div>
  );
}
