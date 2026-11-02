import { useEffect } from "react";
import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { usePageNotesSync } from "./notes/use-page-notes-sync";
import { useSlideSorterActions } from "./sorter/hooks/use-slide-sorter-actions";
import { useSlideSorterShortcut } from "./sorter/hooks/use-slide-sorter-shortcut";
import { closeSlideSorter, sorterDocumentSignal } from "./sorter/state/slide-sorter-store";

interface UsePresenterToolsArgs {
  pages: TemplatePage[];
  activePageId: string;
  template: TemplateDef;
  updatePage: (pageId: string, updater: (page: TemplatePage) => TemplatePage) => void;
  setPages: (pages: TemplatePage[]) => void;
  pushHistory: () => void;
  undo: () => void;
  selectPage: (pageId: string) => void;
}

export const usePresenterTools = (args: UsePresenterToolsArgs): void => {
  const { pages, activePageId, template, updatePage, setPages, pushHistory, undo, selectPage } = args;
  usePageNotesSync({ updatePage, pushHistory });
  useSlideSorterActions({ pages, activePageId, setPages, pushHistory, undo, selectPage });
  useSlideSorterShortcut();

  useEffect(() => {
    sorterDocumentSignal.value = { template, activePageId };
  }, [template, activePageId]);

  useEffect(() => closeSlideSorter, []);
};
