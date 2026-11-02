import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { markDirty } from "../../../state/studio-save-status";
import { onPageNotesUpdate } from "./page-notes-event";

interface UsePageNotesSyncArgs {
  updatePage: (pageId: string, updater: (page: TemplatePage) => TemplatePage) => void;
  pushHistory: () => void;
}

const withNotes = (page: TemplatePage, notes: string): TemplatePage => ({
  ...page,
  notes: notes.length > 0 ? notes : undefined,
});

export const usePageNotesSync = ({ updatePage, pushHistory }: UsePageNotesSyncArgs): void => {
  const handlersRef = useRef({ updatePage, pushHistory });

  useEffect(() => {
    handlersRef.current = { updatePage, pushHistory };
  });

  useEffect(
    () =>
      onPageNotesUpdate(({ pageId, notes, recordHistory }) => {
        if (recordHistory) handlersRef.current.pushHistory();
        handlersRef.current.updatePage(pageId, (page) => withNotes(page, notes));
        markDirty();
      }),
    [],
  );
};
