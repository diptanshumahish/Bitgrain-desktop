import { captureSnapshot } from "../../../store/transform-store";
import { imageSignal } from "../../../store/image-store";

const baselineRef = { current: "" };

const serializeCurrentLook = (): string => JSON.stringify(captureSnapshot());

export const markEditsBaseline = (): void => {
  baselineRef.current = serializeCurrentLook();
};

export const hasUnexportedEdits = (): boolean =>
  !!imageSignal.value && baselineRef.current !== "" && serializeCurrentLook() !== baselineRef.current;
