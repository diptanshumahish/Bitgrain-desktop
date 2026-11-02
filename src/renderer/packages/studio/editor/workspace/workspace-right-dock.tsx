import React from "react";
import { Copy, ChevronUp, ChevronDown, FlipHorizontal, FlipVertical, Trash2 } from "lucide-react";
import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { RightPanel } from "../../workspace/RightPanel";
import { PanelRail, RailButton } from "../../workspace/PanelRail";
import { useRightPanelCollapsed } from "../../state/studio-panels-store";
import { useSignalValue } from "@bitgrain/core/signal";
import { commentModeSignal } from "../../features/sharing/comment-state/comment-ui-store";
import { StudioCommentsSidebar } from "../../features/sharing/studio-comments/studio-comments-sidebar";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { LayerUpdateRoutes } from "./use-layer-update-routes";
import type { StudioWorkspaceProps } from "./studio-workspace-props";
import { freezeDuringGesture } from "./gesture-freeze";

const RAIL_ICON_SIZE = 16;
const RAIL_ICON_STROKE = 1.75;

const FrozenRightPanel = freezeDuringGesture(RightPanel);

type RightDockProps = Pick<
  StudioWorkspaceProps,
  | "layers" | "background" | "selectedIds" | "selectedLayer" | "editingId" | "customFonts" | "setCustomFonts"
  | "pushHistory" | "setImage" | "image" | "pages" | "setSelectedFramePageId"
  | "handlePageBackgroundBind" | "handleMatchPageToLayer" | "handleAlign" | "handleScatterCollage" | "handleDistribute"
  | "handleGroup" | "handleUngroup" | "handleDeleteLayer" | "handleMoveLayerUp" | "handleMoveLayerDown"
  | "handleFlipLayerH" | "handleFlipLayerV" | "handleDuplicate" | "handleRenamePage" | "handlePageBackgroundChange"
  | "handlePageResize" | "handlePageMoveTo" | "handleDeleteFrame"
> & {
  canvasPages: TemplatePage[];
  inspectedPage: TemplatePage | null;
  inspectedPageIndex: number;
  updateRoutes: LayerUpdateRoutes;
  onExpand: () => void;
};

interface CollapsedRailProps {
  layer: Layer | null;
  props: RightDockProps;
}

const CollapsedRail = ({ layer, props }: CollapsedRailProps): React.ReactElement => (
  <PanelRail side="right" onExpand={props.onExpand}>
    {layer && (
      <>
        <RailButton label="Duplicate" onClick={() => props.handleDuplicate([layer.id])}>
          <Copy size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
        </RailButton>
        <RailButton label="Move up" onClick={() => props.handleMoveLayerUp(layer.id)}>
          <ChevronUp size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
        </RailButton>
        <RailButton label="Move down" onClick={() => props.handleMoveLayerDown(layer.id)}>
          <ChevronDown size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
        </RailButton>
        <RailButton label="Flip horizontal" onClick={() => props.handleFlipLayerH(layer.id)}>
          <FlipHorizontal size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
        </RailButton>
        <RailButton label="Flip vertical" onClick={() => props.handleFlipLayerV(layer.id)}>
          <FlipVertical size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
        </RailButton>
        <RailButton label="Delete" danger onClick={() => props.handleDeleteLayer(layer.id)}>
          <Trash2 size={RAIL_ICON_SIZE} strokeWidth={RAIL_ICON_STROKE} />
        </RailButton>
      </>
    )}
  </PanelRail>
);

export const WorkspaceRightDock = (props: RightDockProps): React.ReactElement | null => {
  const isCollapsed = useRightPanelCollapsed();
  const commentMode = useSignalValue(commentModeSignal);
  const { selectedIds, selectedLayer, setCustomFonts, pushHistory, setImage } = props;

  if (commentMode) return <StudioCommentsSidebar pages={props.canvasPages} />;
  if (isCollapsed) return <CollapsedRail layer={selectedIds.length === 1 ? selectedLayer : null} props={props} />;

  return (
    <FrozenRightPanel
      pageLayers={props.layers}
      pageBackground={props.background}
      selectedIds={selectedIds}
      selectedLayer={selectedLayer}
      editingId={props.editingId}
      onPageBackgroundBind={props.handlePageBackgroundBind}
      onUpdateLayer={props.updateRoutes.fromPanel}
      onUpdateLayers={props.updateRoutes.manyFromPanel}
      onMatchPageToLayer={props.handleMatchPageToLayer}
      onAlign={props.handleAlign}
      onScatterCollage={props.handleScatterCollage}
      onDistribute={props.handleDistribute}
      onGroup={props.handleGroup}
      onUngroup={props.handleUngroup}
      customFonts={props.customFonts}
      onFontUpload={(font) => {
        trackEvent("studio", "font_uploaded", { details: { font_name: font.label } });
        setCustomFonts((prev) => (prev.some((entry) => entry.label === font.label) ? prev : [...prev, font]));
      }}
      onImageUpload={(dataUrl) => {
        pushHistory();
        setImage(dataUrl);
      }}
      onDeleteLayer={props.handleDeleteLayer}
      onMoveLayerUp={props.handleMoveLayerUp}
      onMoveLayerDown={props.handleMoveLayerDown}
      onFlipLayerH={props.handleFlipLayerH}
      onFlipLayerV={props.handleFlipLayerV}
      inspectedPage={props.inspectedPage}
      inspectedPageIndex={props.inspectedPageIndex}
      pages={props.pages}
      onRenamePage={props.handleRenamePage}
      onPageBackgroundChange={props.handlePageBackgroundChange}
      onPageResize={props.handlePageResize}
      onPageMove={props.handlePageMoveTo}
      onDeletePage={(id) => {
        props.setSelectedFramePageId(null);
        props.handleDeleteFrame(id);
      }}
      pageImage={props.image}
    />
  );
};
