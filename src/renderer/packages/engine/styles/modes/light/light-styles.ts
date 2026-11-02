import type { StyleDefinition } from "../../engine/style-definition";
import type { StyleLook } from "../../engine/style-types";
import { ANAGLYPH_STYLE } from "./colour/anaglyph-style";
import { DUOTONE_STYLE } from "./colour/duotone-style";
import { GRADIENT_MAP_STYLE } from "./colour/gradient-map-style";
import { DREAMDUST_STYLE } from "./dust/dreamdust-style";
import { ANAGLYPH_LOOKS, DUOTONE_LOOKS, GRADIENT_MAP_LOOKS } from "./looks/colour-looks";
import { DREAMDUST_LOOKS } from "./looks/optics-looks";
import { LIGHT_WIND_LOOKS } from "./looks/ray-looks";
import { LIGHT_WIND_STYLE } from "./rays/light-wind-style";

export const LIGHT_STYLES: readonly StyleDefinition[] = [
  ANAGLYPH_STYLE, GRADIENT_MAP_STYLE, DREAMDUST_STYLE, LIGHT_WIND_STYLE, DUOTONE_STYLE,
];

export const LIGHT_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = {
  [ANAGLYPH_STYLE.id]: ANAGLYPH_LOOKS,
  [GRADIENT_MAP_STYLE.id]: GRADIENT_MAP_LOOKS,
  [DREAMDUST_STYLE.id]: DREAMDUST_LOOKS,
  [LIGHT_WIND_STYLE.id]: LIGHT_WIND_LOOKS,
  [DUOTONE_STYLE.id]: DUOTONE_LOOKS,
};
