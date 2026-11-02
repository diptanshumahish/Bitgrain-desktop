import React from "react";
import { Plus } from "lucide-react";
import type { MaskLayer } from "../mask/mask-types";

interface ScopeBarProps {
  masks: MaskLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: () => void;
}

const pillClass = (active: boolean, dimmed = false): string =>
  `h-7 px-3 rounded-full border text-[11.5px] cursor-pointer transition-colors max-w-[140px] truncate ${
    active
      ? "border-[var(--s-accent)] bg-[var(--s-accent)] text-[var(--s-accent-text)]"
      : `border-[var(--s-border)] bg-[var(--s-bg-input)] hover:border-[var(--s-accent)] ${dimmed ? "text-[var(--s-text-subtle)] line-through" : "text-[var(--s-text)]"}`
  }`;

const AddMaskButton: React.FC<{ label: string; onAdd: () => void }> = ({
  label,
  onAdd,
}) => (
  <button
    type="button"
    onClick={onAdd}
    className="h-7 w-fit px-3 rounded-full border border-dashed border-[var(--s-border)] bg-transparent text-[11.5px] text-[var(--s-text-muted)] hover:text-[var(--s-accent)] hover:border-[var(--s-accent)] cursor-pointer flex items-center gap-1"
  >
    <Plus size={11} strokeWidth={2} /> {label}
  </button>
);

export const ScopeBar: React.FC<ScopeBarProps> = ({
  masks,
  selectedId,
  onSelect,
  onAdd,
}) => {
  if (masks.length === 0)
    return <AddMaskButton label="adjust one area only" onAdd={onAdd} />;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] text-[var(--s-text-subtle)]">
        what are you adjusting?
      </span>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={selectedId === null}
          onClick={() => onSelect(null)}
          className={pillClass(selectedId === null)}
        >
          whole photo
        </button>
        {masks.map((mask) => (
          <button
            key={mask.id}
            type="button"
            aria-pressed={selectedId === mask.id}
            onClick={() => onSelect(mask.id)}
            className={pillClass(selectedId === mask.id, !mask.visible)}
          >
            {mask.name}
          </button>
        ))}
        <AddMaskButton label="mask an area" onAdd={onAdd} />
      </div>
    </div>
  );
};
