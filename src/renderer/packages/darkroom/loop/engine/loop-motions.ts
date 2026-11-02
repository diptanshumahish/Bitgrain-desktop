import type { TransformMode } from "@bitgrain/engine/core/types";
import type { TransformSnapshot } from "@bitgrain/engine/core/transform-snapshot";
import type { LoopMotion } from "../loop-settings";
import { RISO_PALETTE_ID } from "@bitgrain/engine/utils/ink-misregister";

type LoopStackInfo = Pick<TransformSnapshot, "modes" | "lutId" | "printFinish" | "palette">;

const GRAIN_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>(["grain", "grunge"]);
const BOIL_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>(["dither", "halftone", "popart"]);
const TEXT_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>(["ascii", "braille"]);

const activeModes = (snap: LoopStackInfo): TransformMode[] => (snap.lutId ? [] : snap.modes);

const hasPaperGrain = (snap: LoopStackInfo): boolean =>
  snap.printFinish && !snap.modes.some((mode) => TEXT_MODES.has(mode));

const hasGrainMotion = (snap: LoopStackInfo): boolean =>
  hasPaperGrain(snap) || activeModes(snap).some((mode) => GRAIN_MODES.has(mode));

const hasRisoInks = (snap: LoopStackInfo): boolean => snap.palette?.id === RISO_PALETTE_ID;

const hasBoilMotion = (snap: LoopStackInfo): boolean =>
  hasRisoInks(snap) || activeModes(snap).some((mode) => BOIL_MODES.has(mode));

export const availableLoopMotions = (snap: LoopStackInfo): LoopMotion[] => {
  const grain = hasGrainMotion(snap);
  const boil = hasBoilMotion(snap);
  if (grain && boil) return ["grain", "boil", "grain-boil"];
  if (grain) return ["grain"];
  if (boil) return ["boil"];
  return [];
};

export const resolveLoopMotion = (preferred: LoopMotion, available: LoopMotion[]): LoopMotion | null => {
  if (available.includes(preferred)) return preferred;
  return available[0] ?? null;
};
