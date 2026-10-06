import React from "react";
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Plus,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import type { Track, TrackKind } from "../../types";
import { TRACK_HEADER_WIDTH } from "../../constants";
import {
  addEffectClipToTrack,
  moveTrack,
  removeTrack,
} from "../../utils/timeline-actions";
import { Tooltip } from "../../../../components/studio/ui/Tooltip";
import { ContextMenu } from "./ContextMenu";

interface TrackHeaderProps {
  track: Track;
  index: number;
  total: number;
  onToggleLocked: (id: string) => void;
  onToggleMuted: (id: string) => void;
  onToggleVisible: (id: string) => void;
}

const KIND_GLYPH_CLASS =
  "font-mono text-[9px] leading-none    inline-flex items-center justify-center w-[12px] h-[12px] overflow-hidden select-none";

const KIND_GLYPH: Record<TrackKind, string> = {
  video: "▓▒",
  audio: "∿∷",
  text: "Aa",
  effect: "∷∵",
  image: "▣▦",
  tracking: "⌖+",
};

const KIND_LABEL: Record<TrackKind, string> = {
  video: "video track",
  audio: "audio track",
  text: "text track",
  effect: "effect track",
  image: "image track",
  tracking: "tracking track",
};

const KIND_BG: Record<TrackKind, string> = {
  video: "bg-slate-400/8 dark:bg-violet-300/6 track-noise",
  audio: "bg-slate-400/8 dark:bg-teal-300/6 track-noise",
  text: "bg-slate-400/8 dark:bg-rose-300/6 track-noise",
  effect: "bg-slate-400/8 dark:bg-amber-300/6 track-noise",
  image: "bg-slate-400/8 dark:bg-blue-300/6 track-noise",
  tracking: "bg-slate-400/8 dark:bg-sky-300/6 track-noise",
};

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  index,
  total,
  onToggleLocked,
  onToggleMuted,
  onToggleVisible,
}) => {
  const VisibleIcon = track.visible ? Eye : EyeOff;
  const MuteIcon = track.muted ? VolumeX : Volume2;
  const LockIcon = track.locked ? Lock : Unlock;
  const showVisible =
    track.kind === "video" ||
    track.kind === "text" ||
    track.kind === "effect" ||
    track.kind === "image" ||
    track.kind === "tracking";
  const showMute = track.kind === "video" || track.kind === "audio";
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number } | null>(null);

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const menuOptions: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }[] = [];
  if (canMoveUp) {
    menuOptions.push({
      label: "Move track up",
      icon: <ArrowUp size={14} />,
      onClick: () => moveTrack(track.id, "up"),
    });
  }
  if (canMoveDown) {
    menuOptions.push({
      label: "Move track down",
      icon: <ArrowDown size={14} />,
      onClick: () => moveTrack(track.id, "down"),
    });
  }
  menuOptions.push({
    label: "Delete track",
    icon: <Trash2 size={14} />,
    onClick: () => removeTrack(track.id),
    danger: true,
  });

  return (
    <div
      className={`shrink-0 relative flex flex-col items-start justify-center gap-1 border-b border-r border-[var(--s-border)] p-2 ${KIND_BG[track.kind]}`}
      style={{
        width: TRACK_HEADER_WIDTH,
        height: track.height,
      }}
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-center gap-1">
        <Tooltip
          content={
            track.locked
              ? "Track locked, click to unlock"
              : "Track unlocked, click to lock"
          }
        >
          <button
            onClick={() => onToggleLocked(track.id)}
            className={`w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--s-bg-input)] transition-colors ${
              track.locked
                ? "text-amber-500 dark:text-amber-300"
                : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
            }`}
            aria-label={track.locked ? "Unlock track" : "Lock track"}
          >
            <LockIcon size={11} strokeWidth={2.25} />
          </button>
        </Tooltip>
        {showVisible && (
          <Tooltip
            content={
              track.visible
                ? "Track visible, click to hide"
                : "Track hidden, click to show"
            }
          >
            <button
              onClick={() => onToggleVisible(track.id)}
              className={`w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--s-bg-input)] transition-colors ${
                track.visible ? "text-[var(--s-text)]" : "text-red-400"
              }`}
              aria-label={track.visible ? "Hide track" : "Show track"}
            >
              <VisibleIcon size={11} strokeWidth={2.25} />
            </button>
          </Tooltip>
        )}
        {showMute && (
          <Tooltip
            content={
              track.muted
                ? "Audio muted, click to unmute"
                : "Audio playing, click to mute"
            }
          >
            <button
              onClick={() => onToggleMuted(track.id)}
              className={`w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--s-bg-input)] transition-colors ${
                track.muted ? "text-red-400" : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
              }`}
              aria-label={track.muted ? "Unmute track" : "Mute track"}
            >
              <MuteIcon size={11} strokeWidth={2.25} />
            </button>
          </Tooltip>
        )}
        {track.kind === "effect" && (
          <Tooltip content="Add halftone effect block">
            <button
              onClick={() => addEffectClipToTrack(track.id, "halftone")}
              className="w-5 h-5 rounded flex items-center justify-center text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)] transition-colors"
              aria-label="Add halftone effect"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </Tooltip>
        )}
        <Tooltip content="Track options, move or delete">
          <button
            onClick={openMenu}
            className="w-5 h-5 rounded flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors ml-auto"
            aria-label="Track options"
          >
            <MoreVertical size={11} strokeWidth={2.25} />
          </button>
        </Tooltip>
      </div>
      <Tooltip content={`${KIND_LABEL[track.kind]}, ${track.name}`}>
        <div className="flex items-center gap-1 text-[var(--s-text-subtle)]">
          <span aria-hidden className={KIND_GLYPH_CLASS}>{KIND_GLYPH[track.kind]}</span>
          <span className="text-[10px] font-medium text-[var(--s-text)]">{track.name}</span>
        </div>
      </Tooltip>
      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setMenuPos(null)}
          options={menuOptions}
        />
      )}
    </div>
  );
};
