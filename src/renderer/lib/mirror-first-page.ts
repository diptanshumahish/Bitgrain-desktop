import type { TemplateDef } from "../data/studioTypes";

export const mirrorFirstPage = (template: TemplateDef): TemplateDef => {
  const firstPage = template.pages?.[0];
  if (!firstPage || template.layers.length > 0) return template;
  return {
    ...template,
    layers: firstPage.layers,
    background: firstPage.background ?? template.background,
    width: firstPage.width ?? template.width,
    height: firstPage.height ?? template.height,
  };
};
