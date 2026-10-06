import type {
  EffectApplication,
  TextAlign,
  TextAnimation,
  TransformMode,
} from "../types";

export type ReelMediaKind = "video" | "image" | "any";

export interface ReelSlot {
  trackStart: number;
  duration: number;
  scale?: number;
  x?: number;
  y?: number;
  rotation?: number;
  fadeIn?: number;
  fadeOut?: number;
  effects?: EffectApplication[];
  clipAnimation?: "none" | "zoom-in" | "zoom-out" | "pan-left" | "pan-right";
}

export interface ReelOverlay {
  offset: number;
  duration: number;
  text: string;
  font: string;
  size: number;
  weight: number;
  color: string;
  position: { x: number; y: number };
  align: TextAlign;
  animation: TextAnimation;
  fadeIn?: number;
  fadeOut?: number;
}

export interface ReelFxEffect {
  mode: TransformMode;
  params: Record<string, number | string | boolean>;
}

export interface ReelFxBand {
  offset: number;
  duration: number;
  effects: ReelFxEffect[];
}

export interface VideoReelTemplate {
  id: string;
  label: string;
  description: string;
  totalDuration: number;
  mediaKind: ReelMediaKind;
  slotsPerClip: number;
  minClips: number;
  maxClips: number;
  slots: ReelSlot[];
  overlays: ReelOverlay[];
  fxBands: ReelFxBand[];
  tagline: string;
}
