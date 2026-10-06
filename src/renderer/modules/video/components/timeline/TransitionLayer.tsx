import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useSignalValue } from "../../../../lib/signal";
import { currentProjectSignal } from "../../store/project-store";
import { timeToPx } from "./timeline-math";
import {
  addTransitionAtCut,
  cutsOnTrack,
  removeTransition,
  setTransitionDuration,
  TRANSITION_KINDS,
  TRANSITION_LABELS,
  MIN_TRANSITION_DURATION,
  type CutCandidate,
} from "../../utils/transition-ops";
import type { ClipTransitionKind, VideoTrack } from "../../types";
import { ContextMenu } from "./ContextMenu";

interface TransitionLayerProps {
  track: VideoTrack;
  pxPerSecond: number;
}

const BADGE_WIDTH = 18;

// Glyphs that read at 18px: the shape of the blend, not an icon set.
const KIND_GLYPH: Record<ClipTransitionKind, string> = {
  "cross-dissolve": "▨",
  "dip-to-black": "◗",
  "dip-to-white": "◖",
  "wipe-left": "◨",
  "wipe-right": "◧",
};

// Everything transition-related that sits on a video track: a "+" badge on every
// cut that can take one, and a draggable block over every cut that has one.
// The block is drawn to scale, so its width is the actual overlap.
export const TransitionLayer: React.FC<TransitionLayerProps> = ({
  track,
  pxPerSecond,
}) => {
  const project = useSignalValue(currentProjectSignal);
  const [menu, setMenu] = useState<{ x: number; y: number; cut: CutCandidate } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dragRef = React.useRef<{
    transitionId: string;
    startX: number;
    initialDuration: number;
  } | null>(null);

  if (!project) return null;
  const cuts = cutsOnTrack(project, track);
  if (cuts.length === 0) return null;

  const openMenu = (e: React.MouseEvent, cut: CutCandidate) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setMenu({ x: e.clientX, y: e.clientY, cut });
  };

  const apply = (cut: CutCandidate, kind: ClipTransitionKind) => {
    const result = addTransitionAtCut(track.id, cut.from.id, cut.to.id, kind);
    if (!result.ok) setError(result.reason ?? "Could not add the transition");
  };

  const onDragMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    // Dragging either edge grows the overlap symmetrically, because the
    // transition is centred on the cut.
    const deltaSec = ((e.clientX - drag.startX) / pxPerSecond) * 2;
    setTransitionDuration(
      track.id,
      drag.transitionId,
      Math.max(MIN_TRANSITION_DURATION, drag.initialDuration + deltaSec),
    );
  };

  const endDrag = (e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // pointer may already be released
    }
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20">
        {cuts.map((cut) => {
          const transition = cut.existing;

          if (!transition) {
            if (cut.maxDuration < MIN_TRANSITION_DURATION) return null;
            return (
              <button
                key={`add-${cut.from.id}`}
                onClick={(e) => openMenu(e, cut)}
                title="Add a transition on this cut"
                className="pointer-events-auto absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--s-border)] bg-[var(--s-bg-panel)] text-[var(--s-text-subtle)] opacity-0 transition-opacity hover:opacity-100 hover:text-[var(--s-text)] focus-visible:opacity-100 group-hover/track:opacity-70"
                style={{ left: timeToPx(cut.at, pxPerSecond) }}
              >
                <Plus size={10} />
              </button>
            );
          }

          const width = Math.max(
            BADGE_WIDTH,
            timeToPx(transition.duration, pxPerSecond),
          );
          const left = timeToPx(cut.at, pxPerSecond) - width / 2;
          return (
            <div
              key={transition.id}
              className="pointer-events-auto absolute top-[6px] bottom-[6px] flex items-center justify-center rounded-md border border-emerald-300/60 bg-emerald-500/35 backdrop-blur-[1px] cursor-ew-resize group/transition"
              style={{ left, width }}
              title={`${TRANSITION_LABELS[transition.kind]} · ${transition.duration.toFixed(2)}s — drag to resize, right-click to change`}
              onContextMenu={(e) => openMenu(e, cut)}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                dragRef.current = {
                  transitionId: transition.id,
                  startX: e.clientX,
                  initialDuration: transition.duration,
                };
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={onDragMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span className="pointer-events-none select-none text-[11px] leading-none text-white/90">
                {KIND_GLYPH[transition.kind]}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTransition(track.id, transition.id);
                }}
                aria-label="Remove transition"
                className="absolute -top-1 -right-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full border border-white/20 bg-zinc-900 text-white/80 group-hover/transition:flex"
              >
                <X size={8} />
              </button>
            </div>
          );
        })}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          options={[
            ...TRANSITION_KINDS.map((kind) => ({
              label: TRANSITION_LABELS[kind],
              icon: (
                <span className="text-[12px] leading-none text-emerald-400">
                  {KIND_GLYPH[kind]}
                </span>
              ),
              onClick: () => apply(menu.cut, kind),
            })),
            ...(menu.cut.existing
              ? [
                  {
                    label: "Remove transition",
                    icon: <X size={14} />,
                    onClick: () =>
                      removeTransition(track.id, menu.cut.existing!.id),
                    danger: true,
                  },
                ]
              : []),
          ]}
        />
      )}

      {error && (
        <div
          className="pointer-events-auto absolute left-1/2 top-1 z-40 -translate-x-1/2 rounded-md border border-amber-400/40 bg-zinc-900 px-2.5 py-1.5 text-[10px] text-amber-200 shadow-lg"
          style={{ maxWidth: 340 }}
          onClick={() => setError(null)}
          role="alert"
        >
          {error}
        </div>
      )}
    </>
  );
};
