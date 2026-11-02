import React from "react";
import { ALL_CATEGORY, TEMPLATE_CATEGORIES } from "../../data/categories";

interface MarineCategoryChipsProps {
  active: string;
  onSelect: (key: string) => void;
}

const CHIPS = [
  { key: ALL_CATEGORY, label: "All" },
  ...TEMPLATE_CATEGORIES.map((category) => ({ key: category.key, label: category.label })),
];

const CHIP_BASE = "shrink-0 snap-start rounded-xl border px-3.5 py-2 font-display text-[14px] font-medium transition-colors";
const CHIP_ACTIVE = "border-ultramarine bg-ultramarine text-white app-dark:border-apricot app-dark:bg-apricot app-dark:text-ultramarine-deep";
const CHIP_IDLE =
  "border-ultramarine/15 bg-white/60 text-ultramarine hover:bg-white app-dark:border-white/10 app-dark:bg-white/5 app-dark:text-apricot app-dark:hover:bg-white/10";

export const MarineCategoryChips: React.FC<MarineCategoryChipsProps> = ({ active, onSelect }) => (
  <div
    role="group"
    aria-label="Template formats"
    className="-mx-6 flex snap-x scroll-px-6 gap-1.5 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
  >
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
  </div>
);
