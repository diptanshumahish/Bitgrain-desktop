import type { Layer, TemplatePage } from "../../../../../../data/studioTypes";
import { resolvePrintSize } from "../print-geometry";
import { SAFE_ZONE_MM } from "../print-layout";
import type { PreflightInput, PreflightItem } from "./preflight-types";

const PASS_ID = "safe-zone-pass";

const safeMarginFor = (page: TemplatePage): number => {
  const size = resolvePrintSize(page.width, page.height);
  return (SAFE_ZONE_MM / size.widthMm) * page.width;
};

const isNearEdge = (layer: Layer, page: TemplatePage, margin: number): boolean =>
  layer.x < margin ||
  layer.y < margin ||
  layer.x + layer.width > page.width - margin ||
  layer.y + layer.height > page.height - margin;

const checkPage = (page: TemplatePage): PreflightItem[] => {
  const margin = safeMarginFor(page);
  return page.layers
    .filter((layer) => layer.type === "text" && layer.visible)
    .filter((layer) => isNearEdge(layer, page, margin))
    .map((layer): PreflightItem => ({
      id: `safe-zone-${page.id}-${layer.id}`,
      level: "warn",
      message: `"${layer.name}" on ${page.name} sits close to the edge and could get trimmed. Keep text at least ${SAFE_ZONE_MM}mm in.`,
    }));
};

export const checkSafeZone = (input: PreflightInput): PreflightItem[] => {
  const issues = input.pages.flatMap(checkPage);
  if (issues.length > 0) return issues;
  return [{ id: PASS_ID, level: "pass", message: "All text sits safely inside the trim." }];
};
