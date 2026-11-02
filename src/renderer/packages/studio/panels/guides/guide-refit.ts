import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { PageAidsPatch } from "../../state/canvas-aids/page-aids-event";
import { marginGeometry, repeatGuides } from "./guide-presets";

export function refitMarginBoxes(page: TemplatePage, marginPx: number): PageAidsPatch | null {
  const zones = page.safeZones ?? [];
  if (!zones.some((zone) => zone.preset === "margins")) return null;
  const geometry = marginGeometry(page, marginPx);
  return { safeZones: zones.map((zone) => (zone.preset === "margins" ? { ...zone, ...geometry } : zone)) };
}

export function refitRepeatGuides(page: TemplatePage, spacingPx: number): PageAidsPatch | null {
  const guides = page.guides ?? [];
  if (!guides.some((guide) => guide.preset === "repeat")) return null;
  return { guides: [...guides.filter((guide) => guide.preset !== "repeat"), ...repeatGuides(page, spacingPx)] };
}
