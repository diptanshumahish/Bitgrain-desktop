import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { onOpenFindReplace } from "./find-replace-events";
import { findPagesSignal, findReplaceOpenSignal, setFindReplaceBridge } from "./find-replace-state";

interface UseFindReplaceArgs {
  pages: TemplatePage[];
  editingId: string | null;
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (pageId: string) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
}

const isFindShortcut = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.code === "KeyF";

const typingInField = (event: KeyboardEvent): boolean =>
  Boolean((event.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]"));

const openFindReplace = (source: string): void => {
  findReplaceOpenSignal.value = true;
  trackEvent("studio", "find_replace_opened", { details: { source } });
};

export const useFindReplace = (args: UseFindReplaceArgs): void => {
  const argsRef = useRef(args);

  useEffect(() => {
    argsRef.current = args;
    findPagesSignal.value = args.pages;
  });

  useEffect(() => {
    setFindReplaceBridge({
      applyPages: (pages) => {
        argsRef.current.pushHistory();
        argsRef.current.setPages(pages);
      },
      reveal: (pageId, layerId) => {
        argsRef.current.setActivePageId(pageId);
        argsRef.current.setSelectedIds([layerId]);
      },
    });
    return () => setFindReplaceBridge(null);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (!isFindShortcut(event) || argsRef.current.editingId || typingInField(event)) return;
      event.preventDefault();
      openFindReplace("shortcut");
    };
    window.addEventListener("keydown", onKey);
    const offOpen = onOpenFindReplace(() => openFindReplace("menu"));
    return () => {
      window.removeEventListener("keydown", onKey);
      offOpen();
    };
  }, []);
};
