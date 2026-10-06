import React from "react";
import { MousePointer2 } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import {
  selectedClipIdSignal,
  currentProjectSignal,
} from "../store/project-store";
import { EffectInspector } from "./panels/EffectInspector";
import { TextInspector } from "./panels/TextInspector";
import { AudioInspector } from "./panels/AudioInspector";
import { VideoInspector } from "./panels/VideoInspector";
import { ImageInspector } from "./panels/ImageInspector";
import { TrackingInspector } from "./panels/TrackingInspector";

interface RightPanelProps {
  width: number;
}

const ShortcutRow: React.FC<{ keys: string; label: string }> = ({ keys, label }) => (
  <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--s-text-muted)]">
    <span className="truncate">{label}</span>
    <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--s-bg-input)] text-[10px] [font-variant-numeric:tabular-nums] text-[var(--s-text-subtle)] border border-[var(--s-border)] shrink-0">
      {keys}
    </kbd>
  </div>
);

const EmptyInspector: React.FC = () => (
  <div className="p-5 flex flex-col gap-4 select-none">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[var(--s-bg-input)] flex items-center justify-center text-[var(--s-text-muted)]">
        <MousePointer2 size={13} strokeWidth={1.75} />
      </div>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold text-[var(--s-text)]  ">
          Nothing selected
        </span>
        <span className="text-[10.5px] text-[var(--s-text-subtle)]">
          Click a clip on the timeline to edit it
        </span>
      </div>
    </div>

    <div className="h-px bg-[var(--s-border)]" />

    <div className="flex flex-col gap-2.5">
      <span className="text-[10.5px] font-medium text-[var(--s-text-subtle)]  ">
        Quick keys
      </span>
      <ShortcutRow keys="Space" label="Play / pause" />
      <ShortcutRow keys=", ." label="Step one frame" />
      <ShortcutRow keys="B" label="Split at playhead" />
      <ShortcutRow keys="⌘ D" label="Duplicate" />
      <ShortcutRow keys="⌫" label="Delete selection" />
      <ShortcutRow keys="⌘ Z" label="Undo" />
    </div>
  </div>
);

export const RightPanel: React.FC<RightPanelProps> = ({ width }) => {
  const project = useSignalValue(currentProjectSignal);
  const selectedId = useSignalValue(selectedClipIdSignal);

  if (!project) return null;

  return (
    <aside
      style={{ width }}
      className="bg-[var(--s-bg-panel)] flex flex-col overflow-y-auto shrink-0 border-l border-[var(--s-border)]"
    >
      <div className="flex-1 flex flex-col">
        {selectedId ? (
          <>
            <VideoInspector />
            <EffectInspector />
            <TextInspector />
            <AudioInspector />
            <ImageInspector />
            <TrackingInspector />
          </>
        ) : (
          <EmptyInspector />
        )}
      </div>
    </aside>
  );
};
