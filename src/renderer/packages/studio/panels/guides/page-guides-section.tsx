import React from "react";
import { Plus } from "lucide-react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { PageSafeZone } from "@bitgrain/studio-core/design-sizes/safe-zone-types";
import { emitPageAidsUpdate, type PageAidsPatch } from "../../state/canvas-aids/page-aids-event";
import { moveGuide, removeGuide } from "../../canvas/guides/guide-list-ops";
import { PanelGroup } from "../../ui/panel-group";
import { CLEAR_AIDS_PATCH, makeCenterGuide, makeMarginBox, presetPatch } from "./guide-presets";
import { GuidePresetChips } from "./guide-preset-chips";
import { GuideLineRow } from "./guide-line-row";
import { GuideBoxRow } from "./guide-box-row";
import { GuidesVisibilityToggle } from "./guides-visibility-toggle";
import { GuideSpacingFields } from "./guide-spacing-fields";

interface PageGuidesSectionProps {
  page: TemplatePage;
}

const ICON_SIZE = 11;

const applyBoxEdit = (zone: PageSafeZone, patch: Partial<PageSafeZone>): PageSafeZone => {
  const next = { ...zone, ...patch };
  return "label" in patch ? next : { ...next, preset: undefined };
};

const ADD_CLASS =
  "flex h-7 flex-1 items-center justify-center gap-1 rounded-md bg-[var(--s-bg-input)] text-[12px] font-medium text-[var(--s-text-muted)] transition-colors hover:text-[var(--s-text)]";

export const PageGuidesSection: React.FC<PageGuidesSectionProps> = ({ page }) => {
  const guides = page.guides ?? [];
  const zones = page.safeZones ?? [];
  const write = (patch: PageAidsPatch, recordHistory = true): void => emitPageAidsUpdate({ pageId: page.id, patch, recordHistory });
  const updateZone = (id: string, patch: Partial<PageSafeZone>, recordHistory: boolean): void =>
    write({ safeZones: zones.map((zone) => (zone.id === id ? applyBoxEdit(zone, patch) : zone)) }, recordHistory);

  return (
    <PanelGroup title="Guides" actions={<GuidesVisibilityToggle />}>
      <GuideSpacingFields pages={[page]} />
      <GuidePresetChips onApply={(preset) => write(presetPatch(page, preset))} onClear={() => write(CLEAR_AIDS_PATCH)} />
      {guides.map((guide) => (
        <GuideLineRow
          key={guide.id}
          guide={guide}
          max={guide.axis === "x" ? page.width : page.height}
          onMove={(position, recordHistory) => write({ guides: moveGuide(guides, guide.id, position) }, recordHistory)}
          onRemove={() => write({ guides: removeGuide(guides, guide.id) })}
        />
      ))}
      {zones.map((zone) => (
        <GuideBoxRow
          key={zone.id}
          zone={zone}
          pageWidth={page.width}
          pageHeight={page.height}
          onChange={(patch, recordHistory) => updateZone(zone.id, patch, recordHistory)}
          onRemove={() => write({ safeZones: zones.filter((entry) => entry.id !== zone.id) })}
        />
      ))}
      <div className="flex gap-1">
        <button type="button" className={ADD_CLASS} onClick={() => write({ guides: [...guides, makeCenterGuide(page, "x")] })}>
          <Plus size={ICON_SIZE} /> Vertical
        </button>
        <button type="button" className={ADD_CLASS} onClick={() => write({ guides: [...guides, makeCenterGuide(page, "y")] })}>
          <Plus size={ICON_SIZE} /> Horizontal
        </button>
        <button type="button" className={ADD_CLASS} onClick={() => write({ safeZones: [...zones, makeMarginBox(page)] })}>
          <Plus size={ICON_SIZE} /> Box
        </button>
      </div>
      <span className="text-[12px] leading-[1.45] text-[var(--s-text-subtle)]">
        Lines and boxes are only there to help you line things up. They are not layers and never show up in exports.
      </span>
    </PanelGroup>
  );
};
