import type { TemplateSummary } from "../../../lib/template-cards/template-summary";

export function getFeatured(templates: TemplateSummary[], limit: number): TemplateSummary[] {
  return templates.filter((template) => template.featured).slice(0, limit);
}

export function firstPerCategory(templates: TemplateSummary[]): Map<string, TemplateSummary> {
  const previews = new Map<string, TemplateSummary>();
  for (const template of templates) {
    if (!previews.has(template.category)) previews.set(template.category, template);
  }
  return previews;
}
