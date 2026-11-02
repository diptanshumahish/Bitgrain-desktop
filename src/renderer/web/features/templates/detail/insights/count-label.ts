export const countLabel = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

export const joinWithAnd = (items: string[]): string => {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};
