import React from "react";
import { X } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { PageAnimation } from "@bitgrain/studio-core/model/animation-types";
import { FramePreview } from "./FramePreview";
import { staggerDelay } from "./stagger-delay";


interface FrameChipProps {
  index: number;
  active: boolean;
  deletable: boolean;
  frameId: string;
  baseLayers: Layer[];
  animation: PageAnimation;
  pageWidth: number;
  pageHeight: number;
  background: string;
  onSelect: () => void;
  onDelete: () => void;
}

export const FrameChip: React.FC<FrameChipProps> = ({
  index,
  active,
  deletable,
  frameId,
  baseLayers,
  animation,
  pageWidth,
  pageHeight,
  background,
  onSelect,
  onDelete,
}) => (
  <div
    className="relative group shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
    style={{ animationDelay: staggerDelay(index), animationFillMode: "both" }}
  >
    <button
      type="button"
      onClick={onSelect}
      title={index === 0 ? "Base" : `Frame ${index + 1}`}
      className={`w-14 h-12 rounded-md overflow-hidden border-2 transition-colors ${
        active ? "border-[var(--s-accent)]" : "border-[var(--s-border)] hover:border-[var(--s-border-hover)]"
      }`}
    >
      <FramePreview
        baseLayers={baseLayers}
        animation={animation}
        frameId={frameId}
        width={pageWidth}
        height={pageHeight}
        background={background}
      />
    </button>
    <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-[var(--s-bg-panel)] text-[8.5px] font-medium text-[var(--s-text)] pointer-events-none">
      {index === 0 ? "Base" : index + 1}
    </span>
    {deletable && (
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete frame"
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--s-bg-panel)] border border-[var(--s-border)] hidden group-hover:flex items-center justify-center text-[var(--s-text-subtle)] hover:text-red-500"
      >
        <X size={10} strokeWidth={2} />
      </button>
    )}
  </div>
);
