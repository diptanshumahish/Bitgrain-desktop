import type { PageSeoMeta } from "../page-seo-meta";
import type { TemplateCategory } from "../../templates/data/categories";
import type { TemplateDetail } from "../../templates/detail/template-detail-types";
import { categoryNoun, categoryTemplatesLabel } from "../../templates/detail/category-noun";
import { templateDetailPath } from "../../templates/detail/template-detail-paths";
import { templateDetailDescription, templateDetailTitle } from "../../templates/detail/template-detail-meta";

const categoryKeywords = (categoryKey: string): string => {
  const noun = categoryNoun(categoryKey);
  return `${noun} templates, free ${noun} templates, editable ${noun} template, ${noun} maker online`;
};

export const templateCategorySeo = (category: TemplateCategory): PageSeoMeta => ({
  path: `/templates/${category.key}`,
  title: `${categoryTemplatesLabel(category.key)}, free to edit online | Bitgrain`,
  description: `${category.description} Open one in the Bitgrain studio and change every word, photo and effect. No AI.`,
  keywords: categoryKeywords(category.key),
});

export const templateDetailSeo = (detail: TemplateDetail, ogImage: string | undefined): PageSeoMeta => ({
  path: templateDetailPath(detail.category, detail.id),
  title: templateDetailTitle(detail),
  description: templateDetailDescription(detail),
  keywords: [detail.name.toLowerCase(), `${categoryNoun(detail.category)} template`, ...detail.tags].join(", "),
  ogImage,
});
