import type { PaintGradient, StrokeAlign } from "./paint-types";
import type { BlendMode, VectorFillImage } from "./studio-types";

export type LayerFillKind = "solid" | "gradient" | "image" | "grain";

export interface GrainFillParams {
  size: number;
  seed: number;
}

export interface LayerFill {
  id: string;
  kind: LayerFillKind;
  color: string;
  gradient?: PaintGradient;
  image?: VectorFillImage;
  grain?: GrainFillParams;
  opacity: number;
  blendMode?: BlendMode;
  visible: boolean;
}

export interface LayerStroke {
  id: string;
  color: string;
  width: number;
  align: StrokeAlign;
  opacity: number;
  visible: boolean;
}

export type LayerEffectKind = "drop-shadow" | "inner-shadow" | "glow" | "layer-blur" | "background-blur";

export interface LayerEffect {
  id: string;
  kind: LayerEffectKind;
  visible: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export type MaskMode = "alpha" | "vector";

export interface LayerPaintLists {
  fills?: LayerFill[];
  strokes?: LayerStroke[];
  layerEffects?: LayerEffect[];
}
