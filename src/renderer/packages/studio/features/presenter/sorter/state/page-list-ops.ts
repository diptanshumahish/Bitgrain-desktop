import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { duplicatePage, nextPageX } from "@bitgrain/studio-core/templates/template-pages";

interface DuplicatedPages {
  pages: TemplatePage[];
  newIds: string[];
}

export const orderedIds = (pages: TemplatePage[], ids: string[]): string[] =>
  pages.filter((page) => ids.includes(page.id)).map((page) => page.id);

export const movePages = (pages: TemplatePage[], ids: string[], insertIndex: number): TemplatePage[] => {
  const moving = pages.filter((page) => ids.includes(page.id));
  const movedBefore = pages.slice(0, insertIndex).filter((page) => ids.includes(page.id)).length;
  const rest = pages.filter((page) => !ids.includes(page.id));
  const target = Math.min(Math.max(insertIndex - movedBefore, 0), rest.length);
  return [...rest.slice(0, target), ...moving, ...rest.slice(target)];
};

export const isSameOrder = (first: TemplatePage[], second: TemplatePage[]): boolean =>
  first.length === second.length && first.every((page, index) => page.id === second[index].id);

export const duplicatePages = (pages: TemplatePage[], ids: string[]): DuplicatedPages =>
  pages.reduce<DuplicatedPages>(
    (result, page) => {
      if (!ids.includes(page.id)) return { ...result, pages: [...result.pages, page] };
      const copy = duplicatePage(page, nextPageX([...pages, ...result.pages]));
      return { pages: [...result.pages, page, copy], newIds: [...result.newIds, copy.id] };
    },
    { pages: [], newIds: [] },
  );

export const removePages = (pages: TemplatePage[], ids: string[]): TemplatePage[] => {
  const remaining = pages.filter((page) => !ids.includes(page.id));
  return remaining.length > 0 ? remaining : pages;
};
