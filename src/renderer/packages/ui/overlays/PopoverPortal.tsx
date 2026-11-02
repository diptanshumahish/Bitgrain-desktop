import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { emitPopover, onPopover, type PopoverEvent } from "./popover-events";
import { useEscapeClose } from "./use-escape-close";
import { clampToViewport, useClickOutsideClose } from "./portal-utils";
import { POPOVER_LAYER } from "./layers/layer-order";

type Direction = "top" | "bottom" | "left" | "right";

interface Placement {
  top: number;
  left: number;
  direction: Direction;
}

const ANIMATION_FROM: Record<Direction, string> = {
  top: "slide-in-from-bottom-2",
  bottom: "slide-in-from-top-2",
  left: "slide-in-from-right-2",
  right: "slide-in-from-left-2",
};

const ORIGIN: Record<Direction, string> = {
  top: "bottom center",
  bottom: "top center",
  left: "right center",
  right: "left center",
};

const MARGIN = 12;

const dropdownVertical = (popoverRect: DOMRect, anchor: DOMRect, preferBelow: boolean): { top: number; direction: Direction } => {
  const above = anchor.top - popoverRect.height - MARGIN;
  const below = anchor.bottom + MARGIN;
  const fitsBelow = below + popoverRect.height <= window.innerHeight - MARGIN;
  if (preferBelow && fitsBelow) return { top: below, direction: "bottom" };
  return above < MARGIN ? { top: below, direction: "bottom" } : { top: above, direction: "top" };
};

const computePlacement = (popoverRect: DOMRect, anchor: DOMRect, active: PopoverEvent): Placement => {
  let left = 0;
  let top = 0;
  let direction: Direction;

  if (active.type === "tool-dropdown") {
    left = anchor.left + anchor.width / 2 - popoverRect.width / 2;
    ({ top, direction } = dropdownVertical(popoverRect, anchor, active.preferBelow === true));
  } else {
    left = anchor.left - popoverRect.width - MARGIN;
    top = anchor.top + anchor.height / 2 - popoverRect.height / 2;
    direction = "left";
    if (left < MARGIN) {
      left = anchor.right + MARGIN;
      direction = "right";
    }
  }

  const clamped = clampToViewport(
    { top, left, width: popoverRect.width, height: popoverRect.height },
    MARGIN,
  );
  return { top: clamped.top, left: clamped.left, direction };
};

interface PopoverContentProps {
  active: PopoverEvent;
}

const PopoverContent: React.FC<PopoverContentProps> = ({ active }) => <>{active.content}</>;

const closePopover = (): void => emitPopover(null);

export const PopoverPortal: React.FC = () => {
  const [active, setActive] = useState<PopoverEvent | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onPopover((event) => {
      setActive(event);
      setPlacement(null);
    });
  }, []);

  useClickOutsideClose(!!active, [animatedRef, measureRef], () => emitPopover(null));
  useEscapeClose(!!active, closePopover);

  React.useLayoutEffect(() => {
    if (!active || placement || !measureRef.current) return;
    const next = computePlacement(
      measureRef.current.getBoundingClientRect(),
      active.anchorRect,
      active,
    );
    setPlacement(next);
  }, [active, placement]);

  if (!active) return null;

  if (!placement) {
    return createPortal(
      <div
        ref={measureRef}
        aria-hidden
        data-popover-root
        style={{ position: "fixed", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }}
      >
        <PopoverContent active={active} />
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      key={`${active.type}-${placement.top}-${placement.left}`}
      ref={animatedRef}
      data-popover-root
      style={{
        position: "fixed",
        top: placement.top,
        left: placement.left,
        transformOrigin: ORIGIN[placement.direction],
      }}
      className={`${POPOVER_LAYER} animate-in fade-in zoom-in-95 ${ANIMATION_FROM[placement.direction]} duration-150 ease-out`}
    >
      <PopoverContent active={active} />
    </div>,
    document.body,
  );
};
