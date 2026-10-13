import { CURATED_FONT_FAMILIES } from "./curated-fonts";
import { INDIC_FONT_FAMILIES } from "./indic-fonts";
import { WORLD_FONT_FAMILIES } from "./world-fonts";

export type TextEffect =
  | { type: "shadow"; x: number; y: number; blur: number; color: string }
  | { type: "outline"; width: number; color: string }
  | { type: "lift"; distance: number; opacity: number }
  | { type: "glitch"; offsetX: number; offsetY: number; color1: string; color2: string };

export type ShadowMode = "shadow" | "glow";

export interface LayerShadow {
  enabled: boolean;
  mode: ShadowMode;
  x: number;
  y: number;
  blur: number;
  color: string;
}

export const DEFAULT_LAYER_SHADOW: LayerShadow = {
  enabled: true,
  mode: "shadow",
  x: 0,
  y: 8,
  blur: 16,
  color: "#000000",
};

export interface GradientTextConfig {
  enabled: boolean;
  color1: string;
  color2: string;
  angle: number;
}

export const DEFAULT_GRADIENT_TEXT: GradientTextConfig = {
  enabled: false,
  color1: "#f97316",
  color2: "#820000",
  angle: 135,
};

export interface CustomFontEntry {
  label: string;
  value: string;
  group: string;
}

export type ShapeType =
  | "rect"
  | "circle"
  | "triangle"
  | "diamond"
  | "star"
  | "pentagon"
  | "hexagon"
  | "line"
  | "arrow"
  | "frame-thin"
  | "frame-thick"
  | "frame-round"
  | "frame-double";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export interface ImageFilters {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: number;
  sepia?: number;
  blur?: number;
  hueRotate?: number;
  invert?: number;
}

export type BitgrainEffectKind =
  | "dither"
  | "halftone"
  | "ascii"
  | "pixelate"
  | "scanlines"
  | "crosshatch"
  | "popart"
  | "posterize"
  | "grain"
  | "photocopy"
  | "misprint"
  | "fold"
  | "dust";

export interface BitgrainEffect {
  kind: BitgrainEffectKind;
  params: Record<string, number | string | boolean>;
}

export interface TornEdgeSides {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export type EdgeStyle = "torn" | "deckle" | "perforation";
export type EdgeFrame = "paper" | "polaroid";

export interface TornEdgeEffect {
  style: EdgeStyle;
  sides: TornEdgeSides;
  roughness: number;
  detail: number;
  border: number;
  borderColor: string;
  frame: EdgeFrame;
  seed: number;
}

export interface TapeCorners {
  tl: boolean;
  tr: boolean;
  bl: boolean;
  br: boolean;
}

export interface TapeStrips {
  corners: TapeCorners;
  color: string;
  opacity: number;
}

export type LayoutMode = "none" | "flex-row" | "flex-col" | "grid";
export type AlignItems = "start" | "center" | "end" | "stretch";
export type JustifyContent = "start" | "center" | "end" | "between";

export type LayerType =
  | "image"
  | "text"
  | "shape"
  | "upload"
  | "group"
  | "vector"
  | "ink"
  | "adjustment"
  | "frame";

export type LineCap = "round" | "square" | "butt";
export type LineJoin = "round" | "miter" | "bevel";
export type DashStyle = "solid" | "dashed" | "dotted";

export interface BezierHandle {
  x: number;
  y: number;
}

export type AnchorCornerType = "corner" | "smooth" | "asymmetric";

export interface BezierAnchor {
  x: number;
  y: number;
  inHandle?: BezierHandle;
  outHandle?: BezierHandle;
  cornerType?: AnchorCornerType;
}

export interface VectorPath {
  anchors: BezierAnchor[];
  closed: boolean;
  extraRings?: BezierAnchor[][];
}

export type VectorFillFit = "cover" | "contain" | "stretch";

export interface VectorFillImage {
  src: string;
  fit: VectorFillFit;
}

export interface VectorSettings {
  strokeColor: string;
  strokeWidth: number;
  fill: string;
  lineCap: LineCap;
  lineJoin: LineJoin;
  dashStyle: DashStyle;
}

export const DEFAULT_VECTOR_SETTINGS: VectorSettings = {
  strokeColor: "#ffffff",
  strokeWidth: 2,
  fill: "transparent",
  lineCap: "round",
  lineJoin: "round",
  dashStyle: "solid",
};

export interface VectorLayer extends BaseLayer {
  type: "vector";
  path: VectorPath;
  strokeColor: string;
  strokeColorVar?: string;
  strokeWidth: number;
  fill: string;
  fillVar?: string;
  fillImage?: VectorFillImage;
  lineCap: LineCap;
  lineJoin: LineJoin;
  dashStyle: DashStyle;
  rotation: number;
  drawProgress?: number;
}

export interface InkPoint {
  x: number;
  y: number;
  pressure: number;
}

export interface InkStroke {
  d: string;
}

export interface InkLayer extends BaseLayer {
  type: "ink";
  strokes: InkStroke[];
  viewW: number;
  viewH: number;
  color: string;
  colorVar?: string;
  rotation: number;
  drawProgress?: number;
}

export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  blendMode?: BlendMode;
  flipH?: boolean;
  flipV?: boolean;
  patternCell?: string;
  anim?: import("./animation-types").LayerAnimMap;
}

