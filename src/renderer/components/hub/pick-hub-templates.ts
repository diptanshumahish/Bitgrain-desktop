import type { TemplateSummary } from "../../lib/template-cards/template-summary";

const HUB_TEMPLATE_LIMIT = 36;
const BLANK_TEMPLATE_ID = "blank-canvas";

const groupByCategory = (templates: TemplateSummary[]): TemplateSummary[][] => {
  const groups = new Map<string, TemplateSummary[]>();
  for (const template of templates) {
    groups.set(template.category, [...(groups.get(template.category) ?? []), template]);
  }
  return [...groups.values()];
};

export const pickHubTemplates = (templates: TemplateSummary[]): TemplateSummary[] => {
  const groups = groupByCategory(templates.filter((template) => template.id !== BLANK_TEMPLATE_ID));
  const longest = Math.max(0, ...groups.map((group) => group.length));
  const mixed = Array.from({ length: longest }, (_, round) => groups.map((group) => group[round]));
  return mixed.flat().filter((template): template is TemplateSummary => !!template).slice(0, HUB_TEMPLATE_LIMIT);
};
