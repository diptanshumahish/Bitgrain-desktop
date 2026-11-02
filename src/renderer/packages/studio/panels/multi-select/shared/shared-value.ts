export interface SharedValue<T> {
  value: T | null;
  first: T | null;
  mixed: boolean;
}

export const sharedValue = <T,>(values: Array<T | null>): SharedValue<T> => {
  const present = values.filter((value): value is T => value !== null);
  const first = present[0] ?? null;
  const mixed = present.some((value) => value !== first);
  return { value: mixed ? null : first, first, mixed };
};