export interface ImageCrop {
  zoom: number;
  focusX: number;
  focusY: number;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  rotation?: number;
  src?: string | null;
  fit: "cover" | "contain" | "fill";
  borderRadius?: number;
  filters?: ImageFilters;
  bitgrainEffect?: BitgrainEffect;
  colorGrade?: import("../modules/grading/engine/grade-types").ColorGrade;
  crop?: ImageCrop;
  masks?: import("../modules/grading/mask/mask-types").MaskLayer[];
  shadow?: LayerShadow;
}

export type TextDecorationLine = "none" | "underline" | "line-through" | "underline line-through";

export interface TextLayer extends BaseLayer {
  type: "text";
  content: string;
  fontSize: number;
  fontWeight: "300" | "400" | "500" | "600" | "700" | "800" | "900";
  fontFamily: string;
  fontStyle: "italic" | "bold" | "regular";
  color: string;
  colorVar?: string;
  align: "left" | "center" | "right";
  letterSpacing: number;
  lineHeight: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: TextDecorationLine;
  rotation?: number;
  effects?: TextEffect[];
  gradientText?: GradientTextConfig;
  autoResize?: boolean;
  richContent?: string;
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shapeType: ShapeType;
  fill: string;
  fillVar?: string;
  stroke: string;
  strokeVar?: string;
  strokeWidth: number;
  borderRadius: number;
  rotation: number;
}

export interface UploadLayer extends BaseLayer {
  type: "upload";
  rotation?: number;
  src: string | null;
  fit: "cover" | "contain" | "fill";
  borderRadius: number;
  filters?: ImageFilters;
  bitgrainEffect?: BitgrainEffect;
  colorGrade?: import("../modules/grading/engine/grade-types").ColorGrade;
  crop?: ImageCrop;
  masks?: import("../modules/grading/mask/mask-types").MaskLayer[];
  tornEdge?: TornEdgeEffect;
  tape?: TapeStrips;
  shadow?: LayerShadow;
}

export interface AdjustmentLayer extends BaseLayer {
  type: "adjustment";
  rotation?: number;
  filters?: ImageFilters;
  bitgrainEffect?: BitgrainEffect;
  colorGrade?: import("../modules/grading/engine/grade-types").ColorGrade;
}

export interface GroupLayer extends BaseLayer {
  type: "group";
  layers: Layer[];
  rotation?: number;
  layout: LayoutMode;
  gap: number;
  padding: number;
  alignItems: AlignItems;
  justifyContent: JustifyContent;
  wrap?: boolean;
  pattern?: import("./pattern-meta").PatternParams;
}

export interface FrameLayer extends BaseLayer {
  type: "frame";
  layers: Layer[];
  background: string;
  backgroundVar?: string;
  clip?: boolean;
  rotation?: number;
  image?: string | null;
}

