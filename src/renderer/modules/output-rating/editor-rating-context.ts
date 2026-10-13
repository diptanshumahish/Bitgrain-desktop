import { captureSnapshot } from "../../store/transform-store";
import { imageMetaSignal, isSampleSignal } from "../../store/image-store";
import { hashSignature } from "./rating-signature";
import type { RatingContext } from "./rating-types";

export function buildEditorRatingContext(): RatingContext {
  const snapshot = captureSnapshot();
  const imageMeta = imageMetaSignal.value;
  const isSample = isSampleSignal.value;
  const imageKey = imageMeta ? `${imageMeta.name}:${imageMeta.width}x${imageMeta.height}` : "none";
  return {
    signature: hashSignature(`${imageKey}|${isSample}|${JSON.stringify(snapshot)}`),
    properties: {
      modes: snapshot.modes,
      dither_method: snapshot.ditherMethod,
      dither_factor: snapshot.ditherFactor,
      is_color: snapshot.isColor,
      palette_id: snapshot.palette?.id ?? null,
      lut_id: snapshot.lutId,
      resolution: snapshot.resolution,
      contrast: snapshot.contrast,
      brightness: snapshot.brightness,
      saturation: snapshot.saturation,
      grain: snapshot.grain,
      print_finish: snapshot.printFinish,
      is_sample: isSample,
      image_width: imageMeta?.width ?? null,
      image_height: imageMeta?.height ?? null,
      image_mime: imageMeta?.mimeType ?? null,
    },
  };
}
