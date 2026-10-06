import type { TransformMode as EngineTransformMode, DitherMethod, Palette, AsciiTone } from "../../engine/types";

export type TrackKind = "video" | "audio" | "text" | "effect" | "image" | "tracking";

export type TransformMode = EngineTransformMode | "transform";

export type HalftoneStyle = "mono" | "color" | "cmyk";

export type HalftoneShape = "round" | "square";

export interface EffectParams {
  isColor?: boolean;
  ditherMethod?: DitherMethod;
  ditherFactor?: number;
  palette?: Palette | null;
  lutId?: string | null;
  asciiCharset?: string;
  asciiTone?: AsciiTone;
  asciiDensity?: number;
  asciiEdges?: boolean;
  asciiEdgeThreshold?: number;
  contourLevels?: number;
  contourFill?: boolean;
  photocopyContrast?: number;
  photocopyThreshold?: number;
  misprintAmount?: number;
  misprintAngle?: number;
  foldCount?: number;
  foldIntensity?: number;
  dustAmount?: number;
  dustScratches?: number;
  dustSeed?: number;
  hazeIntensity?: number;
  bloomIntensity?: number;
  bloomThreshold?: number;
  hazeWarmth?: number;
  halftoneCell?: number;
  halftoneAngle?: number;
  halftoneStyle?: HalftoneStyle;
  halftoneShape?: HalftoneShape;
  halftoneInvert?: boolean;
  halftoneIntensity?: number;
  halftoneSharpness?: number;
  voronoiCell?: number;
  voronoiJitter?: number;
  voronoiEdge?: number;
  scanlineSpacing?: number;
  scanlineIntensity?: number;
  scanlineRgbShift?: number;
  scanlineCurvature?: number;
  chromaticIntensity?: number;
  chromaticFalloff?: number;
  crosshatchSpacing?: number;
  crosshatchThickness?: number;
  popartCell?: number;
  popartAngle?: number;
  popartThreshold?: number;
  popartGrain?: number;
  popartSpatter?: number;
  popartInkColor?: string;
  popartPaperColor?: string;
  popartJitterHz?: number;
  popartJitterAuto?: boolean;
  halftoneJitterHz?: number;
  halftoneJitterAuto?: boolean;
  contrast?: number;
  brightness?: number;
  saturation?: number;
  hue?: number;
  noise?: number;
  gradeTemperature?: number;
  gradeTint?: number;
  gradeVibrance?: number;
  duotoneShadow?: string;
  duotoneHighlight?: string;
  duotoneAmount?: number;
  vignetteAmount?: number;
  vignetteRadius?: number;
  vignetteSoftness?: number;
  posterizeLevels?: number;
  sharpenAmount?: number;
  washColor?: string;
  washIntensity?: number;
  washMode?: "screen" | "overlay" | "multiply";
  hazeTint?: string;
  scale?: number;
  x?: number;
  y?: number;
  rotation?: number;
  animation?: "none" | "zoom-in" | "zoom-out" | "pan-left" | "pan-right";
}

export interface Keyframe {
  time: number; // relative to clip start
  value: number;
}

export interface EffectApplication {
  id: string;
  mode: TransformMode;
  params: EffectParams;
}

export interface ClipTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface BaseClip {
  id: string;
  trackStart: number;
  duration: number;
}

export interface AudioEq {
  low: number;
  mid: number;
  high: number;
}

export interface VideoClip extends BaseClip {
  assetId: string;
  inPoint: number;
  speed?: number;
  effects: EffectApplication[];
  transform: ClipTransform;
  opacity: number;
  audioDetached: boolean;
  linkedClipId?: string;
  audioMuted?: boolean;
  audioVolume?: number;
  eq?: AudioEq;
  fadeIn?: number;
  fadeOut?: number;
  dipColor?: string;
}

export interface AudioClip extends BaseClip {
  assetId: string;
  inPoint: number;
  speed?: number;
  volume: number;
  muted?: boolean;
  linkedClipId?: string;
  eq?: AudioEq;
  fadeIn: number;
  fadeOut: number;
}

