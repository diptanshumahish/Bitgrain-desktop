import { imageSignal, imageMetaSignal, isSampleSignal, objectUrlRef } from "../../store/image-store";
import { clearImageFromDB } from "../../utils/indexed-db";
import { emitUndoToast } from "../../components/portal/undo-toast/undo-toast-events";
import { EDIT_STATE_KEY } from "./session/edit-state-storage";

const STORED_IMAGE_KEYS = ["imgi_image_meta", "imgi_is_sample", "imgi_sample_path", EDIT_STATE_KEY];

interface ClearedImage {
  image: string | null;
  isSample: boolean;
  meta: typeof imageMetaSignal.value;
  objectUrl: string | null;
}

const restoreImage = (saved: ClearedImage): void => {
  if (imageSignal.value !== null) return;
  isSampleSignal.value = saved.isSample;
  imageMetaSignal.value = saved.meta;
  imageSignal.value = saved.image;
};

const commitClear = (saved: ClearedImage): void => {
  if (saved.objectUrl && saved.objectUrl !== objectUrlRef.current) URL.revokeObjectURL(saved.objectUrl);
  if (imageSignal.value !== null) return;
  if (saved.objectUrl && saved.objectUrl === objectUrlRef.current) {
    URL.revokeObjectURL(saved.objectUrl);
    objectUrlRef.current = null;
  }
  clearImageFromDB();
  STORED_IMAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const clearImageWithUndo = (): void => {
  const saved: ClearedImage = {
    image: imageSignal.value,
    isSample: isSampleSignal.value,
    meta: imageMetaSignal.value,
    objectUrl: objectUrlRef.current,
  };
  imageSignal.value = null;
  emitUndoToast({
    title: "Image cleared",
    detail: "Changed your mind?",
    onUndo: () => restoreImage(saved),
    onExpire: () => commitClear(saved),
  });
};
