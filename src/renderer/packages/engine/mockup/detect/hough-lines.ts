import type { GradientField } from "./sobel";

const THETA_STEPS = 180;
const PEAK_VOTE_FRACTION = 0.3;
const THETA_SUPPRESS = 5;
const RHO_SUPPRESS = 14;

export interface HoughLine {
  theta: number;
  rho: number;
  votes: number;
}

interface Accumulator {
  votes: Float32Array;
  rhoBins: number;
  rhoOffset: number;
  maxVotes: number;
}

const buildAccumulator = (field: GradientField, threshold: number): Accumulator => {
  const { magnitude, width, height } = field;
  const rhoOffset = Math.ceil(Math.hypot(width, height));
  const rhoBins = rhoOffset * 2 + 1;
  const votes = new Float32Array(THETA_STEPS * rhoBins);

  const cosines = new Float32Array(THETA_STEPS);
  const sines = new Float32Array(THETA_STEPS);
  for (let step = 0; step < THETA_STEPS; step += 1) {
    const theta = (step * Math.PI) / THETA_STEPS;
    cosines[step] = Math.cos(theta);
    sines[step] = Math.sin(theta);
  }

  let maxVotes = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const weight = magnitude[y * width + x];
      if (weight < threshold) continue;
      for (let step = 0; step < THETA_STEPS; step += 1) {
        const rho = Math.round(x * cosines[step] + y * sines[step]) + rhoOffset;
        const index = step * rhoBins + rho;
        votes[index] += weight;
        if (votes[index] > maxVotes) maxVotes = votes[index];
      }
    }
  }
  return { votes, rhoBins, rhoOffset, maxVotes };
};

const isSuppressed = (candidate: HoughLine, picked: HoughLine[], rhoBins: number): boolean =>
  picked.some((line) => {
    const rawThetaGap = Math.abs(line.theta - candidate.theta);
    const thetaGap = Math.min(rawThetaGap, THETA_STEPS - rawThetaGap);
    return thetaGap <= THETA_SUPPRESS && Math.abs(line.rho - candidate.rho) <= RHO_SUPPRESS && rhoBins > 0;
  });

export const detectLines = (field: GradientField, threshold: number, maxLines: number): HoughLine[] => {
  const { votes, rhoBins, rhoOffset, maxVotes } = buildAccumulator(field, threshold);
  if (maxVotes <= 0) return [];

  const minimumVotes = maxVotes * PEAK_VOTE_FRACTION;
  const candidates: HoughLine[] = [];
  for (let step = 0; step < THETA_STEPS; step += 1) {
    for (let rho = 0; rho < rhoBins; rho += 1) {
      const value = votes[step * rhoBins + rho];
      if (value < minimumVotes) continue;
      candidates.push({ theta: step, rho: rho - rhoOffset, votes: value });
    }
  }

  candidates.sort((first, second) => second.votes - first.votes);
  const picked: HoughLine[] = [];
  for (const candidate of candidates) {
    if (picked.length >= maxLines) break;
    if (isSuppressed(candidate, picked, rhoBins)) continue;
    picked.push(candidate);
  }
  return picked;
};

export const lineAngleRadians = (line: HoughLine): number => (line.theta * Math.PI) / THETA_STEPS;
