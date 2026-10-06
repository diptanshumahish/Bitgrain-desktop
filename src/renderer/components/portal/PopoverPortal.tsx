import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { onPopover, emitPopover } from "../../lib/event-bus";
import type { PopoverEvent } from "../../lib/event-bus";
import { ColorPickerContent } from "../studio/ui/ColorPicker";
import { ImageFillPopover } from "../studio/panels/popovers/ImageFillPopover";
import { clampToViewport, useClickOutsideClose } from "./portal-utils";

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

const computePlacement = (popoverRect: DOMRect, anchor: DOMRect, type: PopoverEvent["type"]): Placement => {
  let left = 0;
  let top = 0;
  let direction: Direction;

  if (type === "tool-dropdown") {
    left = anchor.left + anchor.width / 2 - popoverRect.width / 2;
    top = anchor.top - popoverRect.height - MARGIN;
    direction = "top";
    if (top < MARGIN) {
      top = anchor.bottom + MARGIN;
      direction = "bottom";
    }
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

const PopoverContent: React.FC<PopoverContentProps> = ({ active }) => (
  <>
    {active.type === "color-picker" && (
      <div className="bg-(--s-bg-panel) border border-(--s-border) rounded-xl p-2.5 w-[200px] backdrop-blur-md overflow-hidden">
        <ColorPickerContent
          color={active.color}
          onChange={active.onChange}
          varId={active.varId}
          onBindVariable={active.onBindVariable}
        />
      </div>
    )}
    {active.type === "image-fill" && (
      <ImageFillPopover
        layer={active.layer}
        onChange={active.onChange}
        onUpload={active.onUpload}
        onClose={() => emitPopover(null)}
      />
    )}
    {active.type === "tool-dropdown" && active.content}
  </>
);

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

  React.useLayoutEffect(() => {
    if (!active || placement || !measureRef.current) return;
    const next = computePlacement(
      measureRef.current.getBoundingClientRect(),
      active.anchorRect,
      active.type,
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
        zIndex: 9999,
      }}
      className={`animate-in fade-in zoom-in-95 ${ANIMATION_FROM[placement.direction]} duration-150 ease-out`}
    >
      <PopoverContent active={active} />
    </div>,
    document.body,
  );
};
