export const ANIMATION_LOOP_MS = 5000;
const HOLD_UNTIL = 0.9;
const ENTER_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export interface LayerMotion {
  rowId: string;
  layerIds: string[];
  label: string;
  from: Keyframe;
  inStart: number;
  inEnd: number;
  originClass: string;
  barClass: string;
}

const REST: Keyframe = { opacity: 1, transform: "none", filter: "blur(0px)", clipPath: "inset(0 0 0 0)" };
const BASE: Keyframe = { opacity: 0, transform: "none", filter: "blur(0px)", clipPath: "inset(0 0 0 0)" };

const TILE_IDS = ["tile-1", "tile-2", "tile-3", "tile-4", "tile-5", "tile-6"];
const SHAPE_IDS = ["quarter-top", "circle", "circle-core", "semicircle", "arch", "quarter-bottom"];

export const LAYER_MOTIONS: LayerMotion[] = [
  { rowId: "tiles", layerIds: TILE_IDS, label: "Tiles, wipe down", from: { ...BASE, opacity: 1, clipPath: "inset(0 0 100% 0)" }, inStart: 0, inEnd: 0.24, originClass: "origin-center", barClass: "left-0 w-[24%]" },
  { rowId: "shapes", layerIds: SHAPE_IDS, label: "Shapes, pop", from: { ...BASE, transform: "scale(0.85)" }, inStart: 0.14, inEnd: 0.36, originClass: "origin-[50%_26.7%]", barClass: "left-[14%] w-[22%]" },
  { rowId: "photo", layerIds: ["photo"], label: "Photo, settle", from: { ...BASE, transform: "scale(1.06)" }, inStart: 0.26, inEnd: 0.44, originClass: "origin-[16.7%_40%]", barClass: "left-[26%] w-[18%]" },
  { rowId: "headline", layerIds: ["headline"], label: "Headline, blur in", from: { ...BASE, transform: "translateY(2%)", filter: "blur(18px)" }, inStart: 0.36, inEnd: 0.56, originClass: "origin-center", barClass: "left-[36%] w-[20%]" },
  { rowId: "details", layerIds: ["details"], label: "Details, rise", from: { ...BASE, transform: "translateY(1.5%)" }, inStart: 0.52, inEnd: 0.66, originClass: "origin-center", barClass: "left-[52%] w-[14%]" },
  { rowId: "swipe", layerIds: ["swipe", "swipe-mark"], label: "Footer, slide in", from: { ...BASE, transform: "translateX(-2%)" }, inStart: 0.62, inEnd: 0.76, originClass: "origin-center", barClass: "left-[62%] w-[14%]" },
];

export const loopKeyframes = (motion: LayerMotion): Keyframe[] => [
  { ...motion.from, offset: 0 },
  { ...motion.from, offset: motion.inStart, easing: ENTER_EASE },
  { ...REST, offset: motion.inEnd },
  { ...REST, offset: HOLD_UNTIL },
  { ...REST, opacity: 0, offset: 1 },
];
