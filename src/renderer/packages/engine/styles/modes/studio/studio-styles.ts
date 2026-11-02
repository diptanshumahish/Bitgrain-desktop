import type { StyleDefinition } from "../../engine/style-definition";
import type { StyleLook } from "../../engine/style-types";
import { ASCII_STUDIO_STYLE } from "./ascii/ascii-studio-style";
import { ASCII_STUDIO_LOOKS } from "./ascii/ascii-studio-looks";
import { HEX_MOSAIC_STYLE } from "./hex/hex-mosaic-style";
import { LED_MATRIX_STYLE } from "./led/led-matrix-style";
import { HEX_MOSAIC_LOOKS, LED_MATRIX_LOOKS } from "./frame-looks";

export const STUDIO_STYLES: readonly StyleDefinition[] = [ASCII_STUDIO_STYLE, HEX_MOSAIC_STYLE, LED_MATRIX_STYLE];

export const STUDIO_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = {
  [ASCII_STUDIO_STYLE.id]: ASCII_STUDIO_LOOKS,
  [HEX_MOSAIC_STYLE.id]: HEX_MOSAIC_LOOKS,
  [LED_MATRIX_STYLE.id]: LED_MATRIX_LOOKS,
};
