import React, { useRef } from "react";
import type { BaseClip, Track, VideoProject } from "../../types";
import {
  selectedClipIdsSignal,
  selectClip,
  toggleClipSelection,
  currentProjectSignal,
} from "../../store/project-store";
import {
  currentTimeSignal,
  snapEnabledSignal,
  setSnapIndicator,
} from "../../store/timeline-store";
import {
  collectSnapTargets,
  moveClip,
  moveClips,
  trimClipHead,
  trimClipTail,
} from "../../utils/clip-mutations";
import { snapTimeDetailed, timeToPx } from "./timeline-math";
import type { SnapResult } from "./timeline-math";
import { useSignalValue, setSignal } from "../../../../lib/signal";
import {
  addSpatialKeyframeAtPlayhead,
  clearKeyframesAtPlayhead,
  splitClipAtTime,
  duplicateSelected,
  deleteSelected,
  rippleDeleteSelected
} from "../../utils/edit-ops";
import { detachClipAudio, unlinkClip } from "../../utils/clip-link";
import {
  rippleTrimHead,
  rippleTrimTail,
  rollEdit,
  slideClip,
  slipClip,
} from "../../utils/trim-ops";
import { activeToolSignal, cursorForTool } from "../../store/tool-store";
import { ContextMenu } from "./ContextMenu";
import { Plus, ZapOff, Scissors, Copy, Trash2, ArrowUp, ArrowDown, ChevronsLeft, Unlink, AudioLines } from "lucide-react";
import type { EffectClip } from "../../types";
import { FadeHandle } from "./FadeHandle";
import { moveClipToTrack } from "../../utils/timeline-actions";

const FADES_FOR_KIND: Record<Track["kind"], boolean> = {
  video: true,
  audio: true,
  text: true,
  effect: false,
  image: true,
  tracking: true,
};

interface ClipWithFade {
  fadeIn?: number;
  fadeOut?: number;
}

// Cohesive clip palette: a cool trio (violet / blue / teal) for the visual and
// audio tracks, a warm duo (amber / rose) for effect and text. No double-green.
const KIND_BG: Record<Track["kind"], string> = {
  video: "bg-violet-500 border-violet-300/50",
  image: "bg-blue-500 border-blue-300/50",
  audio: "bg-teal-500 border-teal-300/50",
  effect: "bg-amber-500 border-amber-200/60",
  text: "bg-rose-500 border-rose-300/50",
  tracking: "bg-sky-500 border-sky-300/50",
};

// Light/warm fills (teal, amber) take dark labels; the deeper fills take white.
const KIND_TEXT: Record<Track["kind"], string> = {
  video: "text-white",
  image: "text-white",
  audio: "text-zinc-900",
  effect: "text-zinc-900",
  text: "text-white",
  tracking: "text-white",
};

interface ClipBlockProps {
  clip: BaseClip;
  trackId: string;
  trackKind: Track["kind"];
  pxPerSecond: number;
  label: string;
  locked: boolean;
  decoration?: React.ReactNode;
}

type DragMode = "move" | "trim-head" | "trim-tail" | "slip" | "slide" | "roll";

function findRowAt(x: number, y: number, selfEl: HTMLElement | null): HTMLElement | null {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (selfEl && (el === selfEl || selfEl.contains(el))) continue;
    const row = (el as HTMLElement).closest<HTMLElement>("[data-track-id]");
    if (row) return row;
  }
  return null;
}

function findAdjacentTrackId(
  trackId: string,
  kind: Track["kind"],
  direction: "up" | "down",
): string | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  const idx = project.tracks.findIndex((t) => t.id === trackId);
  if (idx < 0) return null;
  const step = direction === "up" ? -1 : 1;
  for (let i = idx + step; i >= 0 && i < project.tracks.length; i += step) {
    if (project.tracks[i].kind === kind) return project.tracks[i].id;
  }
  return null;
}

