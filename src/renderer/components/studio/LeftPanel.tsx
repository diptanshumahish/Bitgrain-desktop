import React from "react";
import { PanelLeftClose } from "lucide-react";
import type { Layer, TemplateDef, TemplatePage } from "../../data/studioTypes";
import { TemplateGrid } from "./panels/TemplateGrid";
import { PagedLayersList } from "./panels/PagedLayersList";
import { SectionLogo } from "../section-nav/SectionLogo";
import { toggleLeftPanel, useLeftPanelTab, useLeftPanelTabDirection } from "../../store/studio-panels-store";
import { LeftPanelTabs } from "./left-panel/left-panel-tabs";
import { ElementsPanel } from "../../modules/elements/components/elements-panel";
import { trackEvent } from "../../lib/tracker";

const collapseLeftPanel = (): void => {
  trackEvent("studio", "panel_collapsed", { details: { side: "left" } });
  toggleLeftPanel();
};

interface LeftPanelProps {
  selectedTemplateId: string;
  pages: TemplatePage[];
  activePageId: string;
  selectedLayerIds: string[];
  onSelectTemplate: (t: TemplateDef) => void;
  onSelectPage: (id: string) => void;
  onAddFrame: (width: number, height: number, name?: string) => void;
  frameWidth: number;
  frameHeight: number;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (id: string) => void;
  onSelectLayer: (id: string, multi?: boolean) => void;
  onSelectLayerIds: (ids: string[]) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayersForPage: (pageId: string, layers: Layer[]) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicate: (ids: string[]) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  selectedTemplateId,
  pages,
  activePageId,
  selectedLayerIds,
  onSelectTemplate,
  onSelectPage,
  onAddFrame,
  frameWidth,
  frameHeight,
  onDuplicatePage,
  onDeletePage,
  onSelectLayer,
  onSelectLayerIds,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayersForPage,
  onGroup,
  onUngroup,
  onDuplicate,
}) => {
  const activeTab = useLeftPanelTab();
  const slideDirection = useLeftPanelTabDirection();

  return (
    <div
      data-tutorial="studio-templates"
      className="w-[280px] min-w-[280px] flex flex-col bg-[var(--s-bg-panel)] border-r border-[var(--s-border)] font-editorial h-full overflow-hidden"
    >
      <div className="px-3.5 py-2.5 border-b border-[var(--s-border)] flex items-center justify-between gap-2 shrink-0 bg-[var(--s-bg-panel)]">
        <SectionLogo
          className="flex items-center gap-2 group cursor-pointer"
          imageClassName="h-4 w-auto rounded opacity-80 group-hover:opacity-100 transition-opacity"
          label="Bitgrain Studio"
          labelClassName="text-[10.5px] text-[var(--s-text-subtle)]"
        />
        <button
          type="button"
          onClick={collapseLeftPanel}
          aria-label="Hide left panel"
          title="Hide left panel"
          className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
        >
          <PanelLeftClose size={15} strokeWidth={1.75} />
        </button>
      </div>

      <LeftPanelTabs activeTab={activeTab} />

      <div
        key={activeTab}
        className={`flex-1 min-h-0 flex flex-col ${slideDirection === "right" ? "animate-tab-in-right" : "animate-tab-in-left"}`}
      >
        {activeTab === "layers" && (
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <PagedLayersList
              pages={pages}
              activePageId={activePageId}
              selectedIds={selectedLayerIds}
              onSelectPage={onSelectPage}
              onAddFrame={onAddFrame}
              frameWidth={frameWidth}
              frameHeight={frameHeight}
              onDuplicatePage={onDuplicatePage}
              onDeletePage={onDeletePage}
              onSelect={onSelectLayer}
              onSelectIds={onSelectLayerIds}
              onUpdateLayer={onUpdateLayer}
              onDeleteLayer={onDeleteLayer}
              onReorderLayersForPage={onReorderLayersForPage}
              onGroup={onGroup}
              onUngroup={onUngroup}
              onDuplicate={onDuplicate}
            />
          </div>
        )}
        {activeTab === "elements" && <ElementsPanel />}
        {activeTab === "templates" && (
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <TemplateGrid selectedId={selectedTemplateId} onSelect={onSelectTemplate} />
          </div>
        )}
      </div>
    </div>
  );
};
