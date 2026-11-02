import React, { useMemo, useRef } from "react";
import { Pause, Play } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import type { LoopFps, LoopMotion } from "../../loop-settings";
import { loopPreviewProgressSignal } from "../../preview/loop-preview-store";
import { soundSettingsSignal, type SoundDrive } from "../sound-settings";
import type { SoundTrack } from "../track/sound-track-store";
import { soundPlanFor } from "../engine/sound-plan-for";
import { soundPlayingSignal, soundPreviewErrorSignal } from "./sound-preview-store";
import { useSoundPreview } from "./use-sound-preview";

interface SoundModalPreviewProps {
  motion: LoopMotion;
  fps: LoopFps;
  drive: SoundDrive;
  track: SoundTrack;
}

const PLAY_ICON_SIZE = 14;
const BADGE_CLASS = "absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-[var(--s-bg-panel)]/90 text-[12px] text-[var(--s-text-muted)] tabular-nums";
const PLAY_CLASS = "absolute bottom-3 right-3 h-8 px-3 flex items-center gap-1.5 rounded-full bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[12px] font-semibold hover:opacity-90 transition-opacity";

export const SoundModalPreview: React.FC<SoundModalPreviewProps> = ({ motion, fps, drive, track }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = useSignalValue(soundSettingsSignal);
  const playing = useSignalValue(soundPlayingSignal);
  const progress = useSignalValue(loopPreviewProgressSignal);
  const error = useSignalValue(soundPreviewErrorSignal);
  const plan = soundPlanFor(track, settings, fps);
  const region = useMemo(
    () => ({ buffer: track.buffer, startSeconds: settings.startSeconds, seconds: settings.seconds }),
    [track, settings.startSeconds, settings.seconds],
  );
  const togglePlay = useSoundPreview({ canvasRef, motion, fps, drive, frame: settings.frame, plan, region });

  return (
    <div className="relative flex items-center justify-center min-h-[220px] md:w-[300px] shrink-0 bg-[var(--s-bg-input)] p-4">
      <canvas ref={canvasRef} className="block max-w-full max-h-[min(52dvh,420px)] object-contain" />
      {progress && (
        <span aria-live="polite" className={BADGE_CLASS}>
          Rendering {progress.rendered} of {progress.total} looks
        </span>
      )}
      {error && <span role="alert" className={BADGE_CLASS}>{error}</span>}
      <button type="button" onClick={togglePlay} aria-pressed={playing} className={PLAY_CLASS}>
        {playing ? <Pause size={PLAY_ICON_SIZE} strokeWidth={2} /> : <Play size={PLAY_ICON_SIZE} strokeWidth={2} />}
        {playing ? "Pause" : "Play with sound"}
      </button>
    </div>
  );
};