export const ClipBlock: React.FC<ClipBlockProps> = ({
  clip,
  trackId,
  trackKind,
  pxPerSecond,
  label,
  locked,
  decoration,
}) => {
  const selectedIds = useSignalValue(selectedClipIdsSignal);
  const tool = useSignalValue(activeToolSignal);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    initialStart: number;
    initialDuration: number;
    project: VideoProject | null;
    group: { id: string; initialStart: number }[] | null;
    trailing: { id: string; initialStart: number }[] | null;
    // Slip and slide are expressed as increments, so the drag remembers how much
    // of the pointer's travel it has already handed to the edit.
    applied: number;
  } | null>(null);
  const [dragY, setDragY] = React.useState(0);
  const [dragInvalid, setDragInvalid] = React.useState(false);

  const left = timeToPx(clip.trackStart, pxPerSecond);
  const width = Math.max(2, timeToPx(clip.duration, pxPerSecond));
  const selected = selectedIds.includes(clip.id);
  const showFades = FADES_FOR_KIND[trackKind];
  const fadeClip = clip as BaseClip & ClipWithFade;
  const fadeIn = Math.max(0, fadeClip.fadeIn ?? 0);
  const fadeOut = Math.max(0, fadeClip.fadeOut ?? 0);

  const beginDrag = (mode: DragMode, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (locked) return;
    if (mode !== "move") selectClip(clip.id);
    const project = currentProjectSignal.value;
    const ids = selectedClipIdsSignal.value;
    let group: { id: string; initialStart: number }[] | null = null;
    if (mode === "move" && project) {
      const memberIds = new Set(ids.includes(clip.id) ? ids : [clip.id]);
      for (const track of project.tracks) {
        for (const candidate of track.clips) {
          if (memberIds.has(candidate.id)) {
            const linked = (candidate as { linkedClipId?: string }).linkedClipId;
            if (linked) memberIds.add(linked);
          }
        }
      }
      if (memberIds.size > 1) {
        group = [];
        for (const track of project.tracks) {
          for (const candidate of track.clips) {
            if (memberIds.has(candidate.id)) {
              group.push({ id: candidate.id, initialStart: candidate.trackStart });
            }
          }
        }
      }
    }
    let trailing: { id: string; initialStart: number }[] | null = null;
    if (mode === "trim-tail" && e.shiftKey && project) {
      const track = project.tracks.find((t) => t.id === trackId);
      if (track) {
        const clipEnd = clip.trackStart + clip.duration;
        trailing = track.clips
          .filter((c) => c.id !== clip.id && c.trackStart >= clipEnd - 1e-6)
          .map((c) => ({ id: c.id, initialStart: c.trackStart }));
      }
    }
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initialStart: clip.trackStart,
      initialDuration: clip.duration,
      project,
      group,
      trailing,
      applied: 0,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    const drag = dragRef.current;
    if (!drag) return;
    const deltaPx = e.clientX - drag.startX;
    const deltaSec = deltaPx / pxPerSecond;
    const project = drag.project;
    const excludeIds = drag.group
      ? new Set(drag.group.map((member) => member.id))
      : new Set([clip.id]);
    const snapTargets = project
      ? [
          ...collectSnapTargets(project, excludeIds),
          currentTimeSignal.value,
        ]
      : [currentTimeSignal.value];
    const applySnap = (value: number): SnapResult =>
      snapEnabledSignal.value
        ? snapTimeDetailed(value, snapTargets, pxPerSecond)
        : { value, snappedToTarget: false };

    if (drag.mode === "move") {
      const candidate = drag.initialStart + deltaSec;
      const candidateEnd = candidate + drag.initialDuration;
      const startSnap = applySnap(candidate);
      const endSnap = applySnap(candidateEnd);
      const useEndSnap =
        Math.abs(endSnap.value - candidateEnd) <
        Math.abs(startSnap.value - candidate);
      const finalStart = useEndSnap
        ? endSnap.value - drag.initialDuration
        : startSnap.value;
      const chosen = useEndSnap ? endSnap : startSnap;
      setSnapIndicator(chosen.snappedToTarget ? chosen.value : null);

      if (drag.group) {
        let delta = finalStart - drag.initialStart;
        const minInitial = Math.min(...drag.group.map((member) => member.initialStart));
        if (minInitial + delta < 0) delta = -minInitial;
        moveClips(
          drag.group.map((member) => ({
            id: member.id,
            start: member.initialStart + delta,
          })),
        );
        setDragY(0);
        return;
      }

      moveClip(clip.id, finalStart);
      const deltaY = e.clientY - drag.startY;
      setDragY(deltaY);
      const row = findRowAt(e.clientX, e.clientY, rootRef.current);
      const hoverKind = row?.dataset.trackKind;
      const hoverId = row?.dataset.trackId;
      setDragInvalid(
        !!row && hoverId !== trackId && hoverKind !== trackKind,
      );
      return;
    }

    // Slip and slide consume the pointer's travel incrementally: each move hands
    // the edit only the part it has not seen yet, so clamping at a media or
    // neighbour limit simply stops the edit instead of fighting the pointer.
    if (drag.mode === "slip" || drag.mode === "slide") {
      const step = deltaSec - drag.applied;
      drag.applied = deltaSec;
      if (Math.abs(step) < 1e-6) return;
      if (drag.mode === "slip") slipClip(clip.id, step);
      else slideClip(clip.id, step);
      return;
    }

    if (drag.mode === "roll") {
      const boundary = applySnap(drag.initialStart + drag.initialDuration + deltaSec);
      setSnapIndicator(boundary.snappedToTarget ? boundary.value : null);
      rollEdit(clip.id, boundary.value);
      return;
    }

    const rippling = activeToolSignal.value === "ripple";

    if (drag.mode === "trim-head") {
      const candidateStart = drag.initialStart + deltaSec;
      const headSnap = applySnap(candidateStart);
      setSnapIndicator(headSnap.snappedToTarget ? headSnap.value : null);
      if (rippling) rippleTrimHead(clip.id, headSnap.value);
      else trimClipHead(clip.id, headSnap.value);
      return;
    }

    const candidateEnd = drag.initialStart + drag.initialDuration + deltaSec;
    const tailSnap = applySnap(candidateEnd);
    setSnapIndicator(tailSnap.snappedToTarget ? tailSnap.value : null);
    if (rippling) {
      rippleTrimTail(clip.id, tailSnap.value);
      return;
    }
    trimClipTail(clip.id, tailSnap.value);
    if (drag.trailing) {
      const originalEnd = drag.initialStart + drag.initialDuration;
      const delta = tailSnap.value - originalEnd;
      moveClips(
        drag.trailing.map((member) => ({
          id: member.id,
          start: member.initialStart + delta,
        })),
      );
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragY(0);
    setDragInvalid(false);
    setSnapIndicator(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore, pointer may already be released
    }
    if (drag.mode !== "move") return;
    if (drag.group) return;
    const row = findRowAt(e.clientX, e.clientY, rootRef.current);
    const targetId = row?.dataset.trackId;
    const targetKind = row?.dataset.trackKind;

    if (!row || !targetId) {
      moveClip(clip.id, drag.initialStart);
      return;
    }
    if (targetId === trackId) return;
    if (targetKind !== trackKind) {
      moveClip(clip.id, drag.initialStart);
      return;
    }
    const project = currentProjectSignal.value;
    const liveStart =
      project?.tracks
        .find((t) => t.id === trackId)
        ?.clips.find((c) => c.id === clip.id)?.trackStart ?? clip.trackStart;
    moveClipToTrack(clip.id, targetId, liveStart);
  };

  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (locked) return;
    if (!selectedIds.includes(clip.id)) selectClip(clip.id);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleKeyframeClick = (e: React.MouseEvent, kTime: number) => {
    e.stopPropagation();
    setSignal(currentTimeSignal, clip.trackStart + kTime);
  };

  const upTrackId = findAdjacentTrackId(trackId, trackKind, "up");
  const downTrackId = findAdjacentTrackId(trackId, trackKind, "down");

  const menuOptions = [
    ...(upTrackId
      ? [
          {
            label: "Move to track above",
            icon: <ArrowUp size={14} />,
            onClick: () => moveClipToTrack(clip.id, upTrackId),
          },
        ]
      : []),
    ...(downTrackId
      ? [
          {
            label: "Move to track below",
            icon: <ArrowDown size={14} />,
            onClick: () => moveClipToTrack(clip.id, downTrackId),
          },
        ]
      : []),
    ...(trackKind === "effect" ? [
      { 
        label: "Add Keyframe", 
        icon: <Plus size={14} className="text-amber-500" />, 
        onClick: addSpatialKeyframeAtPlayhead 
      },
      { 
        label: "Clear Keyframe", 
        icon: <ZapOff size={14} className="text-zinc-500" />, 
        onClick: clearKeyframesAtPlayhead 
      },
      { label: "divider", icon: null, onClick: () => {} },
    ] : []),
    ...((clip as { linkedClipId?: string }).linkedClipId
      ? [
          {
            label: "Unlink audio",
            icon: <Unlink size={14} />,
            onClick: () => unlinkClip(clip.id),
          },
        ]
      : trackKind === "video"
        ? [
            {
              label: "Detach audio",
              icon: <AudioLines size={14} />,
              onClick: () => detachClipAudio(clip.id),
            },
          ]
        : []),
    {
      label: "Split at Playhead",
      icon: <Scissors size={14} />,
      onClick: () => splitClipAtTime(clip.id, currentTimeSignal.value)
    },
    { 
      label: "Duplicate", 
      icon: <Copy size={14} />, 
      onClick: duplicateSelected 
    },
    {
      label: "Ripple delete",
      icon: <ChevronsLeft size={14} />,
      onClick: rippleDeleteSelected,
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      onClick: deleteSelected,
      danger: true
    },
  ].filter(o => o.label !== "divider");

  return (
    <>
      <div
        ref={rootRef}
        className={`absolute top-[6px] bottom-[6px] rounded-lg border ${KIND_BG[trackKind]} ${
          selected ? "ring-2 ring-inset ring-[var(--s-accent)] border-[var(--s-accent)]" : ""
        } ${dragInvalid ? "ring-2 ring-inset ring-red-500 opacity-60" : ""} ${dragY !== 0 ? "z-50" : ""} overflow-hidden ${
          locked ? "cursor-not-allowed opacity-70" : tool === "select" ? "cursor-grab active:cursor-grabbing" : ""
        } select-none group`}
        style={{
          left,
          width,
          transform: dragY !== 0 ? `translateY(${dragY}px)` : undefined,
          cursor: locked ? undefined : cursorForTool(tool) || undefined,
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          if (locked) {
            e.stopPropagation();
            return;
          }
          if (e.shiftKey || e.metaKey || e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            toggleClipSelection(clip.id);
            return;
          }
          if (!selectedClipIdsSignal.value.includes(clip.id)) {
            selectClip(clip.id);
          }
          // The active tool decides what a drag on the clip body means.
          if (tool === "razor") {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            splitClipAtTime(
              clip.id,
              clip.trackStart + (e.clientX - rect.left) / pxPerSecond,
            );
            return;
          }
          if (tool === "slip" || tool === "slide" || tool === "roll") {
            beginDrag(tool, e);
            return;
          }
          beginDrag("move", e);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onContextMenu={handleContextMenu}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-amber-400/0 hover:bg-amber-400/40 z-10"
          onPointerDown={(e) => beginDrag("trim-head", e)}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-amber-400/0 hover:bg-amber-400/40 z-10"
          onPointerDown={(e) => beginDrag("trim-tail", e)}
        />
        
        {/* Keyframe Indicators */}
        {trackKind === "effect" && (clip as EffectClip).keyframes && (
          <div className="absolute inset-0 pointer-events-none">
            {Object.entries((clip as EffectClip).keyframes!).flatMap(([prop, kfs]) => 
              kfs.map((k, i) => (
                <button
                  key={`${prop}-${i}`}
                  onClick={(e) => handleKeyframeClick(e, k.time)}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full border border-zinc-950 hover:scale-125 transition-transform pointer-events-auto z-20 cursor-pointer"
                  style={{
                    left: `${(k.time / clip.duration) * 100}%`,
                  }}
                  title={`Keyframe: ${prop}`}
                />
              ))
            )}
          </div>
        )}

        {decoration}
        <FadeHandle
          clipId={clip.id}
          side="in"
          fadeValue={fadeIn}
          pxPerSecond={pxPerSecond}
          visible={showFades && !locked && (selected || fadeIn > 0)}
        />
        <FadeHandle
          clipId={clip.id}
          side="out"
          fadeValue={fadeOut}
          pxPerSecond={pxPerSecond}
          visible={showFades && !locked && (selected || fadeOut > 0)}
        />
        <div className={`relative h-full flex items-center px-3 text-[11px] font-medium ${KIND_TEXT[trackKind]} truncate pointer-events-none`}>
          {label}
        </div>
      </div>

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setMenuPos(null)}
          options={menuOptions}
        />
      )}
    </>
  );
};
