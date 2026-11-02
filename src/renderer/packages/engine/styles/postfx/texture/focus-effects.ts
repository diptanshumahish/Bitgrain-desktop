import { numberParam, textParam } from "../../engine/resolve-params";
import { gaussianBlurPixels } from "../../finish/box-blur";
import { drawSoftCopy, softCopy } from "../../finish/soft-copy";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import { clampByte, copyPixels } from "../pixel-ops";

const PERCENT = 100;
const CHANNELS = 4;
const SHARPEN_GAIN = 2;
const GAUSSIAN_RADIUS = 22;
const ZOOM_COPIES_BASE = 12;
const ZOOM_COPIES_GAIN = 30;
const ZOOM_MIN_COPIES = 10;
const ZOOM_REACH = 0.6;
const FOCUS_INNER = 0.45;
const FOCUS_OUTER_BASE = 0.28;
const FOCUS_OUTER_GAIN = 0.6;
const PROGRESSIVE_RADIUS = 0.32;
const DEGREES_TO_RADIANS = Math.PI / 180;

const applySharpen = ({ frame, values, scale }: EffectInput): void => {
  const amount = (numberParam(values, "amount") / PERCENT) * SHARPEN_GAIN;
  if (amount <= 0) return;
  const data = frame.pixels().data;
  const blurred = copyPixels(data);
  gaussianBlurPixels(blurred, frame.width, frame.height, Math.max(1, scale));
  for (let index = 0; index < data.length; index += CHANNELS) {
    for (let channel = 0; channel < 3; channel++) {
      const value = data[index + channel];
      data[index + channel] = clampByte(value + amount * (value - blurred[index + channel]));
    }
  }
};

export const SHARPEN_EFFECT: EffectDefinition = {
  key: "sharpen",
  label: "Sharpen",
  hint: "Crisper edges",
  params: [percentParam("amount", "Amount", 40)],
  apply: applySharpen,
};

const gaussianBlur = (input: EffectInput, amount: number): void => {
  const { frame } = input;
  frame.commit();
  const copy = softCopy(frame.canvas, frame.width, frame.height, GAUSSIAN_RADIUS * amount * input.scale);
  const context = frame.context;
  drawSoftCopy(context, copy, frame.width, frame.height);
};

const zoomBlur = (input: EffectInput, amount: number): void => {
  const { frame } = input;
  frame.commit();
  const sharp = new OffscreenCanvas(frame.width, frame.height);
  sharp.getContext("2d")?.drawImage(frame.canvas, 0, 0);
  const copies = Math.max(ZOOM_MIN_COPIES, Math.round(ZOOM_COPIES_BASE + ZOOM_COPIES_GAIN * amount));
  const maxZoom = 1 + ZOOM_REACH * amount;
  const context = frame.context;
  for (let copy = 1; copy < copies; copy++) {
    const zoom = 1 + (copy / (copies - 1)) * (maxZoom - 1);
    context.globalAlpha = 1 / (copy + 1);
    context.drawImage(sharp, (frame.width - frame.width * zoom) / 2, (frame.height - frame.height * zoom) / 2, frame.width * zoom, frame.height * zoom);
  }
  context.globalAlpha = 1;
  restoreFocus(input, sharp);
};

const restoreFocus = (input: EffectInput, sharp: OffscreenCanvas): void => {
  const { frame } = input;
  const focus = numberParam(input.values, "focus") / PERCENT;
  const halfDiagonal = Math.hypot(frame.width, frame.height) / 2;
  const mask = new OffscreenCanvas(frame.width, frame.height);
  const maskContext = mask.getContext("2d");
  if (!maskContext) return;
  const gradient = maskContext.createRadialGradient(frame.width / 2, frame.height / 2, Math.max(1, halfDiagonal * focus * FOCUS_INNER), frame.width / 2, frame.height / 2, Math.max(2, halfDiagonal * (FOCUS_OUTER_BASE + FOCUS_OUTER_GAIN * focus)));
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  maskContext.drawImage(sharp, 0, 0);
  maskContext.globalCompositeOperation = "destination-in";
  maskContext.fillStyle = gradient;
  maskContext.fillRect(0, 0, frame.width, frame.height);
  frame.context.drawImage(mask, 0, 0);
};

const progressiveBlur = (input: EffectInput): void => {
  const { frame, values, scale } = input;
  const near = numberParam(values, "near");
  const far = numberParam(values, "far");
  const strongest = Math.max(near, far);
  if (near + far < 1) return;
  frame.commit();
  const blurred = softCopy(frame.canvas, frame.width, frame.height, PROGRESSIVE_RADIUS * strongest * scale);
  const layer = new OffscreenCanvas(frame.width, frame.height);
  const layerContext = layer.getContext("2d");
  if (!layerContext) return;
  drawSoftCopy(layerContext, blurred, frame.width, frame.height);
  const angle = numberParam(values, "angle") * DEGREES_TO_RADIANS;
  const reachX = (Math.cos(angle) * frame.width) / 2;
  const reachY = (Math.sin(angle) * frame.height) / 2;
  const gradient = layerContext.createLinearGradient(frame.width / 2 - reachX, frame.height / 2 - reachY, frame.width / 2 + reachX, frame.height / 2 + reachY);
  gradient.addColorStop(0, `rgba(0,0,0,${near / strongest})`);
  gradient.addColorStop(1, `rgba(0,0,0,${far / strongest})`);
  layerContext.globalCompositeOperation = "destination-in";
  layerContext.fillStyle = gradient;
  layerContext.fillRect(0, 0, frame.width, frame.height);
  frame.context.drawImage(layer, 0, 0);
};

const applyBlur = (input: EffectInput): void => {
  const amount = numberParam(input.values, "amount") / PERCENT;
  const type = textParam(input.values, "type");
  if (type === "progressive") return progressiveBlur(input);
  if (amount <= 0) return;
  if (type === "zoom") return zoomBlur(input, amount);
  gaussianBlur(input, amount);
};

export const BLUR_EFFECT: EffectDefinition = {
  key: "blur",
  label: "Blur",
  hint: "Soft, zoom or graduated blur",
  params: [
    percentParam("amount", "Amount", 35),
    { kind: "select", key: "type", label: "Type", options: [{ value: "gaussian", label: "Soft" }, { value: "zoom", label: "Zoom" }, { value: "progressive", label: "Graduated" }], default: "gaussian" },
    percentParam("focus", "Sharp centre", 50, true),
    percentParam("near", "Graduated start", 0, true),
    percentParam("far", "Graduated end", 60, true),
    { kind: "number", key: "angle", label: "Direction", min: 0, max: 360, step: 1, default: 90, suffix: "°", advanced: true },
  ],
  apply: applyBlur,
};
