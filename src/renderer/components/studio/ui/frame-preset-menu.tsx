import React from "react";
import { PenLine, Plus } from "lucide-react";
import { FRAME_PRESETS, FRAME_PRESET_GROUPS, type FramePreset } from "../../../utils/frame-presets";

interface FramePresetMenuProps {
  onPick: (preset: FramePreset) => void;
  onDraw: () => void;
  onAddInside?: () => void;
}

export const FramePresetMenu: React.FC<FramePresetMenuProps> = ({
  onPick,
  onDraw,
  onAddInside,
}) => (
  <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl overflow-hidden min-w-[200px] max-h-[360px] overflow-y-auto">
    <button
      onClick={onDraw}
      className="w-full flex items-center gap-2 px-3 py-2.5 border-none outline-none cursor-pointer text-[11px] font-semibold bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
    >
      <PenLine size={13} />
      <span className="flex-1 text-left">Draw page</span>
      <span className="text-[var(--s-text-subtle)] text-[10px]">f</span>
    </button>
    {onAddInside && (
      <button
        onClick={onAddInside}
        className="w-full flex items-center gap-2 px-3 py-2.5 border-none outline-none cursor-pointer text-[11px] font-semibold bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
      >
        <Plus size={13} />
        <span className="flex-1 text-left">Add page inside</span>
      </button>
    )}
    <div className="h-px bg-[var(--s-border)]" />
    {FRAME_PRESET_GROUPS.map((group) => (
      <div key={group}>
        <p className="px-3 pt-2 pb-1 text-[9px] text-[var(--s-text-subtle)]">{group}</p>
        {FRAME_PRESETS.filter((preset) => preset.group === group).map((preset) => (
          <button
            key={preset.id}
            onClick={() => onPick(preset)}
            className="w-full flex items-center gap-2 px-3 py-2 border-none outline-none cursor-pointer text-[11px] bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          >
            <span className="flex-1 text-left">{preset.label}</span>
            <span className="text-[var(--s-text-subtle)] text-[10px]">
              {preset.width} x {preset.height}
            </span>
          </button>
        ))}
      </div>
    ))}
  </div>
);