export type Layer =
  | ImageLayer
  | TextLayer
  | ShapeLayer
  | UploadLayer
  | GroupLayer
  | VectorLayer
  | InkLayer
  | AdjustmentLayer
  | FrameLayer;

export interface LayerPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  dragged: boolean;
}

export interface GradientStop {
  color: string;
  pos: number;
}

export interface OverlayGradient {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  stops: GradientStop[];
}

export interface TemplatePage {
  id: string;
  name: string;
  layers: Layer[];
  background: string;
  backgroundVar?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string | null;
  clip?: boolean;
  animation?: import("./animation-types").PageAnimation;
}

export interface TemplatePageInput {
  id: string;
  name: string;
  layers: Layer[];
  background: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  image?: string | null;
}

export interface TemplateDef {
  id: string;
  name: string;
  category:
    | "album"
    | "poster"
    | "wallpaper"
    | "social"
    | "frame"
    | "resume"
    | "portfolio"
    | "invitation"
    | "certificate"
    | "id-card"
    | "grade-card"
    | "grand-opening"
    | "pitch-deck"
    | "letterhead"
    | "menu"
    | "business-card"
    | "flyer"
    | "book-cover"
    | "thumbnail"
    | "banner"
    | "planner"
    | "packaging"
    | "app-screenshot"
    | "business-docs"
    | "sports"
    | "stream-kit"
    | "signage"
    | "ticket"
    | "greeting"
    | "link-preview"
    | "recipe-card";
  width: number;
  height: number;
  background: string;
  overlay?: OverlayGradient;
  exportScale: number;
  layers: Layer[];
  image?: string | null;
  pages?: TemplatePageInput[];
  free?: boolean;
  featured?: boolean;
  addedAt?: string;
  tags?: string[];
  description?: string;
  useCases?: string[];
}

