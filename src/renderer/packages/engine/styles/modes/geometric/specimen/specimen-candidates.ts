import type { SourceImage } from "../../../engine/style-definition";
import { fieldAt, lumaField, sobelField, type FieldGrid, type GradientField } from "../shared/image-fields";
import { integerHash } from "../shared/noise";
import { maskAtUnit } from "../shared/subject-mask";
import { downscaleSource } from "../shared/source-canvas";

const ANALYSIS_EDGE = 600;
const LATTICE_PITCH = 26;
const TAP_OFFSET = 2;
const SUBJECT_BASE = 0.2;
const SUBJECT_GAIN = 1.6;
const KEEP_SHARE = 0.18;
const KEEP_SUBJECT = 0.22;
const RANDOM_KEEP_SHARE = 0.05;
const RANDOM_KEEP_SUBJECT = 0.4;
const RANDOM_EXPONENT = 0.25;
const SEED_MIX = 7919;
const SLOT_MIX = 104729;
const SLOT_ROW = 1000;

export interface Candidate {
  x: number;
  y: number;
  edge: number;
  subject: number;
  score: number;
  slot: number;
}

export interface CandidateSet {
  candidates: Candidate[];
  maxEdge: number;
}

const tapEdge = (gradient: GradientField, grid: FieldGrid, x: number, y: number): number => {
  const field = { data: gradient.magnitude, width: grid.width, height: grid.height };
  const taps = [[0, 0], [TAP_OFFSET, 0], [-TAP_OFFSET, 0], [0, TAP_OFFSET], [0, -TAP_OFFSET]];
  return taps.reduce((total, [offsetX, offsetY]) => total + fieldAt(field, x + offsetX, y + offsetY), 0) / taps.length;
};

const scanLattice = (source: SourceImage, mask: FieldGrid, scale: number): Candidate[] => {
  const analysis = downscaleSource(source, ANALYSIS_EDGE);
  const luma = lumaField(analysis);
  const gradient = sobelField(luma);
  const ratio = analysis.width / source.width;
  const pitch = LATTICE_PITCH * scale;
  const found: Candidate[] = [];
  for (let y = pitch / 2; y < source.height; y += pitch) {
    for (let x = pitch / 2; x < source.width; x += pitch) {
      const slot = Math.floor(y / pitch) * SLOT_ROW + Math.floor(x / pitch);
      const edge = tapEdge(gradient, luma, x * ratio, y * ratio);
      const subject = maskAtUnit(mask, x / source.width, y / source.height);
      found.push({ x, y, edge, subject, slot, score: edge * (SUBJECT_BASE + SUBJECT_GAIN * subject) });
    }
  }
  return found;
};

const seededOrder = (found: Candidate[], seed: number, maxScore: number): Candidate[] => {
  const keyed = found
    .filter((candidate) => candidate.score >= RANDOM_KEEP_SHARE * maxScore && candidate.subject > RANDOM_KEEP_SUBJECT)
    .map((candidate) => {
      const random = Math.max(Number.EPSILON, integerHash(seed * SEED_MIX + candidate.slot * SLOT_MIX));
      return { candidate, key: Math.log(random) / (candidate.score / maxScore) ** RANDOM_EXPONENT };
    });
  return keyed.sort((first, second) => second.key - first.key).map((entry) => entry.candidate);
};

export const findCandidates = (source: SourceImage, mask: FieldGrid, scale: number, seed: number): CandidateSet => {
  const found = scanLattice(source, mask, scale);
  const maxScore = Math.max(Number.EPSILON, ...found.map((candidate) => candidate.score));
  const maxEdge = Math.max(Number.EPSILON, ...found.map((candidate) => candidate.edge));
  if (seed !== 0) return { candidates: seededOrder(found, seed, maxScore), maxEdge };
  const kept = found.filter((candidate) => candidate.score >= KEEP_SHARE * maxScore && candidate.subject > KEEP_SUBJECT);
  return { candidates: kept.sort((first, second) => second.score - first.score), maxEdge };
};
