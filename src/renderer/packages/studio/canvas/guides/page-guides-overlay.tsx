import React from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { PageGuide } from "@bitgrain/studio-core/model/layout-grid-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { canvasAidsSignal } from "../../state/canvas-aids/canvas-aids-visibility";
import { selectedGuideSignal } from "../../state/canvas-aids/guide-selection";
import { canvasAidsStyleSignal } from "../../state/canvas-aids/canvas-aids-style";
import { GUIDE_HIT_PX, SELECTED_GUIDE_COLOR } from "./guide-constants";
import { useGuideDrag, type GuideDragHandlers } from "./use-guide-drag";

interface PageGuidesOverlayProps {
  page: TemplatePage;
  zoom: number;
}

interface GuideLineProps {
  guide: PageGuide;
  page: TemplatePage;
  zoom: number;
  selected: boolean;
  color: string;
  drag: GuideDragHandlers;
}

const MIN_ZOOM = 0.0001;

const GuideLine = ({ guide, page, zoom, selected, color, drag }: GuideLineProps): React.ReactElement => {
  const scale = Math.max(zoom, MIN_ZOOM);
  const hit = GUIDE_HIT_PX / scale;
  const thickness = 1 / scale;
  const vertical = guide.axis === "x";
  const box = vertical
    ? { left: guide.position - hit / 2, top: 0, width: hit, height: page.height }
    : { left: 0, top: guide.position - hit / 2, width: page.width, height: hit };
  const line = vertical
    ? { left: (hit - thickness) / 2, top: 0, width: thickness, height: page.height }
    : { left: 0, top: (hit - thickness) / 2, width: page.width, height: thickness };
  return (
    <div
      data-page-guide={guide.id}
      className={`absolute pointer-events-auto touch-none ${vertical ? "cursor-col-resize" : "cursor-row-resize"}`}
      style={box}
      onPointerDown={(event) => drag.onPointerDown(event, guide)}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="absolute" style={{ ...line, backgroundColor: selected ? SELECTED_GUIDE_COLOR : color }} />
    </div>
  );
};

export const PageGuidesOverlay = ({ page, zoom }: PageGuidesOverlayProps): React.ReactElement | null => {
  const visible = useSignalValue(canvasAidsSignal).guides;
  const selection = useSignalValue(selectedGuideSignal);
  const { guideColor } = useSignalValue(canvasAidsStyleSignal);
  const drag = useGuideDrag(page, zoom);
  const guides = page.guides ?? [];
  if (!visible || guides.length === 0) return null;
  return (
    <div className="absolute top-0 left-0 z-[57] pointer-events-none overflow-visible" style={{ width: page.width, height: page.height }}>
      {guides.map((guide) => (
        <GuideLine
          key={guide.id}
          guide={guide}
          page={page}
          zoom={zoom}
          selected={selection?.pageId === page.id && selection.guideId === guide.id}
          color={guideColor}
          drag={drag}
        />
      ))}
    </div>
  );
};
