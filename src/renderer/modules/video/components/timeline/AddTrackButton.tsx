import React from "react";
import { Plus } from "lucide-react";
import type { TrackKind } from "../../types";
import { addNewTrack } from "../../utils/timeline-actions";
import { trackEvent } from "../../../../lib/tracker";
import { Tooltip } from "../../../../components/studio/ui/Tooltip";
import { emitPopover } from "../../../../lib/event-bus";

const TRACK_KINDS: { kind: TrackKind; label: string; glyph: string }[] = [
  { kind: "video", label: "Video track", glyph: "▓▒" },
  { kind: "image", label: "Image overlay track", glyph: "▣▦" },
  { kind: "text", label: "Text track", glyph: "Aa" },
  { kind: "effect", label: "Effect track", glyph: "∷∵" },
  { kind: "tracking", label: "Tracking track", glyph: "⌖+" },
  { kind: "audio", label: "Audio track", glyph: "∿∷" },
];

const TrackKindMenu: React.FC<{ onPick: (kind: TrackKind) => void }> = ({ onPick }) => (
  <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-1 flex flex-col min-w-[180px] font-editorial">
    <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold text-[var(--s-text-subtle)]  ">
      Add track
    </div>
    {TRACK_KINDS.map((option) => (
      <button
        key={option.kind}
        type="button"
        onClick={() => onPick(option.kind)}
        className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 text-[11.5px] text-[var(--s-text)] rounded-lg hover:bg-[var(--s-bg-input)] transition-colors"
      >
        <span aria-hidden className="font-mono text-[10px] text-[var(--s-text-subtle)] w-5">
          {option.glyph}
        </span>
        {option.label}
      </button>
    ))}
  </div>
);

export const AddTrackButton: React.FC = () => {
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    emitPopover({
      type: "tool-dropdown",
      anchorRect: rect,
      content: (
        <TrackKindMenu
          onPick={(kind) => {
            addNewTrack(kind);
            trackEvent("video", "track_added", { details: { type: kind } });
            emitPopover(null);
          }}
        />
      ),
    });
  };

  return (
    <Tooltip content="Add a new track">
      <button
        type="button"
        onClick={openMenu}
        className="w-full h-8 flex items-center justify-start gap-2 px-2 text-[10px] text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] border-b border-[var(--s-border)] transition-colors"
      >
        <Plus size={12} strokeWidth={2.25} />
        Add Track
      </button>
    </Tooltip>
  );
};
