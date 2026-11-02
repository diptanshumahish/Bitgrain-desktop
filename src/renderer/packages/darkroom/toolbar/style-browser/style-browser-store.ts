import { signal } from "@bitgrain/core/signal";
import { emitDarkroomModal } from "../../modals/darkroom-modal-events";
import type { StyleBrowserTarget } from "./style-browser-target";

export const ALL_FAMILIES = "all";

export const styleSearchSignal = signal("");
export const styleFamilySignal = signal<string>(ALL_FAMILIES);

export const openStyleBrowser = (target?: StyleBrowserTarget): void => {
  styleSearchSignal.value = "";
  styleFamilySignal.value = ALL_FAMILIES;
  emitDarkroomModal({ type: "style-browser", target });
};
