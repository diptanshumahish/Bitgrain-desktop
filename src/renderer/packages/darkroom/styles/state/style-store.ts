import { signal } from "@bitgrain/core/signal";
import { DEFAULT_STYLE_ID } from "@bitgrain/engine/styles/engine/style-registry";
import type { EffectStates, StyleLook, StyleSettings } from "@bitgrain/engine/styles/engine/style-types";
import { settingsFromLook, withStyleId } from "./style-edits";

export const defaultStyleSettings = (): StyleSettings => ({ styleId: DEFAULT_STYLE_ID, params: {}, effects: {} });

export const styleSettingsSignal = signal<StyleSettings>(defaultStyleSettings());

export const replaceStyleSettings = (settings: StyleSettings): void => {
  styleSettingsSignal.value = settings;
};

export const selectStyle = (styleId: string): void => replaceStyleSettings(withStyleId(styleSettingsSignal.value, styleId));

export const setStyleEffects = (effects: EffectStates): void => replaceStyleSettings({ ...styleSettingsSignal.value, effects });

export const applyLook = (styleId: string, look: StyleLook): void => replaceStyleSettings(settingsFromLook(styleId, look));

export const applyStyleFromSnapshot = (settings: StyleSettings | undefined): void => {
  replaceStyleSettings(settings ?? defaultStyleSettings());
};
