export const rotateList = <Item,>(items: readonly Item[], offset: number): Item[] => [
  ...items.slice(offset),
  ...items.slice(0, offset),
];
