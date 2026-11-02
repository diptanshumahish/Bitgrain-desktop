import React from "react";
import { ChevronRight } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { TrackGroupId } from "@bitgrain/studio-core/model/animation-types";
import { effectiveTrack } from "@bitgrain/studio-core/animate/tracks/layer-tracks";
import { PropertyTrackRow, type TimelineMetrics } from "./PropertyTrackRow";
import { LaneBackdrop } from "./LaneBackdrop";
import { lanePercent } from "./lane-time";
import { toggleLayerExpanded } from "./track-panel-store";
import type { PageEditor } from "./track-actions";

interface LayerTrackRowProps {
  layer: Layer;
  depth: number;
  groups: TrackGroupId[];
  expanded: boolean;
  metrics: TimelineMetrics;
  editPage: PageEditor;
}

const INDENT_PX = 10;
const BASE_INDENT_PX = 4;

const keyTimes = (layer: Layer, groups: TrackGroupId[], metrics: TimelineMetrics): number[] => {
  const times = groups.flatMap((group) => effectiveTrack(layer, metrics.animation, group).map((key) => key.timeMs));
  return [...new Set(times)];
};

export const LayerTrackRow: React.FC<LayerTrackRowProps> = ({ layer, depth, groups, expanded, metrics, editPage }) => (
  <div className="flex flex-col">
    <div className="flex items-center h-7">
      <button
        type="button"
        onClick={() => toggleLayerExpanded(layer.id)}
        aria-expanded={expanded}
        className="w-40 shrink-0 h-full flex items-center gap-1 pr-2 text-left text-[12px] text-[var(--s-text)] hover:bg-[var(--s-bg-input)] rounded-md min-w-0"
        style={{ paddingLeft: depth * INDENT_PX + BASE_INDENT_PX }}
      >
        <ChevronRight
          size={12}
          strokeWidth={1.75}
          className={`shrink-0 text-[var(--s-text-subtle)] transition-transform ${expanded ? "rotate-90" : ""}`}
        />
        <span className="truncate">{layer.name || layer.type}</span>
        <span className="ml-auto text-[12px] text-[var(--s-text-subtle)] shrink-0">{groups.length}</span>
      </button>
      <div className="relative flex-1 h-full mr-3">
        <LaneBackdrop frameStarts={metrics.frameStarts} totalMs={metrics.totalMs} playheadMs={metrics.playheadMs} />
        {keyTimes(layer, groups, metrics).map((timeMs) => (
          <span
            key={timeMs}
            className="absolute top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--s-text-subtle)] pointer-events-none"
            style={{ left: lanePercent(timeMs, metrics.totalMs) }}
          />
        ))}
      </div>
    </div>
    {expanded &&
      groups.map((group) => (
        <PropertyTrackRow key={group} layer={layer} group={group} metrics={metrics} editPage={editPage} />
      ))}
  </div>
);
