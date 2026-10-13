import React from "react";

const MARK = 9;
const INSET = 8;

const CORNERS = [
  `M${INSET} ${INSET + MARK} V${INSET} H${INSET + MARK}`,
  `M${100 - INSET - MARK} ${INSET} H${100 - INSET} V${INSET + MARK}`,
  `M${100 - INSET} ${100 - INSET - MARK} V${100 - INSET} H${100 - INSET - MARK}`,
  `M${INSET + MARK} ${100 - INSET} H${INSET} V${100 - INSET - MARK}`,
];

const THIRDS = "M33.33 0 V100 M66.66 0 V100 M0 33.33 H100 M0 66.66 H100";

interface ImageFrameMarksProps {
  tone: "light" | "muted";
}

export const ImageFrameMarks: React.FC<ImageFrameMarksProps> = ({ tone }) => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    className={`absolute inset-0 w-full h-full pointer-events-none ${tone === "light" ? "text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.6)]" : "text-[var(--s-text-subtle)]"}`}
    aria-hidden="true"
  >
    <path d={THIRDS} fill="none" className="stroke-current" strokeWidth="0.6" opacity="0.35" vectorEffect="non-scaling-stroke" />
    {CORNERS.map((corner) => (
      <path key={corner} d={corner} fill="none" className="stroke-current" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    ))}
  </svg>
);
