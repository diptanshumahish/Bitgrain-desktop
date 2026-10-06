import React from "react";
import { Clock } from "lucide-react";
import { NumberField } from "./NumberField";
import {
  moveClip,
  setClipDuration,
  setClipSpeed,
} from "../../utils/clip-mutations";
import { MIN_CLIP_SPEED, MAX_CLIP_SPEED, MIN_CLIP_DURATION } from "../../constants";

interface ClipTimingControlsProps {
  clipId: string;
  trackStart: number;
  duration: number;
  speed?: number;
}

export const ClipTimingControls: React.FC<ClipTimingControlsProps> = ({
  clipId,
  trackStart,
  duration,
  speed,
}) => {
  const supportsSpeed = speed !== undefined;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Clock size={12} className="text-[var(--s-text-subtle)]" />
        <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Timing</h4>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Start"
          unit="s"
          value={trackStart}
          step={0.1}
          min={0}
          onCommit={(value) => moveClip(clipId, value)}
        />
        <NumberField
          label="Duration"
          unit="s"
          value={duration}
          step={0.1}
          min={MIN_CLIP_DURATION}
          onCommit={(value) => setClipDuration(clipId, value)}
        />
      </div>
      {supportsSpeed && (
        <NumberField
          label="Speed"
          unit="x"
          value={speed ?? 1}
          step={0.05}
          min={MIN_CLIP_SPEED}
          max={MAX_CLIP_SPEED}
          onCommit={(value) => setClipSpeed(clipId, value)}
        />
      )}
    </div>
  );
};