export const FONT_FAMILIES: { label: string; value: string; group: string }[] =
  [
    // Sans-serif
    { label: "Akasha", value: "'Akasha', sans-serif", group: "Sans-serif" },
    {
      label: "Space Grotesk",
      value: "'Space Grotesk', sans-serif",
      group: "Sans-serif",
    },
    { label: "Inter", value: "'Inter', sans-serif", group: "Sans-serif" },
    { label: "Outfit", value: "'Outfit', sans-serif", group: "Sans-serif" },
    {
      label: "Plus Jakarta Sans",
      value: "'Plus Jakarta Sans', sans-serif",
      group: "Sans-serif",
    },
    { label: "DM Sans", value: "'DM Sans', sans-serif", group: "Sans-serif" },
    { label: "Nunito", value: "'Nunito', sans-serif", group: "Sans-serif" },
    { label: "Raleway", value: "'Raleway', sans-serif", group: "Sans-serif" },
    { label: "Poppins", value: "'Poppins', sans-serif", group: "Sans-serif" },
    {
      label: "Montserrat",
      value: "'Montserrat', sans-serif",
      group: "Sans-serif",
    },
    { label: "Lato", value: "'Lato', sans-serif", group: "Sans-serif" },
    {
      label: "Open Sans",
      value: "'Open Sans', sans-serif",
      group: "Sans-serif",
    },
    { label: "Rubik", value: "'Rubik', sans-serif", group: "Sans-serif" },
    { label: "Figtree", value: "'Figtree', sans-serif", group: "Sans-serif" },
    { label: "Manrope", value: "'Manrope', sans-serif", group: "Sans-serif" },
    { label: "Barlow", value: "'Barlow', sans-serif", group: "Sans-serif" },
    {
      label: "Work Sans",
      value: "'Work Sans', sans-serif",
      group: "Sans-serif",
    },
    { label: "Syne", value: "'Syne', sans-serif", group: "Sans-serif" },
    {
      label: "Source Sans 3",
      value: "'Source Sans 3', sans-serif",
      group: "Sans-serif",
    },
    // Display
    {
      label: "Bebas Neue",
      value: "'Bebas Neue', sans-serif",
      group: "Display",
    },
    { label: "Oswald", value: "'Oswald', sans-serif", group: "Display" },
    {
      label: "Archivo Black",
      value: "'Archivo Black', sans-serif",
      group: "Display",
    },
    { label: "Anton", value: "'Anton', sans-serif", group: "Display" },
    { label: "Righteous", value: "'Righteous', sans-serif", group: "Display" },
    { label: "Bungee", value: "'Bungee', sans-serif", group: "Display" },
    { label: "Russo One", value: "'Russo One', sans-serif", group: "Display" },
    { label: "Teko", value: "'Teko', sans-serif", group: "Display" },
    {
      label: "Big Shoulders",
      value: "'Big Shoulders Display', sans-serif",
      group: "Display",
    },
    {
      label: "Squada One",
      value: "'Squada One', sans-serif",
      group: "Display",
    },
    // Serif
    {
      label: "Playfair Display",
      value: "'Playfair Display', serif",
      group: "Serif",
    },
    { label: "Crimson Pro", value: "'Crimson Pro', serif", group: "Serif" },
    {
      label: "Instrument Serif",
      value: "'Instrument Serif', serif",
      group: "Serif",
    },
    { label: "EB Garamond", value: "'EB Garamond', serif", group: "Serif" },
    {
      label: "Cormorant",
      value: "'Cormorant Garamond', serif",
      group: "Serif",
    },
    {
      label: "Libre Baskerville",
      value: "'Libre Baskerville', serif",
      group: "Serif",
    },
    { label: "Merriweather", value: "'Merriweather', serif", group: "Serif" },
    { label: "Lora", value: "'Lora', serif", group: "Serif" },
    {
      label: "DM Serif Display",
      value: "'DM Serif Display', serif",
      group: "Serif",
    },
    { label: "Fraunces", value: "'Fraunces', serif", group: "Serif" },
    // Slab
    { label: "Roboto Slab", value: "'Roboto Slab', serif", group: "Slab" },
    { label: "Zilla Slab", value: "'Zilla Slab', serif", group: "Slab" },
    { label: "Arvo", value: "'Arvo', serif", group: "Slab" },
    // Monospace
    { label: "DM Mono", value: "'DM Mono', monospace", group: "Mono" },
    { label: "Roboto Mono", value: "'Roboto Mono', monospace", group: "Mono" },
    { label: "Fira Code", value: "'Fira Code', monospace", group: "Mono" },
    {
      label: "JetBrains Mono",
      value: "'JetBrains Mono', monospace",
      group: "Mono",
    },
    {
      label: "IBM Plex Mono",
      value: "'IBM Plex Mono', monospace",
      group: "Mono",
    },
    { label: "Space Mono", value: "'Space Mono', monospace", group: "Mono" },
    // Script
    {
      label: "Dancing Script",
      value: "'Dancing Script', cursive",
      group: "Script",
    },
    { label: "Pacifico", value: "'Pacifico', cursive", group: "Script" },
    { label: "Great Vibes", value: "'Great Vibes', cursive", group: "Script" },
    { label: "Lobster", value: "'Lobster', cursive", group: "Script" },
    { label: "Caveat", value: "'Caveat', cursive", group: "Script" },
    { label: "Kalam", value: "'Kalam', cursive", group: "Script" },
    // Decorative
    {
      label: "Abril Fatface",
      value: "'Abril Fatface', cursive",
      group: "Decorative",
    },
    {
      label: "Lilita One",
      value: "'Lilita One', cursive",
      group: "Decorative",
    },
    { label: "Boogaloo", value: "'Boogaloo', cursive", group: "Decorative" },
    {
      label: "Permanent Marker",
      value: "'Permanent Marker', cursive",
      group: "Decorative",
    },
    {
      label: "Special Elite",
      value: "'Special Elite', cursive",
      group: "Decorative",
    },
    {
      label: "Black Han Sans",
      value: "'Black Han Sans', sans-serif",
      group: "Decorative",
    },
    ...CURATED_FONT_FAMILIES,
    ...INDIC_FONT_FAMILIES,
    ...WORLD_FONT_FAMILIES,
  ];
