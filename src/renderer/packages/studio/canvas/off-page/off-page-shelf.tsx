import React from "react";

type ShelfTone = "parked" | "dragging";

interface OffPageShelfProps {
  width: number;
  height: number;
  tone: ShelfTone;
  children: React.ReactNode;
}

const TONE_CLASS: Record<ShelfTone, string> = {
  parked: "z-[40] opacity-40 grayscale [&>*]:pointer-events-auto",
  dragging: "z-[45]",
};

export const OffPageShelf = ({ width, height, tone, children }: OffPageShelfProps): React.ReactElement => (
  <div
    className={`absolute top-0 left-0 overflow-visible pointer-events-none ${TONE_CLASS[tone]}`}
    style={{ width, height }}
  >
    {children}
  </div>
);
