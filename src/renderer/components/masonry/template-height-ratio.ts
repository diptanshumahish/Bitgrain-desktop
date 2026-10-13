import type { TemplateDimensions } from "../../lib/template-cards/template-summary";

export const CARD_CAPTION_RATIO = 0.18;

export function templateHeightRatio(template: TemplateDimensions): number {
  return template.height / template.width + CARD_CAPTION_RATIO;
}

export function templateKey(template: { id: string }): string {
  return template.id;
}
