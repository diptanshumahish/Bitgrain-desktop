import React from "react";

interface CanvasBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CompareOverlayProps {
  image: string;
  bounds: CanvasBounds;
  splitPos: number;
}

const LABEL_BOTTOM_OFFSET = 36;

export const CompareOriginal: React.FC<CompareOverlayProps> = ({ image, bounds, splitPos }) => (
  <img
    src={image}
    alt="original"
    crossOrigin="anonymous"
    draggable={false}
    className="absolute object-contain pointer-events-none"
    style={{
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
      clipPath: `inset(0 ${100 - splitPos}% 0 0)`,
    }}
  />
);

interface CompareDividerProps {
  bounds: CanvasBounds;
  splitPos: number;
}

export const CompareDivider: React.FC<CompareDividerProps> = ({ bounds, splitPos }) => {
  const dividerX = bounds.left + (splitPos / 100) * bounds.width;
  return (
    <div
      className="absolute z-20 pointer-events-none -translate-x-1/2"
      style={{ left: dividerX, top: bounds.top, height: bounds.height }}
    >
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-zinc-200 pointer-events-auto cursor-ew-resize">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M4 2L1 6L4 10M8 2L11 6L8 10"
            stroke="#555"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

interface CompareLabelsProps {
  bounds: CanvasBounds;
}

export const CompareLabels: React.FC<CompareLabelsProps> = ({ bounds }) => (
  <div
    className="absolute pointer-events-none z-20 flex items-center"
    style={{
      left: bounds.left,
      top: bounds.top + bounds.height - LABEL_BOTTOM_OFFSET,
      width: bounds.width,
    }}
  >
    <span className="text-[10px] font-semibold text-white/80 bg-black/40 px-2 py-0.5 rounded ml-2 font-editorial">
      original
    </span>
    <span className="text-[10px] font-semibold text-white/80 bg-black/40 px-2 py-0.5 rounded ml-auto mr-2 font-editorial">
      edited
    </span>
  </div>
);
