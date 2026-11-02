import React, { useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { SnapRect } from "../snap/snap-engine";
import { SnapMeasureLine } from "../snap/snap-measure-line";
import { measureBetween } from "./alt-measure";
import { PAGE_MEASURE_TARGET, useAltMeasureTarget } from "./use-alt-measure-target";

interface AltMeasureOverlayProps {
  page: TemplatePage;
  selectedIds: string[];
  zoom: number;
}

const MIN_ZOOM = 0.0001;

const findTopLevelRect = (page: TemplatePage, layerId: string | null): SnapRect | null => {
  const layer = page.layers.find((entry) => entry.id === layerId);
  return layer ? { x: layer.x, y: layer.y, width: layer.width, height: layer.height } : null;
};

const resolveTargetRect = (page: TemplatePage, targetId: string | null): SnapRect | null =>
  targetId === PAGE_MEASURE_TARGET
    ? { x: 0, y: 0, width: page.width, height: page.height }
    : findTopLevelRect(page, targetId);

export const AltMeasureOverlay = ({ page, selectedIds, zoom }: AltMeasureOverlayProps): React.ReactElement => {
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const selectedRect = findTopLevelRect(page, selectedId);
  const targetId = useAltMeasureTarget({ page, selectedId: selectedRect ? selectedId : null, rootRef });
  const targetRect = resolveTargetRect(page, targetId);
  const outline = 1 / Math.max(zoom, MIN_ZOOM);

  return (
    <div ref={rootRef} className="absolute inset-0 pointer-events-none overflow-visible">
      {selectedRect && targetRect && (
        <>
          <div
            className="absolute border-[#FF3D7F] border-solid"
            style={{ left: targetRect.x, top: targetRect.y, width: targetRect.width, height: targetRect.height, borderWidth: outline }}
          />
          {measureBetween(selectedRect, targetRect).map((measurement) => (
            <SnapMeasureLine
              key={`${measurement.axis}-${measurement.start}-${measurement.end}`}
              measurement={measurement}
              zoom={zoom}
            />
          ))}
        </>
      )}
    </div>
  );
};
