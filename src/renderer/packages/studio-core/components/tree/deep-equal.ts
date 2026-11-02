const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const arraysEqual = (left: unknown[], right: unknown[]): boolean =>
  left.length === right.length && left.every((item, index) => deepEqual(item, right[index]));

const objectsEqual = (left: Record<string, unknown>, right: Record<string, unknown>): boolean => {
  const leftKeys = Object.keys(left).filter((key) => left[key] !== undefined);
  const rightKeys = Object.keys(right).filter((key) => right[key] !== undefined);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => deepEqual(left[key], right[key]));
};

export const deepEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) return arraysEqual(left, right);
  if (isPlainObject(left) && isPlainObject(right)) return objectsEqual(left, right);
  return false;
};
