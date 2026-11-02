import {
  LAYER_EFFECT_WORKING_MAX,
  LAYER_GRADE_WORKING_MAX,
} from "@bitgrain/studio-core/render/effects/effect-working-resolution";
import { photoLookKey, type PhotoLook } from "@bitgrain/studio-core/effects/photo-look/photo-look";
import { renderPhotoLook } from "@bitgrain/studio-core/effects/photo-look/render-photo-look";
import { acquirePhotoLook, createOwnedObjectUrl } from "./photo-look-cache";

const PREVIEW_MIME = "image/png";

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });

const canvasToObjectUrl = (canvas: HTMLCanvasElement): Promise<string> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(createOwnedObjectUrl(blob));
      else reject(new Error("preview encode failed"));
    }, PREVIEW_MIME);
  });

export const photoLookPreviewKey = (src: string, look: PhotoLook): string => `${src}::${photoLookKey(look)}`;

const renderPhotoLookPreviewUrl = async (src: string, look: PhotoLook): Promise<string> => {
  const img = await loadImage(src);
  const result = await renderPhotoLook(img, look, {
    gradeMax: LAYER_GRADE_WORKING_MAX,
    effectMax: LAYER_EFFECT_WORKING_MAX,
  });
  return result instanceof HTMLCanvasElement ? canvasToObjectUrl(result) : src;
};

export const acquirePhotoLookPreview = (src: string, look: PhotoLook): Promise<string> =>
  acquirePhotoLook(photoLookPreviewKey(src, look), () => renderPhotoLookPreviewUrl(src, look));
