import React from "react";
import { Image as ImageIcon, Type, Square, FilePlus } from "lucide-react";
import { LeftPanel } from "../../workspace/LeftPanel";
import { PanelRail, RailButton } from "../../workspace/PanelRail";
import { useLeftPanelCollapsed } from "../../state/studio-panels-store";
import type { StudioWorkspaceProps } from "./studio-workspace-props";
import { freezeDuringGesture } from "./gesture-freeze";

const RAIL_ICON_SIZE = 16;
const RAIL_ICON_STROKE = 1.75;

const FrozenLeftPanel = freezeDuringGesture(LeftPanel);

type LeftDockProps = Pick<
  StudioWorkspaceProps,
  | "activeTemplateId" | "pages" | "activePageId" | "selectedIds" | "setSelectedIds" | "commitUpdate"
  | "handleSelectTemplate" | "handleSelectPage" | "handleSelectFramePage" | "handleAddPage" | "handleDuplicatePage"
  | "handleDeleteFrame" | "handleDeleteLayer" | "handleReorderLayersForPage" | "handleGroup" | "handleUngroup"
  | "handleDuplicate" | "handleAddText" | "handleAddImage" | "handleAddShape"
> & { onExpand: () => void };

export const WorkspaceLeftDock = (props: LeftDockProps): React.ReactElement => {
  const isCollapsed = useLeftPanelCollapsed();
  const { setSelectedIds } = props;

  const selectLayer = (id: string, multi?: boolean): void => {
    if (multi) setSelectedIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
    else setSelectedIds(id ? [id] : []);
  };

  return (
    <div
      className={`relative h-full shrink-0 overflow-clip transition-[width] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] ${
        isCollapsed ? "w-11" : "w-[280px]"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-[280px] transition-opacity duration-150 ${
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <FrozenLeftPanel
          selectedTemplateId={props.activeTemplateId}
          pages={props.pages}
          activePageId={props.activePageId}
          selectedLayerIds={props.selectedIds}
          onSelectTemplate={props.handleSelectTemplate}
          onSelectPage={props.handleSelectPage}
          onSelectFramePage={props.handleSelectFramePage}
          onAddPage={props.handleAddPage}
          onDuplicatePage={props.handleDuplicatePage}
          onDeletePage={props.handleDeleteFrame}
          onSelectLayer={selectLayer}
          onSelectLayerIds={setSelectedIds}
          onUpdateLayer={(id, updates) => props.commitUpdate(id, updates)}
          onDeleteLayer={props.handleDeleteLayer}
          onReorderLayersForPage={props.handleReorderLayersForPage}
          onGroup={props.handleGroup}
          onUngroup={props.handleUngroup}
          onDuplicate={props.handleDuplicate}
        />
      </div>

      <div
        className={`absolute inset-y-0 left-0 w-11 transition-opacity duration-150 ${
          isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <PanelRail
          side="left"
          onExpand={props.onExpand}
          footer={<img src="/bitgrainlogo.png" alt="bitgrain" className="h-5 w-auto rounded opacity-70" />}
        >
          <RailButton label="Add text" onClick={props.handleAddText}>
            <Type size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
          </RailButton>
          <RailButton label="Add image" onClick={props.handleAddImage}>
            <ImageIcon size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
          </RailButton>
          <RailButton label="Add rectangle" onClick={() => props.handleAddShape("rect")}>
            <Square size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
          </RailButton>
          <RailButton label="Add page" onClick={props.handleAddPage}>
            <FilePlus size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
          </RailButton>
        </PanelRail>
      </div>
    </div>
  );
};
