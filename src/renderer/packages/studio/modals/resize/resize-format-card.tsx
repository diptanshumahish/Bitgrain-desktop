import React from "react";
import { Check } from "lucide-react";
import type { DesignFormat } from "@bitgrain/studio-core/design-sizes/new-design-formats";
import { previewShapeClass } from "./format-preview-shape";

const CHECK_ICON_SIZE = 13;

interface ResizeFormatCardProps {
  format: DesignFormat;
  isSelected: boolean;
  isCurrent: boolean;
  onToggle: (id: string) => void;
}

const cardStateClass = (isSelected: boolean): string =>
  isSelected
    ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)]"
    : "border-[var(--s-border)] hover:border-[var(--s-border-strong)] hover:bg-[var(--s-bg-input)]";

const shapeStateClass = (isSelected: boolean): string =>
  isSelected ? "border-[var(--s-accent)] bg-[var(--s-accent)]" : "border-[var(--s-text-subtle)] bg-[var(--s-bg-input)]";

export const ResizeFormatCard: React.FC<ResizeFormatCardProps> = ({ format, isSelected, isCurrent, onToggle }) => (
  <button
    type="button"
    aria-pressed={isSelected}
    onClick={() => onToggle(format.id)}
    className={`relative flex flex-col items-start gap-2.5 rounded-lg border p-3 text-left transition-colors ${cardStateClass(isSelected)}`}
  >
    {isSelected && (
      <Check size={CHECK_ICON_SIZE} strokeWidth={2.5} className="absolute right-2.5 top-2.5 text-[var(--s-accent)]" />
    )}
    <span className="flex h-12 w-full items-center justify-center">
      <span className={`${previewShapeClass(format.width, format.height)} rounded-sm border ${shapeStateClass(isSelected)}`} />
    </span>
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[12.5px] font-medium">{format.label}</span>
      <span className="truncate text-[11px] text-[var(--s-text-muted)]">
        {format.width} × {format.height}{isCurrent ? ", current size" : ""}
      </span>
    </span>
  </button>
);
