import React, { useMemo } from "react";
import { useSignalValue } from "../../../../lib/signal";
import {
  renderCache,
  cachedFramesVersionSignal,
} from "../../engine/preview/render-cache";
import { prerenderActiveSignal } from "../../engine/preview/prerender";

interface CacheBarProps {
  pxPerSecond: number;
  fps: number;
}

interface Range {
  startFrame: number;
  endFrame: number;
}

function contiguousRanges(frames: number[]): Range[] {
  if (frames.length === 0) return [];
  const ranges: Range[] = [];
  let startFrame = frames[0];
  let prev = frames[0];
  for (let i = 1; i < frames.length; i++) {
    const frame = frames[i];
    if (frame === prev + 1) {
      prev = frame;
      continue;
    }
    ranges.push({ startFrame, endFrame: prev });
    startFrame = frame;
    prev = frame;
  }
  ranges.push({ startFrame, endFrame: prev });
  return ranges;
}

// The green strip under the ruler: which stretches of the timeline are sitting
// in the render cache and will play back without touching the engine. Same
// language as the render bar in any desktop NLE, and the honest readout of what
// the background pre-renderer has managed to get done.
export const CacheBar: React.FC<CacheBarProps> = ({ pxPerSecond, fps }) => {
  const version = useSignalValue(cachedFramesVersionSignal);
  const prerendering = useSignalValue(prerenderActiveSignal);

  const ranges = useMemo(
    () => contiguousRanges(renderCache.cachedFrames()),
    // `version` is the cache's change counter; the frame list is read fresh
    // whenever it moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  if (ranges.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px]"
      aria-hidden="true"
    >
      {ranges.map((range) => {
        const left = (range.startFrame / fps) * pxPerSecond;
        const width = Math.max(
          1,
          ((range.endFrame - range.startFrame + 1) / fps) * pxPerSecond,
        );
        return (
          <div
            key={`cache-${range.startFrame}`}
            className={`absolute top-0 h-full rounded-sm ${
              prerendering ? "bg-emerald-400/70" : "bg-emerald-500/45"
            }`}
            style={{ left, width }}
          />
        );
      })}
    </div>
  );
};
