import type { VectorPath } from "./studio-types";

export type TextAlign = "left" | "center" | "right" | "justify";

export type TextVerticalAlign = "top" | "middle" | "bottom";

export type TextSizing = "auto-width" | "auto-height" | "fixed";

export type TextListStyle = "none" | "bullet" | "number";

export type TextNumericStyle = "default" | "tabular" | "proportional";

export interface TextFontFeatures {
  ligatures?: boolean;
  numeric?: TextNumericStyle;
  smallCaps?: boolean;
  fractions?: boolean;
  stylisticSets?: number[];
}

export interface TextFontVariations {
  wght?: number;
  wdth?: number;
  slnt?: number;
  opsz?: number;
}

export interface TextPathConfig {
  sourceId?: string;
  path: VectorPath;
  offset: number;
}
