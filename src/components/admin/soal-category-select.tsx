import { SelectNative } from "@/components/ui/select-native";
import { SOAL_CATEGORIES } from "@/lib/admin/soal-categories";

/** Sentinel for "all categories" in a filter context. */
export const CATEGORY_ALL = "all";

/**
 * A category dropdown for quiz questions.
 *
 * Controlled and presentational, sharing one option list. `includeAll` adds a
 * "Semua kategori" option so the same control works as both a form field and a
 * list filter.
 */
export function SoalCategorySelect({
  value,
  onChange,
  id = "kategori",
  includeAll = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  includeAll?: boolean;
  className?: string;
}) {
  return (
    <SelectNative
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={className}
    >
      {includeAll && <option value={CATEGORY_ALL}>Semua kategori</option>}
      {SOAL_CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </SelectNative>
  );
}
