interface TaggedTemplate {
  tags?: string[];
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

export const collectTopTags = (
  templates: TaggedTemplate[],
  limit: number,
): string[] => {
  const counts = new Map<string, number>();
  for (const template of templates) {
    for (const tag of template.tags ?? []) {
      const key = normalize(tag);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, limit)
    .map(([tag]) => tag);
};
