import { modesSignal } from "../../state/transform-store";
import { resetHistory } from "../../state/history-store";
import { exportedThisImageSignal } from "../../state/editor-view-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { markEditsBaseline } from "../session/unexported-edits";
import { activeSampleLookSignal, takeSampleElapsedMs } from "./sample-look-store";

const hasChosenLook = (): boolean => !modesSignal.value.includes("original");

const trackSampleReplaced = (keptLook: boolean): void => {
  trackEvent("darkroom", "sample_replaced", {
    details: {
      time_to_replace_ms: takeSampleElapsedMs(),
      kept_look: keptLook,
      look: activeSampleLookSignal.value,
      modes: modesSignal.value,
    },
  });
};

export const carrySampleLookToUpload = (): boolean => {
  const keepLook = hasChosenLook();
  trackSampleReplaced(keepLook);
  activeSampleLookSignal.value = null;
  if (!keepLook) return false;
  exportedThisImageSignal.value = false;
  markEditsBaseline();
  resetHistory();
  return true;
};
