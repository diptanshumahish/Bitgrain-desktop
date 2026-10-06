import React from "react";
import { Play, Pause, Plus, X, Repeat, Move } from "lucide-react";
import type { AnimationController } from "../../../pages/studio-page/use-studio-animation";
import type { EasingId } from "../../../data/animation-types";
import { AnimationScrubber } from "./AnimationScrubber";
import { AnimationExportMenu } from "./AnimationExportMenu";
import { Dropdown } from "../ui/dropdown";
import { NumberCommitInput } from "../ui/number-commit-input";
import { FramePreview } from "./FramePreview";
import type { Layer } from "../../../data/studioTypes";

const EASINGS: { id: EasingId; label: string }[] = [
  { id: "linear", label: "Linear" },
  { id: "ease-in", label: "Ease in" },
  { id: "ease-out", label: "Ease out" },
  { id: "ease-in-out", label: "Ease in out" },
  { id: "spring", label: "Spring" },
  { id: "hold", label: "Hold" },
];

const FPS_OPTIONS = [24, 30, 60];

const EASING_DROPDOWN = EASINGS.map((easing) => ({ value: easing.id, label: easing.label }));
const FPS_DROPDOWN = FPS_OPTIONS.map((fps) => ({ value: String(fps), label: String(fps) }));

const STAGGER_MS = 35;

interface FrameChipProps {
  index: number;
  active: boolean;
  deletable: boolean;
  frameId: string;
  baseLayers: Layer[];
  pageWidth: number;
  pageHeight: number;
  background: string;
  onSelect: () => void;
  onDelete: () => void;
}

const FrameChip: React.FC<FrameChipProps> = ({
  index,
  active,
  deletable,
  frameId,
  baseLayers,
  pageWidth,
  pageHeight,
  background,
  onSelect,
  onDelete,
}) => (
  <div
    className="relative group shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
    style={{ animationDelay: `${Math.min(index, 12) * STAGGER_MS}ms`, animationFillMode: "both" }}
  >
    <button
      type="button"
      onClick={onSelect}
      title={index === 0 ? "Base" : `Frame ${index + 1}`}
      className={`w-14 h-12 rounded-md overflow-hidden border-2 transition-colors ${
        active ? "border-[var(--s-accent)]" : "border-[var(--s-border)] hover:border-[var(--s-text-subtle)]"
      }`}
    >
      <FramePreview
        baseLayers={baseLayers}
        frameId={frameId}
        width={pageWidth}
        height={pageHeight}
        background={background}
      />
    </button>
    <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-[var(--s-bg-panel)] text-[8.5px] font-medium text-[var(--s-text)] pointer-events-none">
      {index === 0 ? "Base" : index + 1}
    </span>
    {deletable && (
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete frame"
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--s-bg-panel)] border border-[var(--s-border)] hidden group-hover:flex items-center justify-center text-[var(--s-text-subtle)] hover:text-red-500"
      >
        <X size={10} strokeWidth={2} />
      </button>
    )}
  </div>
);

const EmptyBar: React.FC<{ message: string; action?: React.ReactNode; onClose: () => void }> = ({
  message,
  action,
  onClose,
}) => (
  <div className="relative shrink-0 border-t border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial px-3 h-14 flex items-center justify-center gap-3">
    <span className="text-[11.5px] text-[var(--s-text-muted)]">{message}</span>
    {action}
    <button
      type="button"
      onClick={onClose}
      aria-label="Close animation"
      className="absolute right-3 w-8 h-8 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
    >
      <X size={15} strokeWidth={1.75} />
    </button>
  </div>
);

export const AnimationBar: React.FC<{ controller: AnimationController }> = ({ controller }) => {
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
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[11px] font-medium"
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

        <span className="text-[10.5px] text-[var(--s-text-subtle)] tabular-nums shrink-0 w-14 text-right">
          {(controller.playheadMs / 1000).toFixed(2)}s
        </span>

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
          <span className="text-[10.5px] text-[var(--s-text-subtle)] shrink-0 max-w-[90px] truncate" title={controller.pageName}>
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
              style={{ animationDelay: `${Math.min(animation.frames.length, 12) * STAGGER_MS}ms`, animationFillMode: "both" }}
              className="w-14 h-12 rounded-md border-2 border-dashed border-[var(--s-border)] flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:border-[var(--s-text-subtle)] transition-colors shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <Plus size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFrame && (
            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-1.5 text-[10.5px] text-[var(--s-text-subtle)]">
                {controller.activeFrameIndex === 0 ? "Loop back" : "Duration"}
                <NumberCommitInput
                  value={activeFrame.durationMs}
                  min={50}
                  onCommit={(durationMs) =>
                    controller.setFrameTiming(activeFrame.id, { durationMs })
                  }
                  className="w-16 px-1.5 py-1 rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] text-[11px] text-[var(--s-text)] tabular-nums outline-none"
                />
                ms
              </label>
              <div className="w-28">
                <Dropdown
                  options={EASING_DROPDOWN}
                  value={activeFrame.easing}
                  placement="up"
                  onChange={(value) =>
                    controller.setFrameTiming(activeFrame.id, { easing: value as EasingId })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex-1" />

          {controller.activeFrameIndex > 0 && (
            <span className="flex items-center gap-1 text-[10.5px] text-[var(--s-text-subtle)] shrink-0">
              <Move size={11} strokeWidth={1.75} /> move elements to pose this frame
            </span>
          )}

          <div className="w-px h-5 bg-[var(--s-border)] shrink-0" />

          <label className="flex items-center gap-1.5 text-[10.5px] text-[var(--s-text-subtle)] shrink-0">
            fps
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
    </div>
  );
};