export type TextAnimation =
  | "none"
  | "fade"
  | "typewriter"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "blur-in"
  | "bounce"
  | "pop"
  | "gravity"
  | "jump-out"
  | "elastic"
  | "swing-in"
  | "whoosh";
export type TextAlign = "left" | "center" | "right";

export interface TextShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface TextStroke {
  color: string;
  width: number;
}

export interface TextClip extends BaseClip {
  text: string;
  font: string;
  size: number;
  color: string;
  weight: number;
  position: { x: number; y: number };
  align: TextAlign;
  animation: TextAnimation;
  shadow?: TextShadow;
  stroke?: TextStroke;
  fadeIn?: number;
  fadeOut?: number;
}

export interface EffectClip extends BaseClip {
  kind: "effect";
  effects: EffectApplication[];
  keyframes?: Record<string, Keyframe[]>;
}

export interface TrackingClip extends BaseClip {
  kind: "tracking";
  seed: number;
  nodeCount: number;
  lineColor: string;
  labelColor: string;
  showCoordinates: boolean;
  showThumbnails: boolean;
  showArrows: boolean;
  labelBackground: boolean;
  thumbZoom: number;
  speed: number;
  strokeWidth: number;
  labelScale: number;
  markerScale: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface OverlayFilters {
  blur?: number;
  grayscale?: number;
  invert?: number;
  sepia?: number;
  hueRotate?: number;
  saturate?: number;
  brightness?: number;
  contrast?: number;
}

export type OverlayEffectKind =
  | "glitch"
  | "rgb-split"
  | "scanlines"
  | "pixelate"
  | "wave";

export interface OverlayEffect {
  kind: OverlayEffectKind;
  intensity: number;
  speed: number;
}

export interface ImageClip extends BaseClip {
  assetId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
  filters?: OverlayFilters;
  effect?: OverlayEffect;
  fadeIn?: number;
  fadeOut?: number;
}

export interface BaseTrack {
  id: string;
  kind: TrackKind;
  name: string;
  locked: boolean;
  muted: boolean;
  visible: boolean;
  height: number;
}

// A real transition, not a pair of fades. It sits on the cut between two
// adjacent clips and is centred on it, so for `duration` seconds both clips are
// on screen at once: the outgoing one played past its out point and the incoming
// one played before its in point, using the media handles either side of the cut.
export type ClipTransitionKind =
  | "cross-dissolve"
  | "dip-to-black"
  | "dip-to-white"
  | "wipe-left"
  | "wipe-right";

export interface ClipTransition {
  id: string;
  kind: ClipTransitionKind;
  // Total length of the overlap, centred on the cut.
  duration: number;
  fromClipId: string;
  toClipId: string;
}

export interface VideoTrack extends BaseTrack {
  kind: "video";
  clips: VideoClip[];
  // Optional so projects saved before transitions existed load unchanged.
  transitions?: ClipTransition[];
}

export interface AudioTrack extends BaseTrack {
  kind: "audio";
  clips: AudioClip[];
}

export interface TextTrack extends BaseTrack {
  kind: "text";
  clips: TextClip[];
}

export interface FxTrack extends BaseTrack {
  kind: "effect";
  clips: EffectClip[];
}

export interface ImageTrack extends BaseTrack {
  kind: "image";
  clips: ImageClip[];
}

export interface TrackingTrack extends BaseTrack {
  kind: "tracking";
  clips: TrackingClip[];
}

export type Track =
  | VideoTrack
  | AudioTrack
  | TextTrack
  | FxTrack
  | ImageTrack
  | TrackingTrack;

export type MediaKind = "video" | "audio" | "image";

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  name: string;
  blobId: string;
  duration: number;
  width?: number;
  height?: number;
  fps?: number;
  thumbnailDataUrl?: string;
  waveformPeaks?: number[];
}

export interface VideoProjectMeta {
  id: string;
  name: string;
  thumbnail: string | null;
  width: number;
  height: number;
  fps: number;
  duration: number;
  createdAt: number;
  updatedAt: number;
}

export interface VideoProject extends VideoProjectMeta {
  tracks: Track[];
  mediaPool: MediaAsset[];
  markers?: number[];
  rangeIn?: number | null;
  rangeOut?: number | null;
}
