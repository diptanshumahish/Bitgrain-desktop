export const replaceAt = <T>(items: T[], index: number, next: T): T[] =>
  items.map((item, itemIndex) => (itemIndex === index ? next : item));

export const removeAt = <T>(items: T[], index: number): T[] => items.filter((_, itemIndex) => itemIndex !== index);

export const moveItem = <T>(items: T[], index: number, delta: number): T[] => {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
};

interface IndexedItem<T> {
  item: T;
  index: number;
}

export const topFirst = <T>(items: T[]): IndexedItem<T>[] => items.map((item, index) => ({ item, index })).reverse();
