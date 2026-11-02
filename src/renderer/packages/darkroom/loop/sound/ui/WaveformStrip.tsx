import React, { useEffect, useRef } from "react";
import { formatMinutesSeconds } from "@bitgrain/core/format/minutes-seconds";
import { updateSoundSettings } from "../sound-settings";
import type { SoundTrack } from "../track/sound-track-store";
import { paintWaveform, type WaveformView } from "./waveform-paint";
import { bindWaveformDrag } from "./waveform-drag";

interface WaveformStripProps {
  track: SoundTrack;
  startSeconds: number;
  seconds: number;
}

const sizeToBox = (canvas: HTMLCanvasElement): void => {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
};

export const WaveformStrip: React.FC<WaveformStripProps> = ({ track, startSeconds, seconds }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const duration = track.buffer.duration;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const viewRef: { current: WaveformView } = { current: { peaks: track.peaks, duration, startSeconds, seconds } };
    const repaint = (): void => paintWaveform(canvas, viewRef.current);
    const observer = new ResizeObserver(() => {
      sizeToBox(canvas);
      repaint();
    });
    observer.observe(canvas);
    const unbind = bindWaveformDrag(canvas, {
      view: () => viewRef.current,
      onMove: (start) => {
        viewRef.current = { ...viewRef.current, startSeconds: start };
        repaint();
      },
      onCommit: (start) => updateSoundSettings({ startSeconds: start }),
    });
    return () => {
      observer.disconnect();
      unbind();
    };
  }, [track, duration, startSeconds, seconds]);

  return (
    <div className="flex flex-col gap-1 px-2">
      <canvas
        ref={canvasRef}
        role="slider"
        tabIndex={0}
        aria-label="Where the loop starts in your track"
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(startSeconds)}
        aria-valuetext={`Starts at ${formatMinutesSeconds(startSeconds)}`}
        className="block w-full h-12 rounded-md bg-[var(--s-bg-input)] cursor-grab active:cursor-grabbing touch-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-accent)]"
      />
      <div className="flex items-center justify-between text-[11px] text-[var(--s-text-subtle)] tabular-nums">
        <span>Drag to pick the part that plays</span>
        <span>
          {formatMinutesSeconds(startSeconds)} to {formatMinutesSeconds(Math.min(duration, startSeconds + seconds))}
        </span>
      </div>
    </div>
  );
};
