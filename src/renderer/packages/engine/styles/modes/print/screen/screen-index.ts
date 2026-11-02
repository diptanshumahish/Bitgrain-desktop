import type { StyleDefinition } from "../../../engine/style-definition";
import type { StyleLook } from "../../../engine/style-types";
import { DITHER_STYLE } from "./dither/dither-style";
import { HALFTONE_STYLE } from "./halftone/halftone-style";
import { CMYK_DROPS_STYLE } from "./cmyk/cmyk-style";
import { MEZZOTINT_STYLE } from "./marks/mezzotint-style";
import { POINTILLIZE_STYLE } from "./marks/pointillize-style";
import { CROSSHATCH_STYLE } from "./marks/crosshatch-style";
import {
  CMYK_LOOKS, CROSSHATCH_LOOKS, DITHER_LOOKS, HALFTONE_LOOKS, MEZZOTINT_LOOKS, POINTILLIZE_LOOKS,
} from "./screen-looks";

export const SCREEN_STYLES: readonly StyleDefinition[] = [
  DITHER_STYLE, HALFTONE_STYLE,
  MEZZOTINT_STYLE, POINTILLIZE_STYLE, CROSSHATCH_STYLE, CMYK_DROPS_STYLE,
];

export const SCREEN_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = {
  [DITHER_STYLE.id]: DITHER_LOOKS,
  [HALFTONE_STYLE.id]: HALFTONE_LOOKS,
  [MEZZOTINT_STYLE.id]: MEZZOTINT_LOOKS,
  [POINTILLIZE_STYLE.id]: POINTILLIZE_LOOKS,
  [CROSSHATCH_STYLE.id]: CROSSHATCH_LOOKS,
  [CMYK_DROPS_STYLE.id]: CMYK_LOOKS,
};
