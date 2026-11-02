import { captureSnapshot, type TransformSnapshot } from "../../../store/transform-store";
import { imageSignal } from "../../../store/image-store";

export const EDIT_STATE_KEY = "imgi_edit_state";

export const saveEditState = (): void => {
  if (!imageSignal.value) return;
  try {
    localStorage.setItem(EDIT_STATE_KEY, JSON.stringify(captureSnapshot()));
  } catch (error) {
    console.warn("Could not save the current look", error);
  }
};

const isSnapshotLike = (value: unknown): value is Partial<TransformSnapshot> =>
  !!value && typeof value === "object" && Array.isArray((value as { modes?: unknown }).modes);

export const loadEditState = (): Partial<TransformSnapshot> | null => {
  try {
    const raw = localStorage.getItem(EDIT_STATE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSnapshotLike(parsed) ? parsed : null;
  } catch (error) {
    console.warn("Could not read the saved look", error);
    return null;
  }
};
