import React from "react";
import type { DitherMethod } from "../../../../engine/types";
import { DITHER_GROUPS, type DitherMethodInfo } from "./dither-methods";

interface DitherMethodListProps {
  selected: DitherMethod;
  onSelect: (method: DitherMethod) => void;
}

interface DitherMethodButtonProps {
  info: DitherMethodInfo;
  isSelected: boolean;
  onSelect: (method: DitherMethod) => void;
}

const buttonClass = (isSelected: boolean): string =>
  `w-full text-left px-2 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center justify-between ${
    isSelected
      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
      : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
  }`;

const glyphClass = (isSelected: boolean): string =>
  `text-[12px] shrink-0 ml-1 ${isSelected ? "text-[var(--s-accent-text)]" : "text-[var(--s-text-subtle)]"}`;

const DitherMethodButton: React.FC<DitherMethodButtonProps> = ({ info, isSelected, onSelect }) => (
  <button
    type="button"
    title={info.description}
    aria-pressed={isSelected}
    aria-label={`${info.name}. ${info.description}`}
    onClick={() => onSelect(info.id)}
    className={buttonClass(isSelected)}
  >
    <span className="truncate">{info.name}</span>
    <span aria-hidden="true" className={glyphClass(isSelected)}>{info.glyph}</span>
  </button>
);

export const DitherMethodList: React.FC<DitherMethodListProps> = ({ selected, onSelect }) => (
  <>
    {DITHER_GROUPS.map((group) => (
      <div key={group.label}>
        <p className="text-[12px] font-semibold text-[var(--s-text-subtle)] px-2 pt-1">{group.label}</p>
        <p className="text-[12px] text-[var(--s-text-subtle)] px-2 pb-0.5 opacity-80">{group.description}</p>
        {group.methods.map((info) => (
          <DitherMethodButton key={info.id} info={info} isSelected={selected === info.id} onSelect={onSelect} />
        ))}
      </div>
    ))}
  </>
);
