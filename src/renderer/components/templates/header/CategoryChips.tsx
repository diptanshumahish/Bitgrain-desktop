import React from "react";
import { ALL_CATEGORY, TEMPLATE_CATEGORIES } from "../../../data/templates/categories";
import { FadeRail } from "./FadeRail";

interface CategoryChipsProps {
  active: string;
  onSelect: (key: string) => void;
}

const CHIPS = [
  { key: ALL_CATEGORY, label: "All" },
  ...TEMPLATE_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
  })),
];

const CHIP_BASE = "shrink-0 snap-start rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors";
const CHIP_ACTIVE = "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900";
const CHIP_IDLE =
  "text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

export const CategoryChips: React.FC<CategoryChipsProps> = ({ active, onSelect }) => (
  <FadeRail ariaLabel="Template formats" gapClass="gap-1">
    {CHIPS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        aria-pressed={active === key}
        onClick={() => onSelect(key)}
        className={`${CHIP_BASE} ${active === key ? CHIP_ACTIVE : CHIP_IDLE}`}
      >
        {label}
      </button>
    ))}
  </FadeRail>
);
