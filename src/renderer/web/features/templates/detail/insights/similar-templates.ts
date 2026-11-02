import type { TemplateDetail } from "../template-detail-types";

const SIMILAR_LIMIT = 6;
const SAME_CATEGORY_SCORE = 2;
const MIN_SHARED_TAGS = 2;
const MAX_FONT_SCORE = 1;

export interface SimilarTemplate {
  template: TemplateDetail;
  sharedTags: string[];
  sharedFonts: string[];
}

const sharedValues = (source: string[], other: string[], ignored = ""): string[] => {
  const known = new Set(source.map((value) => value.toLowerCase()));
  return other.filter((value) => known.has(value.toLowerCase()) && value.toLowerCase() !== ignored);
};

const aspectOf = (template: TemplateDetail): number => (template.width > 0 ? template.height / template.width : 0);

const scoreOf = (source: TemplateDetail, entry: SimilarTemplate): number =>
  entry.sharedTags.length +
  Math.min(entry.sharedFonts.length, MAX_FONT_SCORE) +
  (entry.template.category === source.category ? SAME_CATEGORY_SCORE : 0);

const toEntry = (source: TemplateDetail, other: TemplateDetail): SimilarTemplate => ({
  template: other,
  sharedTags: sharedValues(source.tags, other.tags, source.category),
  sharedFonts: sharedValues(source.insights?.fonts ?? [], other.insights?.fonts ?? []),
});

const compareEntries = (source: TemplateDetail, left: SimilarTemplate, right: SimilarTemplate): number => {
  const scoreGap = scoreOf(source, right) - scoreOf(source, left);
  if (scoreGap !== 0) return scoreGap;
  const sourceAspect = aspectOf(source);
  const aspectGap = Math.abs(aspectOf(left.template) - sourceAspect) - Math.abs(aspectOf(right.template) - sourceAspect);
  return aspectGap !== 0 ? aspectGap : left.template.id.localeCompare(right.template.id);
};

export const similarTemplates = (source: TemplateDetail, pool: TemplateDetail[]): SimilarTemplate[] =>
  pool
    .filter((other) => other.id !== source.id)
    .map((other) => toEntry(source, other))
    .filter((entry) => entry.template.category === source.category || entry.sharedTags.length >= MIN_SHARED_TAGS)
    .sort((left, right) => compareEntries(source, left, right))
    .slice(0, SIMILAR_LIMIT);
