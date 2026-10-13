import React from "react";
import { Dropdown } from "../../ui/dropdown";
import type { DropdownOption } from "../../ui/dropdown";
import { ScrubField } from "../../ui/panelPrimitives";
import type { RichStyleProp, StyleField } from "../../rich-text/rich-text-types";
import type { TextPreviewPatch } from "../../fonts/text-preview-signal";

const DEFAULT_WEIGHTS: DropdownOption[] = [
  { label: "300 Light", value: "300" },
  { label: "400 Regular", value: "400" },
  { label: "500 Medium", value: "500" },
  { label: "600 Semibold", value: "600" },
  { label: "700 Bold", value: "700" },
  { label: "800 Extrabold", value: "800" },
  { label: "900 Black", value: "900" },
];

const FONT_LIST_MAX_HEIGHT = 280;
const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 400;
const MIN_LINE_HEIGHT = 0.5;
const MAX_LINE_HEIGHT = 4;
const LINE_HEIGHT_STEP = 0.05;
const MIN_SPACING = -20;
const MAX_SPACING = 100;
const SPACING_STEP = 0.5;

interface TypographySectionProps {
  fontOptions: DropdownOption[];
  weightOptions?: DropdownOption[];
  familyField: StyleField<string>;
  weightField: StyleField<string>;
  sizeField: StyleField<number>;
  spacingField: StyleField<number>;
  lineHeight: number;
  onApply: (prop: RichStyleProp, value: string) => void;
  onPreview: (patch: TextPreviewPatch | null) => void;
  onLineHeight: (lineHeight: number) => void;
}

const fieldNumber = (field: StyleField<number>): number => field.value ?? field.distinct[0] ?? 0;

export const TypographySection: React.FC<TypographySectionProps> = ({
  fontOptions, weightOptions, familyField, weightField, sizeField, spacingField, lineHeight, onApply, onPreview, onLineHeight,
}) => {
  const weights = weightOptions && weightOptions.length > 0 ? weightOptions : DEFAULT_WEIGHTS;

  return (
    <>
      <Dropdown
        options={fontOptions}
        value={familyField.value ?? ""}
        placeholder="Mixed"
        onChange={(value) => onApply("fontFamily", value)}
        onPreview={(value) => onPreview(value ? { fontFamily: value } : null)}
        maxHeight={FONT_LIST_MAX_HEIGHT}
        searchable
      />
      <div className="grid grid-cols-2 gap-2">
        <Dropdown
          options={weights}
          value={weightField.value ?? ""}
          placeholder="Mixed"
          onChange={(value) => onApply("fontWeight", value)}
          onPreview={(value) => onPreview(value ? { fontWeight: value as TextPreviewPatch["fontWeight"] } : null)}
        />
        <ScrubField
          label="Size"
          value={fieldNumber(sizeField)}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          step={1}
          onChange={(value) => onApply("fontSize", String(value))}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ScrubField
          label="Line"
          value={lineHeight}
          min={MIN_LINE_HEIGHT}
          max={MAX_LINE_HEIGHT}
          step={LINE_HEIGHT_STEP}
          decimals={2}
          onChange={onLineHeight}
        />
        <ScrubField
          label="Spacing"
          value={fieldNumber(spacingField)}
          min={MIN_SPACING}
          max={MAX_SPACING}
          step={SPACING_STEP}
          decimals={1}
          onChange={(value) => onApply("letterSpacing", String(value))}
        />
      </div>
    </>
  );
};
