import { signal } from "../../lib/signal";
import type { TemplateSummary } from "../../lib/template-cards/template-summary";

const SHOWCASE_LIMIT = 3;
const MIN_SHOWCASE_RATIO = 0.7;
const MAX_SHOWCASE_RATIO = 1;

export interface LibraryShowcase {
  showcase: TemplateSummary[];
  total: number;
}

export const libraryShowcaseSignal = signal<LibraryShowcase>({ showcase: [], total: 0 });

const fitsShowcase = (template: TemplateSummary): boolean => {
  const ratio = template.width / template.height;
  return Boolean(template.thumbnail) && ratio >= MIN_SHOWCASE_RATIO && ratio <= MAX_SHOWCASE_RATIO;
};

const pickShowcase = (templates: TemplateSummary[]): TemplateSummary[] => {
  const candidates = templates.filter(fitsShowcase);
  const featured = candidates.filter((template) => template.featured);
  const rest = candidates.filter((template) => !template.featured);
  return [...featured, ...rest].slice(0, SHOWCASE_LIMIT);
};

export function updateLibraryShowcase(templates: TemplateSummary[], total: number): void {
  if (total <= 0) return;
  const current = libraryShowcaseSignal.value;
  if (current.total === total && current.showcase.length > 0) return;
  libraryShowcaseSignal.value = { showcase: pickShowcase(templates), total };
}
