import React from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { canvasAidsSignal, toggleRulers } from "../../state/canvas-aids/canvas-aids-visibility";
import { PanelGroup } from "../../ui/panel-group";
import { Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { CLEAR_AIDS_PATCH, presetPatch } from "./guide-presets";
import { GuidePresetChips } from "./guide-preset-chips";
import { GuideColorFields } from "./guide-color-fields";
import { GuidesVisibilityToggle } from "./guides-visibility-toggle";
import { GuideSpacingFields } from "./guide-spacing-fields";
import { emitAidsToPages } from "./emit-pages-aids";

interface DocumentGuidesSectionProps {
  pages: TemplatePage[];
}

const LABEL_CLASS = "text-[12px] text-[var(--s-text-subtle)] font-medium";

export const DocumentGuidesSection: React.FC<DocumentGuidesSectionProps> = ({ pages }) => {
  const { rulers } = useSignalValue(canvasAidsSignal);
  return (
    <PanelGroup title="Guides" actions={<GuidesVisibilityToggle />}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[var(--s-text-muted)]">Rulers</span>
        <Toggle label="Show rulers" value={rulers} onChange={toggleRulers} />
      </div>
      <GuideColorFields />
      <span className={LABEL_CLASS}>Add to every page</span>
      <GuideSpacingFields pages={pages} />
      <GuidePresetChips
        onApply={(preset) => emitAidsToPages(pages, (page) => presetPatch(page, preset))}
        onClear={() => emitAidsToPages(pages, () => CLEAR_AIDS_PATCH)}
      />
      <span className="text-[12px] leading-[1.45] text-[var(--s-text-subtle)]">
        Select a page to add your own lines and boxes, or drag a line out of the rulers. Guides never show up in exports.
      </span>
    </PanelGroup>
  );
};
