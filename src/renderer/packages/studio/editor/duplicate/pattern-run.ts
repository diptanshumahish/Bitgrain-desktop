import type { Layer } from "@bitgrain/studio-core/model/studio-types";

const STEP_TOLERANCE_PX = 0.5;
const MIN_PATTERN_ITEMS = 2;

interface Point {
  x: number;
  y: number;
}

interface PatternRun {
  step: Point;
  tail: Layer;
}

const stepBetween = (from: Layer, to: Layer): Point => ({ x: to.x - from.x, y: to.y - from.y });

const isSameStep = (left: Point, right: Point): boolean =>
  Math.abs(left.x - right.x) <= STEP_TOLERANCE_PX && Math.abs(left.y - right.y) <= STEP_TOLERANCE_PX;

const uniformStep = (ordered: Layer[]): Point | null => {
  const step = stepBetween(ordered[0], ordered[1]);
  if (isSameStep(step, { x: 0, y: 0 })) return null;
  const isUniform = ordered.every((layer, index) => index === 0 || isSameStep(stepBetween(ordered[index - 1], layer), step));
  return isUniform ? step : null;
};

const byColumnThenRow = (left: Layer, right: Layer): number => left.x - right.x || left.y - right.y;
const byRowThenColumn = (left: Layer, right: Layer): number => left.y - right.y || left.x - right.x;

export const findPatternRun = (children: Layer[]): PatternRun | null => {
  if (children.length < MIN_PATTERN_ITEMS) return null;
  const orderings = [children, [...children].sort(byColumnThenRow), [...children].sort(byRowThenColumn)];
  for (const ordered of orderings) {
    const step = uniformStep(ordered);
    if (step) return { step, tail: ordered[ordered.length - 1] };
  }
  return null;
};

export const placeAlongPattern = (clones: Layer[], run: PatternRun): Layer[] =>
  clones.map((clone, index): Layer => ({
    ...clone,
    x: run.tail.x + run.step.x * (index + 1),
    y: run.tail.y + run.step.y * (index + 1),
  }));
