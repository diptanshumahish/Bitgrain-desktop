export interface FontFamilyOption {
  label: string;
  value: string;
  group: string;
}

export function groupFontFamilies(fonts: FontFamilyOption[]): FontFamilyOption[] {
  const seenValues = new Set<string>();
  const byGroup = new Map<string, FontFamilyOption[]>();
  for (const font of fonts) {
    if (seenValues.has(font.value)) continue;
    seenValues.add(font.value);
    byGroup.set(font.group, [...(byGroup.get(font.group) ?? []), font]);
  }
  return [...byGroup.values()].flat();
}
