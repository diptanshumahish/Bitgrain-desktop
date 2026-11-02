import {
  IDENTITY, multiply, rotation, scaling, skewX, skewY, translation, type Matrix,
} from "./matrix";

const TRANSFORM_PATTERN = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
const MATRIX_ARG_COUNT = 6;
const ROTATE_WITH_PIVOT_ARGS = 3;

const parseNumbers = (raw: string): number[] =>
  (raw.match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? []).map(Number);

const rotateMatrix = (args: number[]): Matrix => {
  const [angle = 0, pivotX = 0, pivotY = 0] = args;
  if (args.length < ROTATE_WITH_PIVOT_ARGS) return rotation(angle);
  return multiply(multiply(translation(pivotX, pivotY), rotation(angle)), translation(-pivotX, -pivotY));
};

const matrixFromArgs = (args: number[]): Matrix => {
  if (args.length < MATRIX_ARG_COUNT) return IDENTITY;
  const [a, b, c, d, e, f] = args;
  return { a, b, c, d, e, f };
};

const singleTransform = (name: string, args: number[]): Matrix => {
  if (name === "matrix") return matrixFromArgs(args);
  if (name === "translate") return translation(args[0] ?? 0, args[1] ?? 0);
  if (name === "scale") return scaling(args[0] ?? 1, args[1] ?? args[0] ?? 1);
  if (name === "rotate") return rotateMatrix(args);
  if (name === "skewX") return skewX(args[0] ?? 0);
  if (name === "skewY") return skewY(args[0] ?? 0);
  return IDENTITY;
};

export const parseTransform = (value: string | null): Matrix => {
  if (!value) return IDENTITY;
  let result = IDENTITY;
  for (const match of value.matchAll(TRANSFORM_PATTERN)) {
    result = multiply(result, singleTransform(match[1], parseNumbers(match[2])));
  }
  return result;
};
