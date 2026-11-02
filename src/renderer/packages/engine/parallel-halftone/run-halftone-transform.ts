import { finishTransform, prepareTransform, runLeadingModes } from "../core/engine";
import { halftoneResult, planHalftone } from "../plugins/halftone";
import type { TransformContext, TransformationResult, TransformMode } from "../core/types";
import { renderPlan } from "./render-plan";

export const endsWithHalftone = (modes: TransformMode[]): boolean =>
  modes.length > 0 && modes[modes.length - 1] === "halftone";

export const runHalftoneTransform = async (modes: TransformMode[], ctx: TransformContext): Promise<TransformationResult> => {
  const prepared = prepareTransform(ctx);
  const leadingCtx = runLeadingModes(modes.slice(0, -1), prepared.ctx);
  const plan = planHalftone(leadingCtx);
  const colorData = await renderPlan(plan);
  return finishTransform(halftoneResult(plan, colorData), ctx, prepared.maskOutputs);
};
