import React, { useRef } from "react";
import { X } from "lucide-react";
import { emitPopover } from "../../../../lib/event-bus";

interface PaintChipProps {
  label: string;
  color: string | null;
  onChange: (color: string) => void;
  onClear?: () => void;
}

const EMPTY_SWATCH_CLASS =
  "bg-[linear-gradient(135deg,transparent_45%,var(--s-text-subtle)_45%,var(--s-text-subtle)_55%,transparent_55%)]";

export const PaintChip: React.FC<PaintChipProps> = ({ label, color, onChange, onClear }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const openPicker = () => {
    if (!buttonRef.current) return;
    emitPopover({
      type: "color-picker",
      color: color ?? "#ffffff",
      onChange,
      anchorRect: buttonRef.current.getBoundingClientRect(),
    });
  };

  return (
    <div className="group relative flex items-center">
      <button
        ref={buttonRef}
        type="button"
        title={`${label} color`}
        onClick={openPicker}
        className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg border-none cursor-pointer bg-transparent hover:bg-[var(--s-bg-input)] transition-colors"
      >
        <span
          className={`w-5 h-5 rounded-full border border-[var(--s-border)] shrink-0 ${color ? "" : EMPTY_SWATCH_CLASS}`}
          style={color ? { background: color } : undefined}
        />
        <span className="text-[11.5px] text-[var(--s-text)]">{color ? label : `No ${label.toLowerCase()}`}</span>
      </button>
      {color && onClear && (
        <button
          type="button"
          title={`Remove ${label.toLowerCase()}`}
          onClick={onClear}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-none cursor-pointer bg-[var(--s-bg-input)] text-[var(--s-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={9} strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
};
