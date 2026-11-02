import { applySnapshot, captureSnapshot, ditherMethodSignal, lutIdSignal, paletteSignal } from "../../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { previewLoadingSignal } from "../../state/image-store";
import { pushHistory } from "../../state/history-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { DitherMethod, Palette } from "@bitgrain/engine/core/types";
import { presetToSnapshot } from "@bitgrain/engine/presets/preset-snapshot";
import { wipePreviewOnNextRender } from "../../motion/block-wipe/wipe-preview-output";
import type { PresetConfig } from "../popovers/PresetsPopover";
import { activePanelSignal } from "../panel-state/active-panel-store";
import type { ActivePopover } from "../toolbar-types";

const AURA_PALETTE_PREFIX = "aura-";
const AURA_PALETTE_ID = "aura";
const LUT_CLOSES_PANELS: readonly ActivePopover[] = ["filters", "palette", "algorithm", "adjust"];

const onDone = (): void => {
  pushHistory();
};

const applyPreset = (config: PresetConfig): void => {
  previewLoadingSignal.value = true;
  wipePreviewOnNextRender();
  applySnapshot(presetToSnapshot(captureSnapshot(), config));
  pushHistory();
  trackEvent("home", "preset_applied", { details: { modes: config.modes } });
};

const handleSelectLUT = (id: string | null): void => {
  const previousId = lutIdSignal.value;
  lutIdSignal.value = id;
  pushHistory();
  trackEvent("home", "lut_selected", { details: { lut_id: id } });
  if (!id && previousId) trackEvent("home", "lut_cleared", { details: { lut_id: previousId } });
  if (id && LUT_CLOSES_PANELS.includes(activePanelSignal.value)) activePanelSignal.value = null;
};

const setPalette = (palette: Palette | null): void => {
  paletteSignal.value = palette;
  pushHistory();
  const paletteId = palette?.id.startsWith(AURA_PALETTE_PREFIX) ? AURA_PALETTE_ID : palette?.id ?? null;
  trackEvent("home", "palette_selected", { details: { palette_id: paletteId } });
};

const setDitherMethod = (method: DitherMethod): void => {
  ditherMethodSignal.value = method;
  trackEvent("home", "dither_method_changed", { details: { method } });
};

const setPrintFinish = (enabled: boolean): void => {
  printFinishSignal.value = enabled;
  trackEvent("home", "print_finish_toggled", { details: { enabled } });
};

export const TOOLBAR_COMMANDS = { onDone, applyPreset, handleSelectLUT, setPalette, setDitherMethod, setPrintFinish };
