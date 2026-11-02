import type { AsciiTone, TransformMode } from "../core/types";
import { ASCII_BLOCKS, ASCII_CODE, ASCII_STANDARD } from "../plugins/ascii";
import type { EffectStates, StyleSettings } from "../styles/engine/style-types";

const LEGACY_MODE: TransformMode = "ascii";
const STYLE_MODE: TransformMode = "style";
const BASE_SIZE = 11;
const MIN_SIZE = 5;
const MAX_SIZE = 40;
const EDGE_STRENGTH = 70;
const LIGHT_PAPER = "#f4f1e8";
const FULL = 100;
const DARK_PAPER_PHOTO = 40;

interface LegacyAsciiLook {
  asciiCharset?: string;
  asciiDensity?: number;
  asciiEdges?: boolean;
  asciiTone?: AsciiTone;
  isColor: boolean;
  paperColor?: string | null;
}

const RAMP_BY_CHARSET: Readonly<Record<string, string>> = {
  [ASCII_STANDARD]: "classic",
  [ASCII_BLOCKS]: "blocks",
  [ASCII_CODE]: "hacker",
};

const modeList = (modes: TransformMode | TransformMode[]): TransformMode[] => (Array.isArray(modes) ? modes : [modes]);

export const usesLegacyAscii = (modes: TransformMode | TransformMode[]): boolean => {
  const list = modeList(modes);
  return list[list.length - 1] === LEGACY_MODE;
};

export const modernAsciiModes = (modes: TransformMode | TransformMode[]): TransformMode[] =>
  modeList(modes).map((mode) => (mode === LEGACY_MODE ? STYLE_MODE : mode));

const sizeFor = (density: number | undefined): number =>
  Math.round(Math.min(MAX_SIZE, Math.max(MIN_SIZE, BASE_SIZE / Math.max(0.1, density ?? 1))));

const paperParams = (look: LegacyAsciiLook): Record<string, string | boolean | number> =>
  look.asciiTone === "light"
    ? { invert: true, backdrop: "solid", backdropColour: look.paperColor && look.paperColor.startsWith("#") ? look.paperColor : LIGHT_PAPER }
    : { backdropOpacity: DARK_PAPER_PHOTO };

const monoEffect = (look: LegacyAsciiLook): EffectStates =>
  look.isColor ? {} : { mono: { enabled: true, values: { amount: FULL } } };

export const modernAsciiStyle = (look: LegacyAsciiLook): StyleSettings => ({
  styleId: "characters",
  params: {
    size: sizeFor(look.asciiDensity),
    ramp: RAMP_BY_CHARSET[look.asciiCharset ?? ""] ?? "standard",
    edges: look.asciiEdges ? EDGE_STRENGTH : 0,
    ...paperParams(look),
  },
  effects: monoEffect(look),
});
