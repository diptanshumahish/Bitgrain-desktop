import React from "react";
import { RotateCcw } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { PageAnimation, TrackGroupId } from "@bitgrain/studio-core/model/animation-types";
import { effectiveTrack, hasExplicitTrack } from "@bitgrain/studio-core/animate/tracks/layer-tracks";
import { TRACK_GROUP_LABELS } from "@bitgrain/studio-core/animate/tracks/track-groups";
import { KeyDiamond } from "./KeyDiamond";
import { LaneBackdrop } from "./LaneBackdrop";
import { createTrackActions, type PageEditor } from "./track-actions";
import { openKeyEditor } from "./open-key-editor";
import { timeFromLane } from "./lane-time";

export interface TimelineMetrics {
  animation: PageAnimation;
  totalMs: number;
  frameStarts: number[];
  playheadMs: number;
}

interface PropertyTrackRowProps {
  layer: Layer;
  group: TrackGroupId;
  metrics: TimelineMetrics;
  editPage: PageEditor;
}

export const PropertyTrackRow: React.FC<PropertyTrackRowProps> = ({ layer, group, metrics, editPage }) => {
  const keys = effectiveTrack(layer, metrics.animation, group);
  const explicit = hasExplicitTrack(layer, group);
  const actions = createTrackActions(editPage, { layerId: layer.id, group });
  const label = TRACK_GROUP_LABELS[group];

  return (
    <div className="flex items-center h-6">
      <div className="w-40 shrink-0 pl-7 pr-2 flex items-center gap-1.5 min-w-0">
        <span className="text-[12px] text-[var(--s-text-muted)] truncate">{label}</span>
        {explicit ? (
          <button
            type="button"
            onClick={actions.reset}
            title="Follow frames again"
            aria-label={`Reset ${label} to follow frames`}
            className="ml-auto w-5 h-5 rounded flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
          >
            <RotateCcw size={10} strokeWidth={1.75} />
          </button>
        ) : (
          <span className="ml-auto text-[12px] text-[var(--s-text-subtle)] shrink-0">frames</span>
        )}
      </div>
      <div
        className="relative flex-1 h-full mr-3"
        onDoubleClick={(event) => actions.addKey(timeFromLane(event.currentTarget, event.clientX, metrics.totalMs))}
      >
        <LaneBackdrop frameStarts={metrics.frameStarts} totalMs={metrics.totalMs} playheadMs={metrics.playheadMs} />
        {keys.map((trackKey) => (
          <KeyDiamond
            key={trackKey.id}
            timeMs={trackKey.timeMs}
            totalMs={metrics.totalMs}
            linked={!explicit}
            onMove={(timeMs, firstMove) => actions.moveKey(trackKey.id, timeMs, firstMove)}
            onOpen={(anchor) =>
              openKeyEditor({ anchor, trackKey, trackLabel: label, removable: keys.length > 1, actions })
            }
          />
        ))}
      </div>
    </div>
  );
};
