import { useMemo } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { imageSignal } from "../state/image-store";
import { canUndoSignal, canRedoSignal } from "../state/history-store";
import { ASCII_SETTERS, INK_SETTERS, TONE_SETTERS } from "./toolbar-state/value-setters";
import { EFFECT_TOGGLES } from "./toolbar-state/effect-toggles";
import { TOOLBAR_COMMANDS } from "./toolbar-state/toolbar-commands";
import { activeFlagsFor, currentConfigFor, effectsDataFor } from "./toolbar-state/toolbar-derived";
import type { ActiveFlags, EffectsData } from "./toolbar-state/toolbar-derived";
import {
  useAsciiValues, useHazeValues, useLineInkValues, useLookValues, usePopartValues, useToneValues,
} from "./toolbar-state/use-toolbar-values";
import type {
  AsciiValues, HazeValues, LineInkValues, LookValues, PopartValues, ToneValues,
} from "./toolbar-state/use-toolbar-values";
import type { PresetConfig } from "./popovers/PresetsPopover";

const TOOLBAR_ACTIONS = { ...TONE_SETTERS, ...ASCII_SETTERS, ...INK_SETTERS, ...EFFECT_TOGGLES, ...TOOLBAR_COMMANDS };

interface HistoryValues {
  image: string | null;
  hasImage: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

interface DerivedValues {
  currentConfig: PresetConfig;
  effectsData: EffectsData;
}

export type ToolbarState = LookValues & ToneValues & HazeValues & AsciiValues & PopartValues & LineInkValues
  & HistoryValues & ActiveFlags & DerivedValues & typeof TOOLBAR_ACTIONS;

const useHistoryValues = (): HistoryValues => {
  const image = useSignalValue(imageSignal);
  return { image, hasImage: !!image, canUndo: useSignalValue(canUndoSignal), canRedo: useSignalValue(canRedoSignal) };
};

export const useToolbarState = (): ToolbarState => {
  const look = useLookValues();
  const tone = useToneValues();
  const haze = useHazeValues();
  const flags = useMemo(() => activeFlagsFor(look.mode), [look.mode]);
  return {
    ...look, ...tone, ...haze, ...useAsciiValues(), ...usePopartValues(), ...useLineInkValues(), ...useHistoryValues(), ...flags,
    currentConfig: currentConfigFor(look, tone),
    effectsData: effectsDataFor(look, tone, haze),
    ...TOOLBAR_ACTIONS,
  };
};
