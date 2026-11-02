import { imageSignal, imageMetaSignal, isSampleSignal, objectUrlRef } from "../../state/image-store";
import { pushHistory } from "../../state/history-store";
import type { ImageMeta } from "../../state/image-meta";
import { rememberImageVersion } from "./image-versions";
import { persistWorkingImage } from "./persist-working-image";
import { canvasToBlob } from "./canvas-to-blob";

const EDITED_MIME = "image/png";
const DEFAULT_EDITED_NAME = "edited.png";

const rememberCurrentImage = (): void => {
  const current = imageSignal.value;
  if (current) rememberImageVersion(current, { meta: imageMetaSignal.value, isSample: isSampleSignal.value });
};

interface EditedSize {
  width: number;
  height: number;
}

const editedMeta = (size: EditedSize, blob: Blob): ImageMeta => ({
  name: imageMetaSignal.value?.name ?? DEFAULT_EDITED_NAME,
  width: size.width,
  height: size.height,
  sizeBytes: blob.size,
  mimeType: EDITED_MIME,
});

export const commitImageBlob = async (blob: Blob, size: EditedSize): Promise<void> => {
  pushHistory();
  rememberCurrentImage();
  const url = URL.createObjectURL(blob);
  const meta = editedMeta(size, blob);
  rememberImageVersion(url, { meta, isSample: false });
  objectUrlRef.current = url;
  imageMetaSignal.value = meta;
  isSampleSignal.value = false;
  imageSignal.value = url;
  pushHistory();
  await persistWorkingImage(blob, meta, false).catch((error: unknown) =>
    console.error("Could not keep the edited photo for next visit", error),
  );
};

export const commitImageEdit = async (canvas: HTMLCanvasElement): Promise<void> => {
  const blob = await canvasToBlob(canvas);
  await commitImageBlob(blob, { width: canvas.width, height: canvas.height });
};
