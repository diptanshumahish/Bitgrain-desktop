import type { TransformMode } from "../../../engine/types";
import { getLUT } from "../../../engine/luts";
import { modesSignal, paletteSignal, lutIdSignal, printFinishSignal } from "../../../store/transform-store";
import { pushHistory } from "../../../store/history-store";
import { FILTER_ENTRIES } from "../filter-modes";
import { currentEffectLabel } from "../effects/current-effect-label";
import { mainEffectOf, withoutMode } from "../effects/main-effect-modes";
import { selectMainEffect } from "../effects/select-main-effect";

export interface AppliedItem {
  key: string;
  label: string;
  remove: () => void;
}

interface AppliedInputs {
  modes: TransformMode[];
  paletteName: string | null;
  lutId: string | null;
  printFinish: boolean;
}

const STACKED_LABELS: Partial<Record<TransformMode, string>> = {
  grain: "film grain",
  "haze-bloom": "haze",
  ...Object.fromEntries(FILTER_ENTRIES.map((entry) => [entry.id, entry.label.toLowerCase()])),
};

const commit = (change: () => void): (() => void) => () => {
  change();
  pushHistory();
};

const effectItem = (modes: TransformMode[]): AppliedItem[] => {
  const main = mainEffectOf(modes);
  if (main === "original") return [];
  return [{ key: `effect-${main}`, label: currentEffectLabel([main]), remove: commit(() => selectMainEffect("original")) }];
};

const stackedItems = (modes: TransformMode[]): AppliedItem[] =>
  modes
    .filter((mode) => STACKED_LABELS[mode] !== undefined)
    .map((mode) => ({
      key: `stack-${mode}`,
      label: STACKED_LABELS[mode] ?? mode,
      remove: commit(() => { modesSignal.value = withoutMode(modesSignal.value, mode); }),
    }));

const GRADE_COMPATIBLE_STACK: ReadonlySet<TransformMode> = new Set<TransformMode>(["haze-bloom"]);

const stackedUnderGrade = (modes: TransformMode[]): AppliedItem[] =>
  stackedItems(modes.filter((mode) => GRADE_COMPATIBLE_STACK.has(mode)));

const colourItems = (inputs: AppliedInputs): AppliedItem[] => {
  const items: AppliedItem[] = [];
  if (inputs.lutId) {
    const name = getLUT(inputs.lutId)?.name ?? "film grade";
    items.push({ key: "lut", label: name, remove: commit(() => { lutIdSignal.value = null; }) });
  }
  if (inputs.paletteName && !inputs.lutId) {
    items.push({ key: "palette", label: `${inputs.paletteName} colours`, remove: commit(() => { paletteSignal.value = null; }) });
  }
  return items;
};

const paperItem = (printFinish: boolean): AppliedItem[] =>
  printFinish
    ? [{ key: "paper", label: "paper texture", remove: commit(() => { printFinishSignal.value = false; }) }]
    : [];

export const buildAppliedItems = (inputs: AppliedInputs): AppliedItem[] => [
  ...(inputs.lutId ? [] : effectItem(inputs.modes)),
  ...(inputs.lutId ? stackedUnderGrade(inputs.modes) : stackedItems(inputs.modes)),
  ...colourItems(inputs),
  ...paperItem(inputs.printFinish),
];
