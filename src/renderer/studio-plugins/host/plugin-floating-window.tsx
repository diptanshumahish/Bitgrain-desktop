import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GripVertical, X } from "lucide-react";
import { useSignalValue } from "../../lib/signal";
import {
  activePluginSlugSignal,
  pluginsSignal,
  pluginWindowPosSignal,
  setActivePluginSlug,
  setPluginWindowPos,
} from "./plugin-bus";
import { AssetBrowser } from "./asset-browser";
import { PluginIcon } from "./plugin-icon";

const WINDOW_WIDTH = 320;
const WINDOW_HEIGHT = 520;
const VIEWPORT_MARGIN = 8;

export const PluginFloatingWindow: React.FC = () => {
  const plugins = useSignalValue(pluginsSignal);
  const activeSlug = useSignalValue(activePluginSlugSignal);
  const pos = useSignalValue(pluginWindowPosSignal);

  const dragStateRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const active = plugins.find((p) => p.slug === activeSlug) ?? null;

  const clampPos = useCallback((x: number, y: number) => {
    const maxX = window.innerWidth - WINDOW_WIDTH - VIEWPORT_MARGIN;
    const maxY = window.innerHeight - WINDOW_HEIGHT - VIEWPORT_MARGIN;
    return {
      x: Math.max(VIEWPORT_MARGIN, Math.min(x, maxX)),
      y: Math.max(VIEWPORT_MARGIN, Math.min(y, maxY)),
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pos) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    };
    setDragging(true);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    const next = clampPos(e.clientX - state.offsetX, e.clientY - state.offsetY);
    setPluginWindowPos(next);
  }, [clampPos]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId === e.pointerId) {
      dragStateRef.current = null;
      setDragging(false);
    }
  }, []);

  useEffect(() => {
    if (!active || !pos) return;
    const onResize = () => setPluginWindowPos(clampPos(pos.x, pos.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, pos, clampPos]);

  if (!active || !pos) return null;

  return createPortal(
    <div
      role="dialog"
      aria-label={`${active.name} plugin`}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        zIndex: 9000,
      }}
      className="rounded-lg overflow-hidden border border-[var(--s-border)] bg-[var(--s-bg-panel)] flex flex-col"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`flex items-center justify-between gap-2 px-2.5 py-2 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)] select-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-[var(--s-text-muted)] shrink-0" />
          <span className="text-[var(--s-text-muted)] shrink-0">
            <PluginIcon name={active.icon} className="w-3.5 h-3.5" />
          </span>
          <span className="text-[12px] font-medium text-[var(--s-text)] truncate">
            {active.name}
          </span>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setActivePluginSlug(null)}
          aria-label="Close plugin"
          className="w-6 h-6 flex items-center justify-center rounded text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-hover)]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <AssetBrowser plugin={active} />
      </div>
    </div>,
    document.body,
  );
};
