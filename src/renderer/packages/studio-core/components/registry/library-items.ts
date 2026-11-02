import type { ComponentEntry } from "../../model/component-types";

interface ComponentLibraryItem {
  componentId: string;
  label: string;
  detail: string;
}

const sizeDetail = (entry: ComponentEntry): string => `${Math.round(entry.width)} × ${Math.round(entry.height)}`;

const variantDetail = (count: number): string => (count === 1 ? "1 variant" : `${count} variants`);

export const libraryItems = (entries: ComponentEntry[]): ComponentLibraryItem[] => {
  const items: ComponentLibraryItem[] = [];
  const seenSets = new Set<string>();
  for (const entry of entries) {
    if (!entry.setId) {
      items.push({ componentId: entry.id, label: entry.name, detail: sizeDetail(entry) });
      continue;
    }
    if (seenSets.has(entry.setId)) continue;
    seenSets.add(entry.setId);
    const count = entries.filter((candidate) => candidate.setId === entry.setId).length;
    items.push({ componentId: entry.id, label: entry.setName ?? entry.name, detail: variantDetail(count) });
  }
  return items;
};
