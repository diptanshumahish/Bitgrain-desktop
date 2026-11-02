import type { LayerStepAnchor } from "./image-layer-steps";

const PANEL_ANCHOR_ATTRIBUTE = "data-panel-anchor";

export const scrollToPanelAnchor = (anchor: LayerStepAnchor): void => {
  requestAnimationFrame(() => {
    document.querySelector(`[${PANEL_ANCHOR_ATTRIBUTE}="${anchor}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" });
  });
};
