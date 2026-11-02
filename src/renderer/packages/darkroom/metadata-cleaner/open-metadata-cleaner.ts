import { emitDarkroomModal } from "../modals/darkroom-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";

export type CleanerSource = "editor" | "studio";

export const openMetadataCleaner = (source: CleanerSource): void => {
  trackEvent(source === "studio" ? "studio" : "home", "metadata_cleaner_opened");
  emitDarkroomModal({ type: "metadata-cleaner" });
};
