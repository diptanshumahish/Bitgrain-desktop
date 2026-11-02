import React from "react";
import { Popover, PopoverSection } from "@bitgrain/ui/controls/toolbar/Popover";
import type { TransformMode } from "@bitgrain/engine/core/types";
import type { RGB } from "@bitgrain/core/color/rgb";
import { trackEvent } from "@bitgrain/platform/tracker";
import { ToggleRow } from "@bitgrain/ui/controls/toolbar/controls/ToggleRow";
import { LabeledSlider } from "@bitgrain/ui/controls/toolbar/controls/LabeledSlider";
import { ColourField } from "@bitgrain/ui/controls/toolbar/controls/ColourField";

interface InkWashPopoverProps {
  mode: TransformMode[];
  onToggle: () => void;
  inkwashDetail: number;
  setInkwashDetail: (v: number) => void;
  inkwashBands: number;
  setInkwashBands: (v: number) => void;
  inkwashBleed: number;
  setInkwashBleed: (v: number) => void;
  inkwashInk: RGB;
  setInkwashInk: (v: RGB) => void;
  inkwashPaper: RGB;
  setInkwashPaper: (v: RGB) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const DIVIDER_CLASS = "h-px bg-[var(--s-border)] mx-3";
const INACTIVE_CLASS = "opacity-40 pointer-events-none";
const PERCENT_SCALE = 100;

export const InkWashPopover: React.FC<InkWashPopoverProps> = ({
  mode,
  onToggle,
  inkwashDetail,
  setInkwashDetail,
  inkwashBands,
  setInkwashBands,
  inkwashBleed,
  setInkwashBleed,
  inkwashInk,
  setInkwashInk,
  inkwashPaper,
  setInkwashPaper,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => {
  const isActive = mode.includes("inkwash");
  const commit = (eventName: string, value: unknown) => (): void => {
    onStateChangeFinished();
    trackEvent("inkwash", eventName, { details: { value } });
  };

  return (
    <Popover onClose={onClose} className="w-64" static={isStatic}>
      <PopoverSection>
        <ToggleRow label="Ink wash" hint="Tonal wash with inked lines" checked={isActive} onChange={onToggle} />
      </PopoverSection>
      <div className={DIVIDER_CLASS} />
      <div className={`flex flex-col transition-opacity ${isActive ? "" : INACTIVE_CLASS}`}>
        <PopoverSection title="Strokes">
          <div className="flex flex-col gap-3 pt-1 pb-1">
            <LabeledSlider label="Line detail" value={inkwashDetail} min={4} max={40} step={1} onChange={setInkwashDetail} onCommit={commit("detail_changed", inkwashDetail)} />
            <LabeledSlider label="Wash tones" value={inkwashBands} min={2} max={10} step={1} onChange={setInkwashBands} onCommit={commit("bands_changed", inkwashBands)} />
            <LabeledSlider label="Bleed" value={inkwashBleed} min={0} max={1} step={0.05} scale={PERCENT_SCALE} suffix="%" onChange={setInkwashBleed} onCommit={commit("bleed_changed", inkwashBleed)} />
          </div>
        </PopoverSection>
        <div className={DIVIDER_CLASS} />
        <PopoverSection title="Colours">
          <div className="grid grid-cols-2 gap-1.5 px-1 pt-1">
            <ColourField label="Ink" value={inkwashInk} onChange={setInkwashInk} onCommit={commit("ink_changed", inkwashInk)} />
            <ColourField label="Paper" value={inkwashPaper} onChange={setInkwashPaper} onCommit={commit("paper_changed", inkwashPaper)} />
          </div>
        </PopoverSection>
      </div>
    </Popover>
  );
};
