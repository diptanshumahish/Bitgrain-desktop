import { captureSnapshot } from "../../state/transform-store";
import { imageSignal } from "../../state/image-store";
import { masksSignal } from "../../grading/editor/editor-mask-store";

interface StackStamp {
  key: string;
  image: string | null;
  masks: unknown;
}

export const stampStack = (): StackStamp => ({
  key: JSON.stringify(captureSnapshot()),
  image: imageSignal.value,
  masks: masksSignal.value,
});

export const isStackChanged = (stamp: StackStamp): boolean =>
  stamp.image !== imageSignal.value || stamp.masks !== masksSignal.value || stamp.key !== stampStack().key;
