import type { SnapRect } from "../snap/snap-engine";
import type { SnapAxis, SnapMeasurement } from "../snap/snap-measure";

interface AxisSpan {
  start: number;
  end: number;
}

const spanOf = (rect: SnapRect, axis: SnapAxis): AxisSpan =>
  axis === "x"
    ? { start: rect.x, end: rect.x + rect.width }
    : { start: rect.y, end: rect.y + rect.height };

const otherAxis = (axis: SnapAxis): SnapAxis => (axis === "x" ? "y" : "x");

const midpoint = (span: AxisSpan): number => (span.start + span.end) / 2;

const toMeasurement = (axis: SnapAxis, start: number, end: number, cross: number): SnapMeasurement => ({
  axis,
  start,
  end,
  cross,
  toPageEdge: false,
  equal: false,
});

const contains = (outer: SnapRect, inner: SnapRect): boolean =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

const crossLine = (selected: SnapRect, target: SnapRect, axis: SnapAxis): number => {
  const selectedCross = spanOf(selected, otherAxis(axis));
  const targetCross = spanOf(target, otherAxis(axis));
  const start = Math.max(selectedCross.start, targetCross.start);
  const end = Math.min(selectedCross.end, targetCross.end);
  return end > start ? (start + end) / 2 : midpoint(selectedCross);
};

const insideGaps = (selected: SnapRect, target: SnapRect, axis: SnapAxis): SnapMeasurement[] => {
  const inner = spanOf(selected, axis);
  const outer = spanOf(target, axis);
  const cross = midpoint(spanOf(selected, otherAxis(axis)));
  return [
    toMeasurement(axis, outer.start, inner.start, cross),
    toMeasurement(axis, inner.end, outer.end, cross),
  ];
};

const outsideGap = (selected: SnapRect, target: SnapRect, axis: SnapAxis): SnapMeasurement[] => {
  const selectedSpan = spanOf(selected, axis);
  const targetSpan = spanOf(target, axis);
  const cross = crossLine(selected, target, axis);
  if (selectedSpan.end <= targetSpan.start) return [toMeasurement(axis, selectedSpan.end, targetSpan.start, cross)];
  if (targetSpan.end <= selectedSpan.start) return [toMeasurement(axis, targetSpan.end, selectedSpan.start, cross)];
  return [];
};

export const measureBetween = (selected: SnapRect, target: SnapRect): SnapMeasurement[] => {
  const axisGaps = contains(target, selected) ? insideGaps : outsideGap;
  return [...axisGaps(selected, target, "x"), ...axisGaps(selected, target, "y")].filter(
    (measurement) => Math.round(measurement.end - measurement.start) > 0,
  );
};
