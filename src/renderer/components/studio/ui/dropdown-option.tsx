import React from "react";
import type { DropdownOption } from "./dropdown";

interface DropdownOptionButtonProps {
  option: DropdownOption;
  index: number;
  selected: boolean;
  active: boolean;
  onSelect: (value: string) => void;
  onHighlight: (index: number) => void;
}

const optionClass = (selected: boolean, active: boolean): string => {
  const tone = selected ? "text-[var(--s-accent)] font-semibold" : "text-[var(--s-text)] font-normal";
  const fill = active ? "bg-[var(--s-bg-input-hover)]" : selected ? "bg-[var(--s-selection)]" : "bg-transparent";
  return `block w-full px-2.5 py-1.5 text-left text-[12.5px] font-inherit cursor-pointer border-none scroll-mt-12 transition-colors duration-100 ${tone} ${fill}`;
};

export const DropdownOptionButton: React.FC<DropdownOptionButtonProps> = ({
  option, index, selected, active, onSelect, onHighlight,
}) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    data-option-index={index}
    tabIndex={-1}
    onClick={() => onSelect(option.value)}
    onMouseEnter={() => onHighlight(index)}
    className={optionClass(selected, active)}
    style={option.style}
  >
    {option.label}
  </button>
);
