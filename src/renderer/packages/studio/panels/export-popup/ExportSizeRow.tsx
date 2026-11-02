import React, { useState } from "react";
import { customHSignal, customWSignal } from "../export-state";
import type { ScaleOption } from "../export-state";

interface ExportSizeRowProps {
  scaleOpt: ScaleOption;
  customW: number;
  customH: number;
  outW: number;
  outH: number;
  cappedW: number;
  cappedH: number;
  isClamping: boolean;
  aspectRatio: number;
}

const MAX_CUSTOM_EDGE = 16384;
const DIGITS_ONLY = /\D/g;

interface CustomDimInputProps {
  label: string;
  ariaLabel: string;
  value: number;
  onCommit: (next: number) => void;
  hasDivider: boolean;
}

const CustomDimInput: React.FC<CustomDimInputProps> = ({ label, ariaLabel, value, onCommit, hasDivider }) => {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className={`flex-1 flex items-center px-2 h-8 gap-1.5 ${hasDivider ? "border-r border-[var(--s-border)]" : ""}`}>
      <span className="text-[12px] text-[var(--s-text-subtle)]">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={draft ?? String(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(DIGITS_ONLY, "");
          setDraft(digits);
          const parsed = parseInt(digits, 10);
          if (parsed > 0) onCommit(Math.min(parsed, MAX_CUSTOM_EDGE));
        }}
        onBlur={() => setDraft(null)}
        className="flex-1 bg-transparent border-none text-[12px] text-[var(--s-text)] outline-none w-0"
      />
      <span className="text-[12px] text-[var(--s-text-subtle)]">px</span>
    </div>
  );
};

const commitLockedSize = (width: number, height: number): void => {
  const scale = Math.min(1, MAX_CUSTOM_EDGE / Math.max(width, height));
  customWSignal.value = Math.max(1, Math.round(width * scale));
  customHSignal.value = Math.max(1, Math.round(height * scale));
};

export const ExportSizeRow: React.FC<ExportSizeRowProps> = (props) => {
  if (props.scaleOpt === "custom") {
    return (
      <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
        <CustomDimInput
          label="W"
          ariaLabel="export width in pixels"
          value={props.customW}
          onCommit={(width) => commitLockedSize(width, width / props.aspectRatio)}
          hasDivider
        />
        <CustomDimInput
          label="H"
          ariaLabel="export height in pixels"
          value={props.customH}
          onCommit={(height) => commitLockedSize(height * props.aspectRatio, height)}
          hasDivider={false}
        />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between border border-[var(--s-border)] px-2.5 py-1 rounded-lg">
      {props.isClamping ? (
        <>
          <span className="text-[12px] text-[var(--s-text-muted)] line-through">
            {props.outW} × {props.outH} px
          </span>
          <span className="text-[12px] font-medium text-[var(--s-accent)]">
            exporting {props.cappedW} × {props.cappedH} px
          </span>
        </>
      ) : (
        <span className="text-[12px] text-[var(--s-text-muted)]">
          {props.outW} × {props.outH} px
        </span>
      )}
    </div>
  );
};
