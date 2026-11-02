import React from "react";
import { List, ListOrdered } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TextListStyle } from "@bitgrain/studio-core/model/text-layout-types";

interface ListButtonsProps {
  bulletActive: boolean;
  numberActive: boolean;
  onToggle: (style: TextListStyle) => void;
}

interface ListButtonProps {
  Icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

const ICON_SIZE = 14;

const ListButton: React.FC<ListButtonProps> = ({ Icon, label, active, onClick }) => (
  <button
    type="button"
    title={label}
    aria-pressed={active}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`flex-1 h-[28px] rounded-md border-none cursor-pointer flex items-center justify-center gap-1.5 text-[12px] font-medium transition-colors duration-100 ${
      active
        ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
        : "bg-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
    }`}
  >
    <Icon size={ICON_SIZE} strokeWidth={active ? 2.25 : 1.75} />
    {label}
  </button>
);

export const ListButtons: React.FC<ListButtonsProps> = ({ bulletActive, numberActive, onToggle }) => (
  <div className="flex items-center gap-[2px] bg-[var(--s-bg-input)] rounded-lg p-[3px]">
    <ListButton Icon={List} label="Bullets" active={bulletActive} onClick={() => onToggle("bullet")} />
    <ListButton Icon={ListOrdered} label="Numbers" active={numberActive} onClick={() => onToggle("number")} />
  </div>
);
