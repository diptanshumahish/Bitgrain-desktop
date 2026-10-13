import React from "react";
import { Tooltip } from "../../../studio/ui/Tooltip";

interface HalftoneLabelProps {
  text: string;
  tip: string;
}

export const HalftoneLabel: React.FC<HalftoneLabelProps> = ({ text, tip }) => (
  <Tooltip content={tip}>
    <span className="text-[12px] text-[var(--s-text-subtle)] select-none cursor-help border-b border-dotted border-[var(--s-border)]">
      {text}
    </span>
  </Tooltip>
);
