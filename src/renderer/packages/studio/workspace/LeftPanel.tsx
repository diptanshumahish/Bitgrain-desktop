import React from "react";
import { PanelLeftClose } from "lucide-react";
import type { Layer, TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { TemplateGrid } from "../panels/TemplateGrid";
import { PagedLayersList } from "../panels/PagedLayersList";
import { toggleLeftPanel, useLeftPanelTab, useLeftPanelTabDirection } from "../state/studio-panels-store";
import { LeftPanelTabs } from "../left-panel/left-panel-tabs";
import { ElementsPanel } from "../features/elements/components/elements-panel";
import { trackEvent } from "@bitgrain/platform/tracker";

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
  onSelectFramePage: (id: string) => void;
  onAddPage: () => void;
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
  onSelectFramePage,
  onAddPage,
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
      <div className="relative shrink-0">
        <LeftPanelTabs activeTab={activeTab} />
        <button
          type="button"
          onClick={collapseLeftPanel}
          aria-label="Hide left panel"
          title="Hide left panel"
          className="absolute right-2 top-2 w-7 h-7 flex items-center justify-center rounded-md text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
        >
          <PanelLeftClose size={15} strokeWidth={1.75} />
        </button>
      </div>

      <div
        key={activeTab}
        className={`flex-1 min-h-0 flex flex-col ${slideDirection === "right" ? "animate-tab-in-right" : "animate-tab-in-left"}`}
      >
        {activeTab === "layers" && (
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar" data-layers-scroll-root="">
            <PagedLayersList
              pages={pages}
              activePageId={activePageId}
              selectedIds={selectedLayerIds}
              onSelectPage={onSelectPage}
              onSelectFramePage={onSelectFramePage}
              onAddPage={onAddPage}
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
