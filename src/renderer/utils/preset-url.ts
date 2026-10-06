import type { TransformMode, DitherMethod } from '../engine/types';
import { PALETTES } from '../engine/palettes';

export interface ShareableState {
  modes: TransformMode[];
  ditherMethod: DitherMethod;
  ditherFactor: number;
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  grain: number;
  hue: number;
  isColor: boolean;
  paletteId: string | null;
}

const PRECISION_FACTOR = 100;
const RESOLUTION_PARAM = 'res';
const LEGACY_RESOLUTION_PARAM = 'r';
const PRESET_PARAM_KEYS = ['m', 'dm', 'df', RESOLUTION_PARAM, LEGACY_RESOLUTION_PARAM, 'ct', 'br', 'st', 'g', 'h', 'c', 'p'];

const round = (value: number): number => Math.round(value * PRECISION_FACTOR) / PRECISION_FACTOR;

export function presetToQuery(state: ShareableState): string {
  const params = new URLSearchParams();
  params.set('m',  state.modes.join(','));
  params.set('dm', state.ditherMethod);
  params.set('df', String(round(state.ditherFactor)));
  params.set(RESOLUTION_PARAM, String(round(state.resolution)));
  params.set('ct', String(round(state.contrast)));
  params.set('br', String(round(state.brightness)));
  params.set('st', String(round(state.saturation)));
  params.set('g',  String(round(state.grain)));
  params.set('h',  String(state.hue));
  params.set('c',  state.isColor ? '1' : '0');
  if (state.paletteId) params.set('p', state.paletteId);
  return params.toString();
}

export function encodePresetToUrl(state: ShareableState): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?${presetToQuery(state)}`;
}

export function editorPathForPreset(state: ShareableState): string {
  return `/editor?${presetToQuery(state)}`;
}

export function decodePresetFromUrl(): ShareableState | null {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('m')) return null;

  try {
    const modes = params.get('m')!.split(',').filter(Boolean) as TransformMode[];
    const paletteId = params.get('p') ?? null;
    const palette = paletteId ? PALETTES.find((entry) => entry.id === paletteId) : null;

    return {
      modes: modes.length ? modes : ['dither'],
      ditherMethod: (params.get('dm') ?? 'floyd-steinberg') as DitherMethod,
      ditherFactor: parseFloat(params.get('df') ?? '1'),
      resolution:   parseFloat(params.get(RESOLUTION_PARAM) ?? params.get(LEGACY_RESOLUTION_PARAM) ?? '2'),
      contrast:     parseFloat(params.get('ct') ?? '1'),
      brightness:   parseFloat(params.get('br') ?? '1'),
      saturation:   parseFloat(params.get('st') ?? '1'),
      grain:        parseFloat(params.get('g')  ?? '0'),
      hue:          parseInt(params.get('h')    ?? '0', 10),
      isColor:      params.get('c') === '1',
      paletteId:    palette ? paletteId : null,
    };
  } catch {
    return null;
  }
}

export function clearPresetFromUrl(): void {
  const url = new URL(window.location.href);
  PRESET_PARAM_KEYS.forEach((key) => url.searchParams.delete(key));
  window.history.replaceState({}, '', url.toString());
}
