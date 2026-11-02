import { numberParam } from "../../engine/resolve-params";
import { pixelParam, type EffectDefinition, type EffectInput } from "../effect-definition";

const MIN_COPIES = 2;
const MAX_COPIES = 8;
const FULL_TURN = Math.PI * 2;

const snapshot = (input: EffectInput): OffscreenCanvas => {
  const { frame } = input;
  frame.commit();
  const copy = new OffscreenCanvas(frame.width, frame.height);
  copy.getContext("2d")?.drawImage(frame.canvas, 0, 0);
  return copy;
};

const applyFragment = (input: EffectInput): void => {
  const radius = Math.max(1, Math.round(numberParam(input.values, "offset")));
  const copies = Math.min(MAX_COPIES, Math.max(MIN_COPIES, Math.round(numberParam(input.values, "copies"))));
  const original = snapshot(input);
  const context = input.frame.context;
  context.clearRect(0, 0, input.frame.width, input.frame.height);
  context.globalCompositeOperation = "lighter";
  context.globalAlpha = 1 / copies;
  for (let copy = 0; copy < copies; copy++) {
    const angle = (FULL_TURN * copy) / copies;
    context.drawImage(original, Math.round(Math.cos(angle) * radius), Math.round(Math.sin(angle) * radius));
  }
  context.globalAlpha = 1;
  context.globalCompositeOperation = "destination-over";
  context.drawImage(original, 0, 0);
  context.globalCompositeOperation = "source-over";
};

export const FRAGMENT_EFFECT: EffectDefinition = {
  key: "fragment",
  label: "Fragment",
  hint: "Overlapping copies, like a shaken camera",
  params: [
    pixelParam("offset", "Spread", 1, 40, 4),
    { kind: "number", key: "copies", label: "Copies", min: MIN_COPIES, max: MAX_COPIES, step: 1, default: 4, advanced: true },
  ],
  apply: applyFragment,
};
