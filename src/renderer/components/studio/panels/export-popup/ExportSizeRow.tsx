import React from "react";
import type { WritableSignal } from "../../../../lib/signal";
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
}

interface CustomDimInputProps {
  label: string;
  value: number;
  target: WritableSignal<number>;
  hasDivider: boolean;
}

const CustomDimInput: React.FC<CustomDimInputProps> = ({ label, value, target, hasDivider }) => (
  <div className={`flex-1 flex items-center px-2 h-8 gap-1.5 ${hasDivider ? "border-r border-[var(--s-border)]" : ""}`}>
    <span className="text-[8.5px] text-[var(--s-text-subtle)]">{label}</span>
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(event) => {
        target.value = Math.max(1, parseInt(event.target.value) || 1);
      }}
      className="flex-1 bg-transparent border-none text-[11px] text-[var(--s-text)] outline-none w-0"
    />
    <span className="text-[8.5px] text-[var(--s-text-subtle)]">px</span>
  </div>
);

export const ExportSizeRow: React.FC<ExportSizeRowProps> = (props) => {
  if (props.scaleOpt === "custom") {
    return (
      <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
        <CustomDimInput label="W" value={props.customW} target={customWSignal} hasDivider />
        <CustomDimInput label="H" value={props.customH} target={customHSignal} hasDivider={false} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between border border-[var(--s-border)] px-2.5 py-1 rounded-lg">
      {props.isClamping ? (
        <>
          <span className="text-[10.5px] text-[var(--s-text-muted)] line-through">
            {props.outW} × {props.outH} px
          </span>
          <span className="text-[10.5px] font-medium text-[var(--s-accent)]">
            exporting {props.cappedW} × {props.cappedH} px
          </span>
        </>
      ) : (
        <span className="text-[10.5px] text-[var(--s-text-muted)]">
          {props.outW} × {props.outH} px
        </span>
      )}
    </div>
  );
};
