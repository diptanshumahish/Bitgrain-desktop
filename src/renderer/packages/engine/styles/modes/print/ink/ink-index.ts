import type { StyleDefinition } from "../../../engine/style-definition";
import type { StyleLook } from "../../../engine/style-types";
import { CYANOTYPE_STYLE } from "./cyanotype/cyanotype-style";
import { ENGRAVING_STYLE } from "./engraving/engraving-style";
import { INK_STYLE_LOOKS } from "./looks/ink-looks";
import { RISOGRAPH_STYLE } from "./risograph/riso-style";

export const INK_STYLES: readonly StyleDefinition[] = [
  RISOGRAPH_STYLE, ENGRAVING_STYLE, CYANOTYPE_STYLE,
];

export const INK_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = INK_STYLE_LOOKS;
