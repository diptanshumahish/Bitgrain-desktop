import React from "react";
import { toPercent } from "./pin-geometry";

export type PinTone = "read" | "unread" | "active" | "resolved";

interface CommentPinProps {
  pinId: string;
  x: number;
  y: number;
  tone: PinTone;
  label: string;
  counterScale: boolean;
  wrapperRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  handlers?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const COUNTER_SCALE_CLASS = "origin-top-left [scale:calc(1/var(--canvas-zoom,1))]";

const TONE_CLASS: Record<PinTone, string> = {
  read: "bg-white",
  unread: "bg-neutral-950 ring-2 ring-white",
  active: "bg-neutral-950 ring-2 ring-white scale-110",
  resolved: "bg-white opacity-60 grayscale",
};

export const CommentPin: React.FC<CommentPinProps> = ({
  pinId, x, y, tone, label, counterScale, wrapperRef, children, handlers,
}) => (
  <div
    ref={wrapperRef}
    className={`absolute w-0 h-0 pointer-events-auto ${counterScale ? COUNTER_SCALE_CLASS : ""}`}
    style={{ left: toPercent(x), top: toPercent(y) }}
  >
    <button
      type="button"
      data-comment-pin={pinId}
      aria-label={label}
      className={`absolute bottom-0 left-0 p-0.5 flex rounded-full rounded-bl-none border-none cursor-pointer origin-bottom-left touch-none ring-1 ring-black/10 transition-[transform,background-color] duration-150 hover:scale-110 ${TONE_CLASS[tone]}`}
      {...handlers}
    >
      {children}
    </button>
  </div>
);
