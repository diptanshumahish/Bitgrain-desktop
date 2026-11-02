import { OKLAB_M2 } from "./oklab-matrices";

export const PLANE_STRIDE = 4;

const AXES = 3;
const LAB_MARGIN = 1e-5;
const REQUIRED_GAP = 1e-9;
const BIAS_SLOT = 3;

const writePlane = (lab: Float32Array, winner: number, rival: number, planes: Float64Array, offset: number): void => {
  let bias = REQUIRED_GAP;
  for (let row = 0; row < AXES; row++) {
    const winnerValue = lab[winner * AXES + row];
    const rivalValue = lab[rival * AXES + row];
    const normal = 2 * (rivalValue - winnerValue);
    bias += Math.abs(normal) * LAB_MARGIN - (rivalValue * rivalValue - winnerValue * winnerValue);
    for (let axis = 0; axis < AXES; axis++) planes[offset + axis] += normal * OKLAB_M2[row][axis];
  }
  planes[offset + BIAS_SLOT] = bias;
};

export const buildRivalPlanes = (lab: Float32Array, size: number): Float64Array => {
  const planes = new Float64Array(size * size * PLANE_STRIDE);
  for (let winner = 0; winner < size; winner++) {
    for (let rival = 0; rival < size; rival++) writePlane(lab, winner, rival, planes, (winner * size + rival) * PLANE_STRIDE);
  }
  return planes;
};
