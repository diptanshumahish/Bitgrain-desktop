import React from "react";
import { Dropdown } from "../../ui/dropdown";
import type { DropdownOption } from "../../ui/dropdown";
import { ScrubField } from "../../ui/panelPrimitives";
import type { RichStyleProp, StyleField } from "../../rich-text/rich-text-types";

const DEFAULT_WEIGHTS: DropdownOption[] = [
  { label: "300 Light", value: "300" },
  { label: "400 Regular", value: "400" },
  { label: "500 Medium", value: "500" },
  { label: "600 Semibold", value: "600" },
  { label: "700 Bold", value: "700" },
  { label: "800 Extrabold", value: "800" },
  { label: "900 Black", value: "900" },
];

interface TypographySectionProps {
  fontOptions: DropdownOption[];
  weightOptions?: DropdownOption[];
  availableStyles?: { normal: boolean; italic: boolean };
  familyField: StyleField<string>;
  weightField: StyleField<string>;
  sizeField: StyleField<number>;
  italicField: StyleField<boolean>;
  onApply: (prop: RichStyleProp, value: string) => void;
}

export const TypographySection: React.FC<TypographySectionProps> = ({
  fontOptions, weightOptions, availableStyles, familyField, weightField, sizeField, italicField, onApply,
}) => {
  const weights = weightOptions && weightOptions.length > 0 ? weightOptions : DEFAULT_WEIGHTS;
  const sizeValue = sizeField.value ?? sizeField.distinct[0] ?? 0;

  // Built-in fonts (no availableStyles) ship both; custom fonts only expose what they have.
  const canNormal = !availableStyles || availableStyles.normal;
  const canItalic = !availableStyles || availableStyles.italic;
  const showItalic = canNormal && canItalic;
  const isItalic = italicField.value === true;

  return (
    <>
      <Dropdown
        options={fontOptions}
        value={familyField.value ?? ""}
        placeholder="Mixed"
        onChange={(v) => onApply("fontFamily", v)}
        maxHeight={280}
        searchable
      />
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Dropdown
            options={weights}
            value={weightField.value ?? ""}
            placeholder="Mixed"
            onChange={(v) => onApply("fontWeight", v)}
          />
        </div>
        <div className="w-[80px] shrink-0">
          <ScrubField
            label="px"
            value={sizeValue}
            min={4}
            max={400}
            step={1}
            onChange={(v) => onApply("fontSize", String(v))}
          />
        </div>
        {showItalic && (
          <button
            type="button"
            title="Italic"
            onClick={() => onApply("fontStyle", isItalic ? "normal" : "italic")}
            className={`w-8 h-[28px] rounded-md border flex items-center justify-center transition-colors shrink-0 ${
              isItalic
                ? "border-[var(--s-accent)] text-[var(--s-accent)] bg-[var(--s-accent-soft)]"
                : "border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
            }`}
          >
            <span className="text-[12px] italic font-semibold">I</span>
          </button>
        )}
      </div>
    </>
  );
};
