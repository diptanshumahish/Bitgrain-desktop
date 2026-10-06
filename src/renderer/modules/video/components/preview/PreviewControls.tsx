import React from "react";
import {
  Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight,
  Repeat, Maximize, Minimize,
} from "lucide-react";
import { useSignalValue } from "../../../../lib/signal";
import {
  isPlayingSignal,
  togglePlaying,
  loopEnabledSignal,
  toggleLoop,
} from "../../store/playback-store";
import { currentTimeSignal, setCurrentTime } from "../../store/timeline-store";
import { currentProjectSignal } from "../../store/project-store";
import { isFullscreenSignal, toggleFullscreen } from "../../store/fullscreen-store";
import { formatTimecode, frameAt, totalFrames } from "../../utils/time-format";
import { Tooltip } from "../../../../components/studio/ui/Tooltip";

interface TransportButtonProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  children: React.ReactNode;
}

const TransportButton: React.FC<TransportButtonProps> = ({
  label, shortcut, onClick, children,
}) => {
  const tip = shortcut ? `${label} (${shortcut})` : label;
  return (
    <Tooltip content={tip}>
      <button
        onClick={onClick}
        aria-label={label}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors active:scale-95"
      >
        {children}
      </button>
    </Tooltip>
  );
};

export const PreviewControls: React.FC = () => {
  const playing = useSignalValue(isPlayingSignal);
  const looping = useSignalValue(loopEnabledSignal);
  const fullscreen = useSignalValue(isFullscreenSignal);
  const time = useSignalValue(currentTimeSignal);
  const project = useSignalValue(currentProjectSignal);

  const fps = project?.fps ?? 30;
  const duration = project?.duration ?? 0;
  const currentFrame = frameAt(time, fps);
  const total = totalFrames(Math.max(duration, 1 / fps), fps);

  const stepFrame = (delta: number) => {
    setCurrentTime(time + delta / fps);
  };

  const progress = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0;

  const handleProgressSeek = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setCurrentTime(ratio * duration);
  };

  return (
    <div className="shrink-0 border-t border-[var(--s-border)] bg-[var(--s-bg-panel)]">
      <div
        role="slider"
        aria-label="Playback progress"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={time}
        onPointerDown={(event) => {
          (event.target as HTMLElement).setPointerCapture(event.pointerId);
          handleProgressSeek(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          handleProgressSeek(event);
        }}
        className="h-2 w-full bg-[var(--s-bg-input)] cursor-pointer relative group hover:h-2.5 transition-[height]"
      >
        <div
          className="absolute inset-y-0 left-0 bg-[var(--s-accent)]"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--s-accent)] border-2 border-[var(--s-bg-panel)] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress * 100}%` }}
          aria-hidden
        />
      </div>

      <div className="h-12 flex items-center justify-between px-4">
        <div className="flex items-baseline gap-2 w-28 text-[var(--s-text-muted)] [font-variant-numeric:tabular-nums]">
          <span className="text-[11px]">{currentFrame}</span>
          <span className="text-[10px] text-[var(--s-text-subtle)]">/ {total} f</span>
        </div>

        <div className="flex items-center gap-1">
          <TransportButton label="Skip to start" shortcut="home" onClick={() => setCurrentTime(0)}>
            <SkipBack size={13} strokeWidth={1.75} />
          </TransportButton>
          <TransportButton label="Previous frame" shortcut="," onClick={() => stepFrame(-1)}>
            <ChevronLeft size={14} strokeWidth={1.75} />
          </TransportButton>
          <Tooltip content={playing ? "Pause (space)" : "Play (space)"}>
            <button
              onClick={togglePlaying}
              aria-label={playing ? "Pause" : "Play"}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--s-text)] text-[var(--s-bg-panel)] hover:opacity-90 transition-opacity active:scale-95"
            >
              {playing ? <Pause size={15} strokeWidth={1.75} /> : <Play size={15} strokeWidth={1.75} className="translate-x-px" />}
            </button>
          </Tooltip>
          <TransportButton label="Next frame" shortcut="." onClick={() => stepFrame(1)}>
            <ChevronRight size={14} strokeWidth={1.75} />
          </TransportButton>
          <TransportButton label="Skip to end" shortcut="end" onClick={() => setCurrentTime(duration)}>
            <SkipForward size={13} strokeWidth={1.75} />
          </TransportButton>
          <Tooltip content={looping ? "Loop on" : "Loop off"}>
            <button
              onClick={toggleLoop}
              aria-label="Toggle loop"
              aria-pressed={looping}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-95 ${
                looping
                  ? "text-[var(--s-accent)] bg-[var(--s-accent-soft)]"
                  : "text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
              }`}
            >
              <Repeat size={13} strokeWidth={1.75} />
            </button>
          </Tooltip>
        </div>

        <div className="w-28 flex items-center justify-end gap-2 text-[11px] text-[var(--s-text-muted)] [font-variant-numeric:tabular-nums]">
          <span>{formatTimecode(time, fps)}</span>
          <TransportButton
            label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            shortcut="f"
            onClick={toggleFullscreen}
          >
            {fullscreen ? (
              <Minimize size={13} strokeWidth={1.75} />
            ) : (
              <Maximize size={13} strokeWidth={1.75} />
            )}
          </TransportButton>
        </div>
      </div>
    </div>
  );
};
