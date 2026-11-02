import type { ParamSpec } from "./style-types";
import type { StyleDefinition } from "./style-definition";
import { FINISH_PARAMS } from "../finish/finish-params";
import { BLOCK_STYLE, CHARACTERS_STYLE, CROSS_STYLE, DIAGONAL_STYLE, DIAMOND_STYLE, LINES_STYLE, MIXED_STYLE } from "../modes/glyph/glyph-styles";
import { BRAILLE_STYLE } from "../modes/glyph/braille-style";
import { DOTS_STYLE } from "../modes/tile/dots-style";
import { MOSAIC_STYLE, PIXEL_STYLE } from "../modes/tile/pixel-mosaic-styles";
import { LEGO_STYLE } from "../modes/tile/lego-style";
import { DISCO_STYLE } from "../modes/tile/disco-style";
import { VOXEL_STYLE } from "../modes/tile/voxel-style";
import { PRINT_STYLES } from "../modes/print/print-styles";
import { SIGNAL_STYLES } from "../modes/signal/signal-styles";
import { LIGHT_STYLES } from "../modes/light/light-styles";
import { GEOMETRIC_STYLES } from "../modes/geometric/geometric-styles";
import { DISTORT_STYLES } from "../modes/distort/distort-styles";
import { GLASS_STYLES } from "../modes/glass/glass-styles";
import { MATERIAL_STYLES } from "../modes/material/material-styles";
import { STUDIO_STYLES } from "../modes/studio/studio-styles";

export const STYLE_DEFINITIONS: readonly StyleDefinition[] = [
  CHARACTERS_STYLE, MIXED_STYLE, BLOCK_STYLE, DOTS_STYLE, BRAILLE_STYLE,
  PIXEL_STYLE, MOSAIC_STYLE, LEGO_STYLE, VOXEL_STYLE,
  CROSS_STYLE, DIAMOND_STYLE, LINES_STYLE, DIAGONAL_STYLE, DISCO_STYLE,
  ...STUDIO_STYLES, ...PRINT_STYLES, ...SIGNAL_STYLES, ...LIGHT_STYLES,
  ...GEOMETRIC_STYLES, ...DISTORT_STYLES, ...GLASS_STYLES, ...MATERIAL_STYLES,
];

export const DEFAULT_STYLE_ID = CHARACTERS_STYLE.id;

const BY_ID = new Map(STYLE_DEFINITIONS.map((definition) => [definition.id, definition]));

export const findStyle = (id: string): StyleDefinition =>
  BY_ID.get(id) ?? CHARACTERS_STYLE;

const withDefault = (spec: ParamSpec, override: unknown): ParamSpec =>
  override === undefined ? spec : ({ ...spec, default: override } as ParamSpec);

export const styleParamSpecs = (definition: StyleDefinition): readonly ParamSpec[] => {
  if (definition.kind === "frame") return definition.params;
  const overrides = definition.finishDefaults ?? {};
  return [...definition.params, ...FINISH_PARAMS.map((spec) => withDefault(spec, overrides[spec.key]))];
};
