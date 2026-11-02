import React from "react";
import { RotateCcwSquare, RotateCwSquare, FlipHorizontal2, FlipVertical2, type LucideIcon } from "lucide-react";
import type { OrientAction } from "./orient-image";

interface OrientOption {
  action: OrientAction;
  label: string;
  Icon: LucideIcon;
}

const ORIENT_OPTIONS: OrientOption[] = [
  { action: "rotate-left", label: "Rotate left", Icon: RotateCcwSquare },
  { action: "rotate-right", label: "Rotate right", Icon: RotateCwSquare },
  { action: "flip-horizontal", label: "Flip horizontally", Icon: FlipHorizontal2 },
  { action: "flip-vertical", label: "Flip vertically", Icon: FlipVertical2 },
];

const ICON_SIZE = 16;

interface CropOrientButtonsProps {
  busy: boolean;
  onOrient: (action: OrientAction) => void;
}

export const CropOrientButtons: React.FC<CropOrientButtonsProps> = ({ busy, onOrient }) => (
  <div role="group" aria-label="Rotate and flip" className="flex items-center gap-1 shrink-0">
    {ORIENT_OPTIONS.map(({ action, label, Icon }) => (
      <button
        key={action}
        type="button"
        aria-label={label}
        title={label}
        disabled={busy}
        onClick={() => onOrient(action)}
        className="shrink-0 w-9 min-h-[36px] flex items-center justify-center rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <Icon size={ICON_SIZE} />
      </button>
    ))}
  </div>
);
