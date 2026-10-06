import React from "react";
import type { TapeCorners, TapeStrips } from "../../../data/studioTypes";
import { Section, Toggle, SmallBtn, OpacityRow } from "../ui/panelPrimitives";
import { ColorPicker } from "../ui/ColorPicker";
import { defaultTapeStrips } from "../../../utils/tape";

interface TapeControlsProps {
  tape: TapeStrips | undefined;
  onChange: (tape: TapeStrips | undefined) => void;
}

const CORNER_BUTTONS: Array<{ key: keyof TapeCorners; label: string; glyph: string }> = [
  { key: "tl", label: "Top left", glyph: "◰" },
  { key: "tr", label: "Top right", glyph: "◳" },
  { key: "bl", label: "Bottom left", glyph: "◱" },
  { key: "br", label: "Bottom right", glyph: "◲" },
];

export const TapeControls: React.FC<TapeControlsProps> = ({ tape, onChange }) => {
  const handleToggle = (enabled: boolean) => {
    onChange(enabled ? defaultTapeStrips() : undefined);
  };

  const update = (patch: Partial<TapeStrips>) => {
    if (!tape) return;
    onChange({ ...tape, ...patch });
  };

  const toggleCorner = (key: keyof TapeCorners) => {
    if (!tape) return;
    update({ corners: { ...tape.corners, [key]: !tape.corners[key] } });
  };

  return (
    <Section
      title="Tape"
      right={<Toggle value={Boolean(tape)} onChange={handleToggle} />}
    >
      {tape && (
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">Corners</span>
            <div className="flex gap-1">
              {CORNER_BUTTONS.map((corner) => (
                <SmallBtn
                  key={corner.key}
                  title={corner.label}
                  active={tape.corners[corner.key]}
                  onClick={() => toggleCorner(corner.key)}
                >
                  {corner.glyph}
                </SmallBtn>
              ))}
            </div>
          </div>

          <ColorPicker color={tape.color} onChange={(color) => update({ color })} />

          <OpacityRow value={tape.opacity} onChange={(opacity) => update({ opacity })} />
        </div>
      )}
    </Section>
  );
};
