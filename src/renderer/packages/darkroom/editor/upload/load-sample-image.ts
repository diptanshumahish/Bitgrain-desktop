import { trackEvent } from "@bitgrain/platform/tracker";
import { applyStartingLook } from "../session/start-look";
import { showSampleImage } from "./show-sample-image";

export const loadSampleImage = (src: string): void => {
  showSampleImage(src);
  applyStartingLook();
  trackEvent("home", "load_sample", { details: { path: src } });
};
