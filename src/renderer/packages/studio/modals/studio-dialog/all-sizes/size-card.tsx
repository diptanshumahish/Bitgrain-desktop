import React from "react";
import type { DesignFormat } from "@bitgrain/studio-core/design-sizes/new-design-formats";
import { orientationOf, type Orientation } from "../orientation";

const PREVIEW_SHAPE_CLASS: Record<Orientation, string> = {
  square: "h-10 w-10",
  landscape: "h-7 w-12",
  portrait: "h-11 w-9",
  tall: "h-12 w-7",
};

interface SizeCardProps {
  format: DesignFormat;
  onPick: (format: DesignFormat) => void;
}

export const SizeCard: React.FC<SizeCardProps> = ({ format, onPick }) => {
  const hasSafeZones = (format.safeZones?.length ?? 0) > 0;
  return (
    <button
      type="button"
      onClick={() => onPick(format)}
      className="flex flex-col items-start gap-2.5 rounded-lg border border-[var(--s-border)] p-3 text-left transition-colors hover:border-[var(--s-border-strong)] hover:bg-[var(--s-bg-input)]"
    >
      <span className="flex h-12 w-full items-center justify-center">
        <span
          className={`${PREVIEW_SHAPE_CLASS[orientationOf(format.width, format.height)]} rounded-sm border border-[var(--s-text-subtle)] bg-[var(--s-bg-input)] ${hasSafeZones ? "outline-dashed outline-1 -outline-offset-4 outline-[#ef3b3b]/70" : ""}`}
        />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[12.5px] font-medium">{format.label}</span>
        <span className="truncate text-[11px] text-[var(--s-text-muted)]">{format.detail}</span>
        {hasSafeZones && <span className="text-[11px] text-ultramarine dark:text-[#8f93f4]">Safe area guides</span>}
      </span>
    </button>
  );
};
