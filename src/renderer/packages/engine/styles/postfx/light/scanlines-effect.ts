import { numberParam, textParam } from "../../engine/resolve-params";
import { percentParam, pixelParam, type EffectDefinition } from "../effect-definition";

const PERCENT = 100;
const LINE_ALPHA = 0.6;

export const SCANLINES_EFFECT: EffectDefinition = {
  key: "scanlines",
  label: "Scan lines",
  hint: "Thin horizontal lines like an old screen",
  params: [
    percentParam("amount", "Amount", 40),
    pixelParam("spacing", "Spacing", 1, 10, 3, true),
    pixelParam("thickness", "Thickness", 1, 6, 1, true),
    { kind: "colour", key: "colour", label: "Colour", default: "#000000", advanced: true },
  ],
  apply: ({ frame, values }) => {
    const spacing = Math.max(1, numberParam(values, "spacing"));
    const thickness = Math.min(spacing - 1, Math.max(1, Math.round(numberParam(values, "thickness"))));
    if (thickness < 1) return;
    const context = frame.context;
    context.globalAlpha = LINE_ALPHA * (numberParam(values, "amount") / PERCENT);
    context.fillStyle = textParam(values, "colour");
    for (let y = 0; y < frame.height; y += spacing) context.fillRect(0, Math.round(y), frame.width, thickness);
    context.globalAlpha = 1;
  },
};
