import React from "react";
import { CROP_ASPECT_OPTIONS } from "./crop-aspect";

interface CropAspectChipsProps {
  activeId: string;
  onSelect: (id: string, ratio: number | null) => void;
}

export const CropAspectChips: React.FC<CropAspectChipsProps> = ({ activeId, onSelect }) => (
  <div role="radiogroup" aria-label="Crop shape" className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
    {CROP_ASPECT_OPTIONS.map((option) => {
      const active = option.id === activeId;
      return (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onSelect(option.id, option.ratio)}
          className={`shrink-0 min-h-[36px] px-3 rounded-lg text-[13px] tabular-nums transition-colors ${
            active ? "bg-white text-black font-semibold" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
