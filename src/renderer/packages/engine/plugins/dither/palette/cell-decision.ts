import { OKLAB_M2 } from "./oklab-matrices";
import type { PreparedPalette } from "./palette-space";
import { PLANE_STRIDE } from "./rival-planes";

const AXES = 3;
const CONE_MARGIN = 1e-5;
const HALF = 0.5;

const coneLow = new Float64Array(AXES);
const coneHigh = new Float64Array(AXES);

const coneBoundsAt = (coneSpan: Float64Array, axis: number): void => {
  coneLow[axis] = Math.cbrt(coneSpan[axis]) - CONE_MARGIN;
  coneHigh[axis] = Math.cbrt(coneSpan[axis + AXES]) + CONE_MARGIN;
};

const labAtCentre = (row: number): number => {
  let value = 0;
  for (let axis = 0; axis < AXES; axis++) value += OKLAB_M2[row][axis] * (coneLow[axis] + coneHigh[axis]) * HALF;
  return value;
};

const closestToCentre = (prepared: PreparedPalette): number => {
  const centreL = labAtCentre(0);
  const centreA = labAtCentre(1);
  const centreB = labAtCentre(2);
  let best = 0;
  let bestDistance = Infinity;
  for (let index = 0; index < prepared.size; index++) {
    const offset = index * AXES;
    const distance = (centreL - prepared.lab[offset]) ** 2 + (centreA - prepared.lab[offset + 1]) ** 2 + (centreB - prepared.lab[offset + 2]) ** 2;
    if (distance < bestDistance) { bestDistance = distance; best = index; }
  }
  return best;
};

const alwaysCloser = (planes: Float64Array, offset: number): boolean => {
  let worstCase = planes[offset + AXES];
  for (let axis = 0; axis < AXES; axis++) {
    const weight = planes[offset + axis];
    worstCase += weight >= 0 ? weight * coneHigh[axis] : weight * coneLow[axis];
  }
  return worstCase < 0;
};

export const collectCandidates = (
  prepared: PreparedPalette, planes: Float64Array, coneSpan: Float64Array, candidates: Uint32Array,
): number => {
  for (let axis = 0; axis < AXES; axis++) coneBoundsAt(coneSpan, axis);
  const winner = closestToCentre(prepared);
  const winnerPlanes = winner * prepared.size * PLANE_STRIDE;
  let count = 0;
  for (let rival = 0; rival < prepared.size; rival++) {
    if (rival === winner || !alwaysCloser(planes, winnerPlanes + rival * PLANE_STRIDE)) candidates[count++] = rival;
  }
  return count;
};
