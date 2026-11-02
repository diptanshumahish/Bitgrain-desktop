import React from "react";
import { Play, Pause, Plus, X, Repeat, Move, ListTree } from "lucide-react";
import type { AnimationController } from "../editor/use-studio-animation";
import { AnimationScrubber } from "./AnimationScrubber";
import { AnimationExportMenu } from "./export/AnimationExportMenu";
import { Dropdown } from "../ui/dropdown";
import { NumberCommitInput } from "../ui/number-commit-input";
import { FrameChip } from "./FrameChip";
import { staggerDelay } from "./stagger-delay";
import { EmptyBar } from "./EmptyBar";
import { EasingButton } from "./easing/EasingButton";
import { TrackPanel } from "./tracks/TrackPanel";
import { toggleTrackPanel, useTrackPanelOpen } from "./tracks/track-panel-store";
import { useRefitOnTimelineChange } from "./use-refit-on-timeline-change";

const FPS_OPTIONS = [24, 30, 60];
const MIN_FRAME_DURATION_MS = 50;

const FPS_DROPDOWN = FPS_OPTIONS.map((fps) => ({ value: String(fps), label: String(fps) }));

export const AnimationBar: React.FC<{ controller: AnimationController }> = ({ controller }) => {
  const tracksOpen = useTrackPanelOpen();
  useRefitOnTimelineChange(`${controller.mode}:${controller.hasPage}:${!!controller.animation}:${tracksOpen}`);
  if (!controller.mode) return null;

  if (!controller.hasPage) {
    return <EmptyBar message="Select a page to show its timeline" onClose={controller.exit} />;
  }

  const animation = controller.animation;
  if (!animation) {
    return (
      <EmptyBar
        message={`${controller.pageName || "This page"} has no timeline yet`}
        onClose={controller.exit}
        action={
          <button
            type="button"
            onClick={controller.enablePageAnimation}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[12px] font-medium"
          >
            <Plus size={13} strokeWidth={2} /> Start timeline
          </button>
        }
      />
    );
  }

  const activeFrame = animation.frames.find((frame) => frame.id === controller.activeFrameId);

  let playingIndex = 0;
  for (let index = 0; index < controller.frameStartTimes.length; index += 1) {
    if (controller.playheadMs >= controller.frameStartTimes[index]) playingIndex = index;
  }

  return (
    <div className="shrink-0 border-t border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial">
      <div className="px-3 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={controller.togglePlay}
          aria-label={controller.playing ? "Pause" : "Play"}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
        >
          {controller.playing ? <Pause size={15} strokeWidth={1.75} /> : <Play size={15} strokeWidth={1.75} />}
        </button>
        <button
          type="button"
          onClick={() => controller.setLoop(!animation.loop)}
          aria-label="Loop"
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
            animation.loop ? "text-[var(--s-text)] bg-[var(--s-bg-input)]" : "text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)]"
          }`}
        >
          <Repeat size={15} strokeWidth={1.75} />
        </button>

        <AnimationScrubber
          totalMs={controller.totalDurationMs}
          playheadMs={controller.playheadMs}
          starts={controller.frameStartTimes}
          onScrub={controller.scrub}
        />

        <span className="text-[12px] text-[var(--s-text-subtle)] tabular-nums shrink-0 w-14 text-right">
          {(controller.playheadMs / 1000).toFixed(2)}s
        </span>

        <button
          type="button"
          onClick={toggleTrackPanel}
          aria-label="Property tracks"
          aria-pressed={tracksOpen}
          title="Property tracks"
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors shrink-0 ${
            tracksOpen ? "text-[var(--s-text)] bg-[var(--s-bg-input)]" : "text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)]"
          }`}
        >
          <ListTree size={15} strokeWidth={1.75} />
        </button>

        <AnimationExportMenu
          onExport={controller.exportAnimation}
          baseWidth={controller.width}
          baseHeight={controller.height}
        />

        <button
          type="button"
          onClick={controller.exit}
          aria-label="Close animation"
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors shrink-0"
        >
          <X size={15} strokeWidth={1.75} />
        </button>
      </div>

      <div className="px-3 pb-2.5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--s-text-subtle)] shrink-0 max-w-[90px] truncate" title={controller.pageName}>
            {controller.pageName}
          </span>
          <div className="w-px h-5 bg-[var(--s-border)] shrink-0" />
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5">
            {animation.frames.map((frame, index) => (
              <FrameChip
                key={frame.id}
                index={index}
                active={
                  controller.playing
                    ? index === playingIndex
                    : frame.id === controller.activeFrameId
                }
                deletable={index > 0}
                frameId={frame.id}
                baseLayers={controller.baseLayers}
                animation={animation}
                pageWidth={controller.width}
                pageHeight={controller.height}
                background={controller.background}
                onSelect={() => controller.selectFrame(frame.id)}
                onDelete={() => controller.deleteFrame(frame.id)}
              />
            ))}
            <button
              type="button"
              onClick={controller.addFrame}
              aria-label="Add frame"
              style={{ animationDelay: staggerDelay(animation.frames.length), animationFillMode: "both" }}
              className="w-14 h-12 rounded-md border-2 border-dashed border-[var(--s-border)] flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:border-[var(--s-border-hover)] transition-colors shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <Plus size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFrame && (
            <div className="flex items-center gap-2 shrink-0">
              <label
                title={controller.activeFrameIndex === 0 ? "Time to glide back to the start when the animation loops" : "Time to move into this frame"}
                className="flex items-center gap-1.5 text-[12px] text-[var(--s-text-subtle)]"
              >
                {controller.activeFrameIndex === 0 ? "Loop back" : "Duration"}
                <NumberCommitInput
                  value={activeFrame.durationMs}
                  min={MIN_FRAME_DURATION_MS}
                  onCommit={(durationMs) =>
                    controller.setFrameTiming(activeFrame.id, { durationMs })
                  }
                  className="w-16 px-1.5 py-1 rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] text-[12px] text-[var(--s-text)] tabular-nums outline-none"
                />
                ms
              </label>
              <EasingButton
                title={controller.activeFrameIndex === 0 ? "Easing back to the start" : "Easing into this frame"}
                value={{ easing: activeFrame.easing, bezier: activeFrame.bezier }}
                onCommit={(value) =>
                  controller.setFrameTiming(activeFrame.id, { easing: value.easing, bezier: value.bezier })
                }
              />
            </div>
          )}

          <div className="flex-1" />

          {controller.activeFrameIndex > 0 && (
            <span className="flex items-center gap-1 text-[12px] text-[var(--s-text-subtle)] shrink-0">
              <Move size={11} strokeWidth={1.75} /> Move elements to pose this frame
            </span>
          )}

          <div className="w-px h-5 bg-[var(--s-border)] shrink-0" />

          <label
            title="Frames per second, higher looks smoother"
            className="flex items-center gap-1.5 text-[12px] text-[var(--s-text-subtle)] shrink-0"
          >
            Frame rate
            <div className="w-16">
              <Dropdown
                options={FPS_DROPDOWN}
                value={String(animation.fps)}
                placement="up"
                onChange={(value) => controller.setFps(Number(value))}
              />
            </div>
          </label>
        </div>
      </div>
      <TrackPanel controller={controller} />
    </div>
  );
};
