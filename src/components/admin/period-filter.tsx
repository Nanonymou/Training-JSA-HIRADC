import { Input } from "@/components/ui/input";

/**
 * A from/to date-range filter, controlled by the parent.
 *
 * Shared across the report tabs so the period control stays consistent. Values
 * are ISO days (yyyy-mm-dd) from native date inputs; each side bounds the other.
 */
export function PeriodFilter({
  from,
  to,
  onFrom,
  onTo,
  idPrefix = "periode",
}: {
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  idPrefix?: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-dari`} className="text-xs font-medium">
          Dari
        </label>
        <Input
          id={`${idPrefix}-dari`}
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onFrom(event.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-sampai`} className="text-xs font-medium">
          Sampai
        </label>
        <Input
          id={`${idPrefix}-sampai`}
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onTo(event.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
}

/** True when `iso`'s day falls within [from, to] (either side optional). */
export function withinPeriod(iso: string, from: string, to: string): boolean {
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}
