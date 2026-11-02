import React from "react";
import { ColorPicker } from "../../../ui/ColorPicker";
import { openColorPicker } from "../../../ui/color-picker/open-color-picker";
import type { SharedValue } from "./shared-value";

const FALLBACK_COLOR = "#000000";

interface MixedColorFieldProps {
  shared: SharedValue<string>;
  onChange: (color: string) => void;
}

const MixedColorTrigger: React.FC<{ color: string; onChange: (color: string) => void }> = ({
  color,
  onChange,
}) => {
  const openPicker = (event: React.MouseEvent<HTMLButtonElement>): void => {
    openColorPicker({
color,
      onChange,
      anchorRect: event.currentTarget.getBoundingClientRect(),
    });
  };

  return (
    <button
      type="button"
      onClick={openPicker}
      className="flex items-center gap-2 bg-[var(--s-bg-input)] rounded-lg p-1.5 px-2 cursor-pointer transition-all duration-100 hover:bg-[var(--s-bg-input-hover)] text-left"
    >
      <span className="w-5 h-5 rounded-md shrink-0 border border-[var(--s-border)] bg-[conic-gradient(var(--s-text-subtle)_0_25%,transparent_0_50%,var(--s-text-subtle)_0_75%,transparent_0)]" />
      <span className="flex-1 text-[12px] text-[var(--s-text-subtle)]">Mixed</span>
    </button>
  );
};

export const MixedColorField: React.FC<MixedColorFieldProps> = ({ shared, onChange }) =>
  shared.mixed ? (
    <MixedColorTrigger color={shared.first ?? FALLBACK_COLOR} onChange={onChange} />
  ) : (
    <ColorPicker color={shared.value ?? FALLBACK_COLOR} onChange={onChange} />
  );
