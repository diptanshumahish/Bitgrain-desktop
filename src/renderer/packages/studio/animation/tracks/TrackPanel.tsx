import React from "react";
import type { AnimationController } from "../../editor/use-studio-animation";
import { collectAnimatedRows } from "./animated-layer-rows";
import { LayerTrackRow } from "./LayerTrackRow";
import { useExpandedLayerIds, useTrackPanelOpen } from "./track-panel-store";
import type { TimelineMetrics } from "./PropertyTrackRow";

export const TrackPanel: React.FC<{ controller: AnimationController }> = ({ controller }) => {
  const open = useTrackPanelOpen();
  const expandedIds = useExpandedLayerIds();
  const animation = controller.animation;
  if (!open || !animation) return null;

  const rows = collectAnimatedRows(controller.baseLayers, animation);
  const metrics: TimelineMetrics = {
    animation,
    totalMs: controller.totalDurationMs,
    frameStarts: controller.frameStartTimes,
    playheadMs: controller.playheadMs,
  };

  return (
    <div className="border-t border-[var(--s-border)] px-3 py-2 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="flex items-center justify-between pb-1.5">
        <span className="text-[12px] text-[var(--s-text-subtle)]">Property tracks</span>
        <span className="text-[12px] text-[var(--s-text-subtle)]">
          Drag keys to retime, double click a row to add one
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="py-3 text-center text-[12px] text-[var(--s-text-muted)]">
          Pose a frame and the properties that change will show up here
        </p>
      ) : (
        rows.map((row) => (
          <LayerTrackRow
            key={row.layer.id}
            layer={row.layer}
            depth={row.depth}
            groups={row.groups}
            expanded={expandedIds.includes(row.layer.id)}
            metrics={metrics}
            editPage={controller.editPage}
          />
        ))
      )}
    </div>
  );
};
