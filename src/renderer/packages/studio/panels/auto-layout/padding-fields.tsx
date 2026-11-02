import React from "react";
import { Link2, Unlink2 } from "lucide-react";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { resolvePadding } from "@bitgrain/studio-core/layout/auto-layout";
import type { LayoutPadding } from "@bitgrain/studio-core/model/auto-layout-types";
import { MAX_LAYOUT_SPACING, PANEL_ICON_SIZE, PANEL_ICON_STROKE, type LayoutSettings, type LayoutSettingsPatch } from "./layout-settings";

interface PaddingFieldsProps {
  settings: LayoutSettings;
  onChange: (updates: LayoutSettingsPatch) => void;
}

const SIDES: { key: keyof LayoutPadding; label: string }[] = [
  { key: "top", label: "T" },
  { key: "right", label: "R" },
  { key: "bottom", label: "B" },
  { key: "left", label: "L" },
];

export const PaddingFields: React.FC<PaddingFieldsProps> = ({ settings, onChange }) => {
  const linked = !settings.paddingSides;
  const sides = resolvePadding(settings);

  const toggleLinked = (): void => {
    if (linked) onChange({ paddingSides: sides });
    else onChange({ padding: sides.top, paddingSides: undefined });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">Padding</span>
        <button
          type="button"
          onClick={toggleLinked}
          title={linked ? "Set each side" : "Use one value"}
          aria-label={linked ? "Set each side" : "Use one value"}
          className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
        >
          {linked ? <Link2 size={PANEL_ICON_SIZE} strokeWidth={PANEL_ICON_STROKE} /> : <Unlink2 size={PANEL_ICON_SIZE} strokeWidth={PANEL_ICON_STROKE} />}
        </button>
      </div>
      {linked ? (
        <ScrubField label="All" value={settings.padding ?? 0} min={0} max={MAX_LAYOUT_SPACING} onChange={(padding) => onChange({ padding })} />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {SIDES.map((side) => (
            <ScrubField
              key={side.key}
              label={side.label}
              value={sides[side.key]}
              min={0}
              max={MAX_LAYOUT_SPACING}
              onChange={(value) => onChange({ paddingSides: { ...sides, [side.key]: value } })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
