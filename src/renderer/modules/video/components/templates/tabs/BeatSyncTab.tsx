import React, { useCallback } from "react";
import { useSignalValue } from "../../../../../lib/signal";
import { beatStateSignal } from "../../../templates/beat-state";
import {
  analyzeBeatsForTimelineAudio,
  blinkEffectAtBeats,
  pulseTextAtBeats,
  sliceVideoAtBeats,
} from "../../../templates/apply-beats";
import { emitPopover } from "../../../../../lib/event-bus";
import { BeatsPreview } from "../previews/BeatsPreview";

function describeStatus(status: string, beatCount: number, message?: string): string {
  if (status === "idle") return "Click analyze to detect beats from your audio track.";
  if (status === "analyzing") return "Listening for beats…";
  if (status === "ready") return `${beatCount} beat${beatCount === 1 ? "" : "s"} detected. Pick an action.`;
  if (status === "no-audio") return "No audio clip found on the timeline. Add one first.";
  return message ?? "Beat detection failed.";
}

export const BeatSyncTab: React.FC = () => {
  const state = useSignalValue(beatStateSignal);

  const onAnalyze = useCallback(async () => {
    beatStateSignal.value = { status: "analyzing", beats: [] };
    const result = await analyzeBeatsForTimelineAudio();
    if (!result) {
      beatStateSignal.value = { status: "no-audio", beats: [] };
      return;
    }
    beatStateSignal.value = { status: "ready", beats: result.beats };
  }, []);

  const applyAction = useCallback(
    (action: () => number) => {
      const count = action();
      if (count > 0) emitPopover(null);
    },
    [],
  );

  const hasBeats = state.status === "ready" && state.beats.length > 0;
  const previewActive = state.status === "analyzing" || hasBeats;

  return (
    <div className="flex flex-col gap-1.5 p-1">
      <BeatsPreview active={previewActive} />

      <div className="px-2.5 py-2 rounded-md bg-[var(--s-bg-input)] text-[10.5px] text-[var(--s-text-subtle)] leading-snug">
        {describeStatus(state.status, state.beats.length, state.message)}
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={state.status === "analyzing"}
        className="px-2.5 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] disabled:opacity-40 text-[11.5px] text-[var(--s-text)] text-left transition-colors"
      >
        {state.status === "analyzing" ? "Analyzing…" : "Analyze audio track"}
      </button>

      <button
        type="button"
        disabled={!hasBeats}
        onClick={() => applyAction(() => sliceVideoAtBeats(state.beats))}
        className="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-left transition-colors"
      >
        <span className="text-[11.5px] text-[var(--s-text)] font-medium">
          Slice video at beats
        </span>
        <span className="text-[10px] text-[var(--s-text-subtle)] leading-snug">
          Cuts the active video clip at every detected beat
        </span>
      </button>

      <button
        type="button"
        disabled={!hasBeats}
        onClick={() => applyAction(() => pulseTextAtBeats(state.beats))}
        className="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-left transition-colors"
      >
        <span className="text-[11.5px] text-[var(--s-text)] font-medium">
          Pulse marker at beats
        </span>
        <span className="text-[10px] text-[var(--s-text-subtle)] leading-snug">
          Drops a popping dot on the text track for every beat
        </span>
      </button>

      <button
        type="button"
        disabled={!hasBeats}
        onClick={() => applyAction(() => blinkEffectAtBeats(state.beats))}
        className="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-left transition-colors"
      >
        <span className="text-[11.5px] text-[var(--s-text)] font-medium">
          Pop zoom at beats
        </span>
        <span className="text-[10px] text-[var(--s-text-subtle)] leading-snug">
          Adds a quick scale-up effect clip on every beat
        </span>
      </button>
    </div>
  );
};
