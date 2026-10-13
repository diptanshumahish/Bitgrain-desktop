import { paperColorSignal } from "../../../../store/transform-store";
import { pushHistory } from "../../../../store/history-store";
import { trackEvent } from "../../../../lib/tracker";

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
