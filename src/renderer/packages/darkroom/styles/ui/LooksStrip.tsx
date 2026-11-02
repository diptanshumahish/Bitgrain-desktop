import React from "react";
import type { StyleLook } from "@bitgrain/engine/styles/engine/style-types";
import { looksFor } from "@bitgrain/engine/styles/looks/style-looks";

interface LooksStripProps {
  styleId: string;
  onApply: (look: StyleLook) => void;
}

const PLAIN_LOOK: StyleLook = { name: "Plain" };
const VISIBLE_LOOKS = 6;
const CHIP_CLASS = "h-7 px-2.5 rounded-md bg-[var(--s-bg-input)] text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors";

interface LookChipsProps {
  looks: readonly StyleLook[];
  onApply: (look: StyleLook) => void;
}

const LookChips: React.FC<LookChipsProps> = ({ looks, onApply }) => (
  <>
    {looks.map((look) => (
      <button key={look.name} type="button" className={CHIP_CLASS} onClick={() => onApply(look)}>
        {look.name}
      </button>
    ))}
  </>
);

export const LooksStrip: React.FC<LooksStripProps> = ({ styleId, onApply }) => {
  const looks = [PLAIN_LOOK, ...looksFor(styleId)];
  if (looks.length === 1) return null;
  const hidden = looks.slice(VISIBLE_LOOKS);
  return (
    <div className="flex flex-col gap-1.5 px-1">
      <p className="text-[12px] font-medium text-[var(--s-text-subtle)]">Looks</p>
      <div className="flex flex-wrap gap-1">
        <LookChips looks={looks.slice(0, VISIBLE_LOOKS)} onApply={onApply} />
      </div>
      {hidden.length > 0 && (
        <details className="group/disclosure">
          <summary className="cursor-pointer list-none text-[12px] font-medium text-[var(--s-text-subtle)] hover:text-[var(--s-text)]">
            {hidden.length} more looks
          </summary>
          <div className="flex flex-wrap gap-1 pt-1">
            <LookChips looks={hidden} onApply={onApply} />
          </div>
        </details>
      )}
    </div>
  );
};
