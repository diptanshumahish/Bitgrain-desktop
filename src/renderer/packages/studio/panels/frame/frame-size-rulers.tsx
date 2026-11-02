import React from "react";

interface FrameSizeRulersProps {
  width: number;
  height: number;
}

const rulerLabelClass =
  "px-1 bg-[var(--s-bg-input)] text-[9.5px] leading-none text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums]";

export const FrameSizeRulers: React.FC<FrameSizeRulersProps> = ({ width, height }) => (
  <>
    <div className="absolute left-0 right-0 -top-3 h-px bg-[var(--s-border-strong)] flex items-center justify-center before:absolute before:left-0 before:-top-[3px] before:h-[7px] before:w-px before:bg-[var(--s-border-strong)] after:absolute after:right-0 after:-top-[3px] after:h-[7px] after:w-px after:bg-[var(--s-border-strong)]">
      <span className={rulerLabelClass}>{Math.round(width)}</span>
    </div>
    <div className="absolute top-0 bottom-0 -left-3 w-px bg-[var(--s-border-strong)] flex items-center justify-center before:absolute before:top-0 before:-left-[3px] before:w-[7px] before:h-px before:bg-[var(--s-border-strong)] after:absolute after:bottom-0 after:-left-[3px] after:w-[7px] after:h-px after:bg-[var(--s-border-strong)]">
      <span className={`${rulerLabelClass} py-1 [writing-mode:vertical-rl] rotate-180`}>{Math.round(height)}</span>
    </div>
  </>
);
