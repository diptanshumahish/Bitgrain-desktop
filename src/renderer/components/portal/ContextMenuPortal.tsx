import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  onContextMenu,
  emitContextMenu,
  type ContextMenuAction,
  type ContextMenuEvent,
} from "../../lib/event-bus";
import { useClickOutsideClose, VIEWPORT_MARGIN } from "./portal-utils";

const ICON_SIZE = 13;

const placeAtCursor = (menu: HTMLDivElement, event: ContextMenuEvent): void => {
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const fitsRight = event.x + width <= window.innerWidth - VIEWPORT_MARGIN;
  const fitsBelow = event.y + height <= window.innerHeight - VIEWPORT_MARGIN;
  const fitsAbove = event.y - height >= VIEWPORT_MARGIN;
  const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
  const maxTop = window.innerHeight - height - VIEWPORT_MARGIN;
  const left = fitsRight ? event.x : event.x - width;
  const flippedTop = fitsAbove ? event.y - height : maxTop;
  const top = fitsBelow ? event.y : flippedTop;
  menu.style.left = `${Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft))}px`;
  menu.style.top = `${Math.max(VIEWPORT_MARGIN, Math.min(top, maxTop))}px`;
  menu.style.transformOrigin = `${fitsBelow ? "top" : "bottom"} ${fitsRight ? "left" : "right"}`;
  menu.style.visibility = "visible";
};

const ContextMenuItem: React.FC<{ action: ContextMenuAction }> = ({ action }) => {
  const Icon = action.icon;
  return (
    <>
      {action.dividerBefore && <div role="separator" className="my-1 h-px bg-[var(--s-border)]" />}
      <button
        type="button"
        role="menuitem"
        disabled={action.disabled}
        onClick={() => {
          action.onClick();
          emitContextMenu(null);
        }}
        className={`w-full px-3 py-1.5 text-left text-[12px] border-none bg-transparent hover:bg-[var(--s-bg-input)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 ${
          action.danger ? "text-red-500" : "text-[var(--s-text)]"
        }`}
      >
        <span className="w-4 flex items-center justify-center text-[var(--s-text-subtle)]">
          {Icon && <Icon size={ICON_SIZE} strokeWidth={1.75} />}
        </span>
        <span className="flex-1">{action.label}</span>
        {action.shortcut && <span className="text-[11px] text-[var(--s-text-subtle)]">{action.shortcut}</span>}
      </button>
    </>
  );
};

export const ContextMenuPortal: React.FC = () => {
  const [active, setActive] = useState<ContextMenuEvent | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => onContextMenu(setActive), []);

  useEffect(() => {
    if (!active) return;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") emitContextMenu(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [active]);

  useLayoutEffect(() => {
    if (active && ref.current) placeAtCursor(ref.current, active);
  }, [active]);

  useClickOutsideClose(!!active, [ref], () => emitContextMenu(null));

  if (!active) return null;

  return createPortal(
    <div
      key={`${active.x}-${active.y}`}
      ref={ref}
      role="menu"
      className="fixed invisible z-[9999] py-1 bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl max-h-[calc(100vh-16px)] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ease-out min-w-[200px] max-w-[260px] w-max"
    >
      {active.actions.map((action, index) => (
        <ContextMenuItem key={`${action.label}-${index}`} action={action} />
      ))}
    </div>,
    document.body,
  );
};
