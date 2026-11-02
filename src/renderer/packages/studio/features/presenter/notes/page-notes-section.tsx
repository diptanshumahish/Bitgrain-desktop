import React from "react";
import { PanelGroup } from "../../../ui/panel-group";
import { PageNotesField } from "./page-notes-field";

interface PageNotesSectionProps {
  pageId: string;
  notes: string | undefined;
}

export const PageNotesSection: React.FC<PageNotesSectionProps> = ({ pageId, notes }) => (
  <PanelGroup title="Speaker notes">
    <PageNotesField pageId={pageId} notes={notes ?? ""} className="h-28" />
    <span className="text-[11px] leading-[1.45] text-[var(--s-text-subtle)]">
      Only you see these, in presenter view and in PowerPoint files your AI assistant makes. They never appear on the slide.
    </span>
  </PanelGroup>
);
