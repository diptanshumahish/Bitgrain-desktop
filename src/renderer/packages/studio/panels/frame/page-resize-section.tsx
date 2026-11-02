import React from "react";
import { Proportions } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";
import { PanelGroup } from "../../ui/panel-group";
import { emitStudioCommand } from "../../editor/studio-command-event";

const RESIZE_ICON_SIZE = 13;

export const PageResizeSection: React.FC = () => (
  <PanelGroup title="Other formats">
    <Button variant="secondary" size="sm" fullWidth onClick={() => emitStudioCommand("resize-formats")}>
      <Proportions size={RESIZE_ICON_SIZE} strokeWidth={1.75} />
      Resize to formats
    </Button>
    <span className="text-[11px] leading-[1.45] text-[var(--s-text-subtle)]">
      Lays this page out as a story, post, banner, thumbnail or print size, each on a new page.
    </span>
  </PanelGroup>
);
