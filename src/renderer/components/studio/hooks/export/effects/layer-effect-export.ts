import type { ImageLayer, UploadLayer } from "../../../../../data/studioTypes";
import { LAYER_EFFECT_WORKING_MAX, LAYER_GRADE_WORKING_MAX } from "../../effect-working-resolution";
import { planEffectExport } from "./effect-export-plan";
import { hasPhotoLook, lookFromLayer } from "../../../../../modules/grading/studio/photo-look";
import { renderPhotoLook } from "../../../../../modules/grading/studio/render-photo-look";

export const applyLayerEffectForExport = async (
  img: HTMLImageElement,
  layer: ImageLayer | UploadLayer,
  s: number,
): Promise<HTMLImageElement | HTMLCanvasElement> => {
  const look = lookFromLayer(layer);
  if (!hasPhotoLook(look)) return img;
  const sourceLongEdge = Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const outputLongEdge = Math.max(layer.width, layer.height) * s;
  const gradeMax = Math.max(LAYER_GRADE_WORKING_MAX, Math.round(outputLongEdge));
  const plan = look.effect
    ? planEffectExport(look.effect, sourceLongEdge, outputLongEdge, LAYER_EFFECT_WORKING_MAX)
    : null;
  try {
    return await renderPhotoLook(img, { ...look, effect: plan?.effect }, {
      gradeMax,
      effectMax: plan?.maxDimension ?? LAYER_EFFECT_WORKING_MAX,
    });
  } catch {
    return img;
  }
};
