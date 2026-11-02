import type { SizeGroup } from "@bitgrain/studio-core/design-sizes/size-groups";
import type { DesignFormat } from "@bitgrain/studio-core/design-sizes/new-design-formats";

const matchesQuery = (format: DesignFormat, query: string): boolean =>
  `${format.label} ${format.detail}`.toLowerCase().includes(query);

export function filterSizeGroups(groups: SizeGroup[], rawQuery: string): SizeGroup[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return groups;
  return groups
    .map((group) => ({ ...group, formats: group.formats.filter((format) => matchesQuery(format, query)) }))
    .filter((group) => group.formats.length > 0);
}
