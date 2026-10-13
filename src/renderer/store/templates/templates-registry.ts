import type { TemplateSummary } from "../../lib/template-cards/template-summary";

const registry = new Map<string, TemplateSummary>();

export function registerTemplates(templates: TemplateSummary[]): void {
  for (const template of templates) registry.set(template.id, template);
}

export function findLoadedTemplate(id: string): TemplateSummary | undefined {
  return registry.get(id);
}

export function mergeUniqueTemplates(
  existing: TemplateSummary[],
  incoming: TemplateSummary[],
): TemplateSummary[] {
  const seen = new Set(existing.map((template) => template.id));
  const fresh = incoming.filter((template) => {
    if (seen.has(template.id)) return false;
    seen.add(template.id);
    return true;
  });
  return [...existing, ...fresh];
}
