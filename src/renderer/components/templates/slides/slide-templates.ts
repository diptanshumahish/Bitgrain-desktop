import type { TemplateDef, TemplatePageInput } from "../../../data/studioTypes";

const MIN_SLIDE_COUNT = 2;

const hasTemplateSize = (page: TemplatePageInput, template: TemplateDef): boolean =>
  (page.width ?? template.width) === template.width &&
  (page.height ?? template.height) === template.height;

const pageAsTemplate = (page: TemplatePageInput, template: TemplateDef): TemplateDef => ({
  ...template,
  id: `${template.id}-${page.id}`,
  layers: page.layers,
  background: page.background ?? template.background,
  image: page.image ?? template.image,
  overlay: undefined,
  pages: undefined,
});

export const getSlideTemplates = (template: TemplateDef): TemplateDef[] => {
  const pages = template.pages ?? [];
  const slides = pages.filter((page) => hasTemplateSize(page, template));
  if (slides.length < MIN_SLIDE_COUNT) return [];
  return slides.map((page) => (page === pages[0] ? template : pageAsTemplate(page, template)));
};
