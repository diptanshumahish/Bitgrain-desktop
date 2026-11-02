import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { SECTION_TITLE_CLASS } from "@bitgrain/ui/components/section-title-classes";
import { CanvasSettings } from "../workspace-panel/canvas-settings";
import { DesignKitList } from "../workspace-panel/design-kit-list";
import { DocumentGuidesSection } from "./guides/document-guides-section";

interface WorkspaceDetailsProps {
  pages: TemplatePage[];
}

export const WorkspaceDetails: React.FC<WorkspaceDetailsProps> = ({ pages }) => {
  const [open, setOpen] = useState(false);
  return (
    <details className="group border-t border-[var(--s-border)] mt-2" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center justify-between px-4 py-4 hover:bg-[var(--s-bg-input)] transition-colors">
        <span className={SECTION_TITLE_CLASS}>Workspace and guides</span>
        <ChevronDown size={14} strokeWidth={1.75} className="text-[var(--s-text-muted)] transition-transform group-open:rotate-180" />
      </summary>
      {open && (
        <div className="flex flex-col font-editorial pb-4">
          <CanvasSettings />
          <DocumentGuidesSection pages={pages} />
          <DesignKitList />
        </div>
      )}
    </details>
  );
};
