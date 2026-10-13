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

export const LAYER_MOTIONS: LayerMotion[] = [
  { rowId: "portrait", layerIds: ["portrait"], label: "Portrait, slow zoom", from: { ...BASE, transform: "scale(1.18)" }, inStart: 0, inEnd: 0.32, originClass: "origin-[50%_35%]", barClass: "left-0 w-[32%]" },
  { rowId: "top", layerIds: ["tour", "presenter"], label: "Top line, drop in", from: { ...BASE, transform: "translateY(-1.5%)" }, inStart: 0.14, inEnd: 0.28, originClass: "origin-center", barClass: "left-[14%] w-[14%]" },
  { rowId: "headline", layerIds: ["headline"], label: "Headline, blur in", from: { ...BASE, transform: "translateY(2%)", filter: "blur(18px)" }, inStart: 0.26, inEnd: 0.46, originClass: "origin-center", barClass: "left-[26%] w-[20%]" },
  { rowId: "subtitle", layerIds: ["subtitle"], label: "Subtitle, pop", from: { ...BASE, transform: "scale(0.6)" }, inStart: 0.42, inEnd: 0.54, originClass: "origin-[76.6%_68.6%]", barClass: "left-[42%] w-[12%]" },
  { rowId: "scribble", layerIds: ["scribble"], label: "Scribble, draw on", from: { ...BASE, opacity: 1, clipPath: "inset(0 100% 0 0)" }, inStart: 0.48, inEnd: 0.68, originClass: "origin-center", barClass: "left-[48%] w-[20%]" },
  { rowId: "rule", layerIds: ["rule"], label: "Rule, wipe", from: { ...BASE, transform: "scaleX(0)" }, inStart: 0.6, inEnd: 0.7, originClass: "origin-[5.2%_50%]", barClass: "left-[60%] w-[10%]" },
  { rowId: "dates", layerIds: ["date-1", "date-2", "date-3", "date-4"], label: "Dates, rise", from: { ...BASE, transform: "translateY(1.5%)" }, inStart: 0.66, inEnd: 0.8, originClass: "origin-center", barClass: "left-[66%] w-[14%]" },
];

export const loopKeyframes = (motion: LayerMotion): Keyframe[] => [
  { ...motion.from, offset: 0 },
  { ...motion.from, offset: motion.inStart, easing: ENTER_EASE },
  { ...REST, offset: motion.inEnd },
  { ...REST, offset: HOLD_UNTIL },
  { ...REST, opacity: 0, offset: 1 },
];
