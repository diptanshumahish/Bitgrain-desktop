import { applySnapshot, captureSnapshot } from "../../state/transform-store";
import { pushHistory } from "../../state/history-store";
import { previewLoadingSignal } from "../../state/image-store";
import { presetToSnapshot } from "@bitgrain/engine/presets/preset-snapshot";
import { trackEvent } from "@bitgrain/platform/tracker";
import { wipePreviewOnNextRender } from "../../motion/block-wipe/wipe-preview-output";
import { activeSampleLookSignal } from "./sample-look-store";
import type { SampleLook } from "./sample-looks";

export const switchSampleLook = (look: SampleLook): void => {
  const previous = activeSampleLookSignal.value;
  if (previous === look.id) return;
  previewLoadingSignal.value = true;
  wipePreviewOnNextRender();
  applySnapshot(presetToSnapshot(captureSnapshot(), look.config));
  pushHistory();
  activeSampleLookSignal.value = look.id;
  trackEvent("darkroom", "sample_preset_switched", { details: { look: look.id, from: previous } });
};
