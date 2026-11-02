import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { CARD_CAPTION_RATIO, templateHeightRatio } from "../../masonry/template-height-ratio";
import { shimmerShapeAt } from "../loading/shimmer-shapes";

interface TemplateEntry {
  kind: "template";
  template: TemplateSummary;
}

interface ShimmerEntry {
  kind: "shimmer";
  slot: number;
}

export type MasonryEntry = TemplateEntry | ShimmerEntry;

export function buildMasonryEntries(templates: TemplateSummary[], shimmerCount: number): MasonryEntry[] {
  const cards: MasonryEntry[] = templates.map((template) => ({ kind: "template", template }));
  const shimmers: MasonryEntry[] = Array.from({ length: shimmerCount }, (_, slot) => ({ kind: "shimmer", slot }));
  return [...cards, ...shimmers];
}

export function entryKey(entry: MasonryEntry): string {
  return entry.kind === "template" ? `template-${entry.template.id}` : `shimmer-${entry.slot}`;
}

export function entryHeightRatio(entry: MasonryEntry): number {
  if (entry.kind === "template") return templateHeightRatio(entry.template);
  return shimmerShapeAt(entry.slot).ratio + CARD_CAPTION_RATIO;
}
