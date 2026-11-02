import { paperColorSignal } from "../../../state/transform-store";
import { pushHistory } from "../../../state/history-store";
import { trackEvent } from "@bitgrain/platform/tracker";

export const previewPageColour = (value: string | null): void => {
  paperColorSignal.value = value;
};

export const commitPageColour = (): void => {
  pushHistory();
  trackEvent("home", "page_colour_changed", { details: { value: paperColorSignal.value ?? "auto" } });
};

export const setPageColour = (value: string | null): void => {
  if (paperColorSignal.value === value) return;
  previewPageColour(value);
  commitPageColour();
};
