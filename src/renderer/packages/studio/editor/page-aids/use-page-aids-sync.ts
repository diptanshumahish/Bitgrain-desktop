import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { onPageAidsUpdate } from "../../state/canvas-aids/page-aids-event";

interface UsePageAidsSyncArgs {
  updatePage: (pageId: string, updater: (page: TemplatePage) => TemplatePage) => void;
  pushHistory: () => void;
}

export const usePageAidsSync = ({ updatePage, pushHistory }: UsePageAidsSyncArgs): void => {
  const handlersRef = useRef({ updatePage, pushHistory });

  useEffect(() => {
    handlersRef.current = { updatePage, pushHistory };
  });

  useEffect(
    () =>
      onPageAidsUpdate(({ pageId, patch, recordHistory }) => {
        if (recordHistory) handlersRef.current.pushHistory();
        handlersRef.current.updatePage(pageId, (page) => ({ ...page, ...patch }));
      }),
    [],
  );
};
