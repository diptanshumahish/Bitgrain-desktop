import {
  imageSignal,
  isSampleSignal,
  imageMetaSignal,
  objectUrlRef,
  revokeCurrentObjectUrl,
} from "../../store/image-store";
import { saveImageToDB } from "../../utils/indexed-db";

const EDITED_MIME = "image/png";
const DEFAULT_EDITED_NAME = "edited.png";
const IMAGE_META_KEY = "imgi_image_meta";
const IS_SAMPLE_KEY = "imgi_is_sample";

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode the edited image"));
    }, EDITED_MIME);
  });

export const replaceWorkingImage = async (canvas: HTMLCanvasElement): Promise<void> => {
  const blob = await canvasToBlob(canvas);
  revokeCurrentObjectUrl();
  const url = URL.createObjectURL(blob);
  objectUrlRef.current = url;
  imageSignal.value = url;
  isSampleSignal.value = false;
  const meta = {
    name: imageMetaSignal.value?.name ?? DEFAULT_EDITED_NAME,
    width: canvas.width,
    height: canvas.height,
    sizeBytes: blob.size,
    mimeType: EDITED_MIME,
  };
  imageMetaSignal.value = meta;
  localStorage.setItem(IMAGE_META_KEY, JSON.stringify(meta));
  localStorage.setItem(IS_SAMPLE_KEY, "false");
  await saveImageToDB(blob);
};
