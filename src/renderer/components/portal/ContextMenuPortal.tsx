import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  onContextMenu,
  emitContextMenu,
  type ContextMenuEvent,
} from "../../lib/event-bus";
import { Tooltip } from "../studio/ui/Tooltip";
import { useClickOutsideClose } from "./portal-utils";

const MARGIN = 8;
const ESTIMATED_ROW_HEIGHT = 36;
const ESTIMATED_WIDTH = 200;

type OriginX = "left" | "right";
type OriginY = "top" | "bottom";

interface Placement {
  top: number;
  left: number;
  originX: OriginX;
  originY: OriginY;
}

const computePlacement = (event: ContextMenuEvent): Placement => {
  const estimatedHeight = event.actions.length * ESTIMATED_ROW_HEIGHT + MARGIN;
  let left = event.x;
  let top = event.y;
  let originX: OriginX = "left";
  let originY: OriginY = "top";

  if (left + ESTIMATED_WIDTH > window.innerWidth - MARGIN) {
    left = Math.max(MARGIN, event.x - ESTIMATED_WIDTH);
    originX = "right";
  }
  if (top + estimatedHeight > window.innerHeight - MARGIN) {
    top = Math.max(MARGIN, event.y - estimatedHeight);
    originY = "bottom";
  }
  return { top, left, originX, originY };
};

export const ContextMenuPortal: React.FC = () => {
  const [active, setActive] = useState<ContextMenuEvent | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => onContextMenu(setActive), []);

  useClickOutsideClose(!!active, [ref], () => emitContextMenu(null));

  if (!active) return null;

  const placement = computePlacement(active);

  return createPortal(
    <div
      key={`${placement.top}-${placement.left}`}
      ref={ref}
      style={{
        position: "fixed",
        top: placement.top,
        left: placement.left,
        transformOrigin: `${placement.originY} ${placement.originX}`,
        zIndex: 9999,
      }}
      className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 ease-out min-w-[180px] max-w-[220px] w-max"
    >
      {active.actions.map((action, index) => (
        <button
          key={index}
          disabled={action.disabled}
          onClick={() => {
            action.onClick();
            emitContextMenu(null);
          }}
          className="w-full px-3 py-1.5 text-left text-[11.5px] font-medium border-none bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5"
        >
          {action.icon && (
            <Tooltip content={action.label} delay={200}>
              <span className="w-4 flex items-center justify-center text-[10px] text-[var(--s-text-subtle)]">
                {action.icon}
              </span>
            </Tooltip>
          )}
          <span className="flex-1">{action.label}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
};
