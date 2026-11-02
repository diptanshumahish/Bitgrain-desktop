import type { TransformMode } from "../../core/types";
import { Frame } from "./frame";
import { seededRandom } from "./seeded-random";
import { styleScaleFor } from "./style-scale";
import type { EffectStates } from "./style-types";
import { applyEffects } from "../postfx/effect-registry";

const ENGINE_EFFECT_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>(["style", "ascii"]);
const CANVAS_SEED = 11;

type PaintedCanvas = HTMLCanvasElement | OffscreenCanvas;

const hasEnabledEffect = (effects: EffectStates | undefined): effects is EffectStates =>
  !!effects && Object.values(effects).some((effect) => effect.enabled);

const engineAppliesEffects = (modes: TransformMode | TransformMode[], lutId: string | null | undefined): boolean => {
  if (lutId) return false;
  const list = Array.isArray(modes) ? modes : [modes];
  return ENGINE_EFFECT_MODES.has(list[list.length - 1]);
};

export const applyLookEffects = (
  canvas: PaintedCanvas, modes: TransformMode | TransformMode[], effects: EffectStates | undefined, lutId?: string | null,
): void => {
  if (!hasEnabledEffect(effects) || engineAppliesEffects(modes, lutId)) return;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context || canvas.width === 0 || canvas.height === 0) return;
  const frame = new Frame(canvas.width, canvas.height);
  frame.writePixels(context.getImageData(0, 0, canvas.width, canvas.height).data);
  applyEffects(frame, effects, styleScaleFor(canvas.width, canvas.height), seededRandom(CANVAS_SEED));
  const output = context.createImageData(canvas.width, canvas.height);
  output.data.set(frame.readPixels());
  context.putImageData(output, 0, 0);
};
