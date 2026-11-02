import type { EffectState, EffectStates, ParamValue, ParamValues, StyleLook, StyleSettings } from "@bitgrain/engine/styles/engine/style-types";

const effectOf = (effects: EffectStates, key: string): EffectState => effects[key] ?? { enabled: false, values: {} };

export const withStyleId = (settings: StyleSettings, styleId: string): StyleSettings =>
  settings.styleId === styleId ? settings : { ...settings, styleId, params: {} };

export const withParam = (settings: StyleSettings, key: string, value: ParamValue): StyleSettings =>
  ({ ...settings, params: { ...settings.params, [key]: value } });

export const withEffectEnabled = (effects: EffectStates, key: string, enabled: boolean): EffectStates =>
  ({ ...effects, [key]: { ...effectOf(effects, key), enabled } });

export const withEffectValue = (effects: EffectStates, key: string, param: string, value: ParamValue): EffectStates =>
  ({ ...effects, [key]: { enabled: true, values: { ...effectOf(effects, key).values, [param]: value } } });

export const withEffectValues = (effects: EffectStates, key: string, values: ParamValues): EffectStates =>
  ({ ...effects, [key]: { enabled: true, values } });

const lookEffects = (look: StyleLook): EffectStates =>
  Object.fromEntries(Object.entries(look.effects ?? {}).map(([key, values]) => [key, { enabled: true, values }]));

export const settingsFromLook = (styleId: string, look: StyleLook): StyleSettings =>
  ({ styleId, params: { ...(look.params ?? {}) }, effects: lookEffects(look) });
