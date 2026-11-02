import React from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { canvasAidsStyleSignal, setCanvasAidsStyle } from "../../state/canvas-aids/canvas-aids-style";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { MIN_GUIDE_SPACING_PX } from "./guide-presets";
import { refitMarginBoxes, refitRepeatGuides } from "./guide-refit";
import { emitAidsToPages } from "./emit-pages-aids";
import { useHistoryOnce } from "./use-history-once";

interface GuideSpacingFieldsProps {
  pages: TemplatePage[];
}

const MAX_GUIDE_SIZE_PX = 2000;

export const GuideSpacingFields: React.FC<GuideSpacingFieldsProps> = ({ pages }) => {
  const style = useSignalValue(canvasAidsStyleSignal);
  const history = useHistoryOnce();

  const changeMargin = (value: number): void => {
    const marginPx = Math.round(value);
    setCanvasAidsStyle({ marginPx });
    emitAidsToPages(pages, (page) => refitMarginBoxes(page, marginPx), history.takeRecord());
  };

  const changeSpacing = (value: number): void => {
    const spacingPx = Math.max(MIN_GUIDE_SPACING_PX, Math.round(value));
    setCanvasAidsStyle({ spacingPx });
    emitAidsToPages(pages, (page) => refitRepeatGuides(page, spacingPx), history.takeRecord());
  };

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <ScrubField
        label="Margin"
        title="Distance of margin boxes from the page edge"
        value={style.marginPx}
        min={0}
        max={MAX_GUIDE_SIZE_PX}
        suffix="px"
        onChange={changeMargin}
        onCommit={history.reset}
      />
      <ScrubField
        label="Spacing"
        title="Gap between repeated lines"
        value={style.spacingPx}
        min={MIN_GUIDE_SPACING_PX}
        max={MAX_GUIDE_SIZE_PX}
        suffix="px"
        onChange={changeSpacing}
        onCommit={history.reset}
      />
    </div>
  );
};
