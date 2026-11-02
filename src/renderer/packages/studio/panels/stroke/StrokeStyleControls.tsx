import React from "react";
import type { DashStyle, LineCap, LineJoin } from "@bitgrain/studio-core/model/studio-types";
import type { StrokeAlign } from "@bitgrain/studio-core/model/paint-types";
import { BtnGroup, ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { DashStyleIcon, LineCapIcon, LineJoinIcon } from "../vector/stroke-icons";
import { CustomDashIcon } from "./custom-dash-icon";
import {
  ALIGN_CHOICES,
  CAP_CHOICES,
  DASH_CHOICES,
  DEFAULT_DASH_RATIO,
  DEFAULT_GAP_RATIO,
  JOIN_CHOICES,
  type DashChoice,
} from "./stroke-options";

const MAX_DASH = 400;
const MIN_DASH_UNIT = 1;

export interface StrokeStyleValue {
  strokeWidth: number;
  strokeAlign?: StrokeAlign;
  lineCap?: LineCap;
  lineJoin?: LineJoin;
  dashStyle?: DashStyle;
  dashPattern?: [number, number];
}

interface StrokeStyleControlsProps {
  value: StrokeStyleValue;
  defaultAlign?: StrokeAlign;
  defaultCap: LineCap;
  defaultJoin: LineJoin;
  showAlign: boolean;
  trailing?: React.ReactNode;
  onChange: (updates: Partial<StrokeStyleValue>) => void;
}

const dashIcon = (choice: DashChoice): React.ReactNode =>
  choice === "custom" ? <CustomDashIcon /> : <DashStyleIcon style={choice} />;

export const StrokeStyleControls: React.FC<StrokeStyleControlsProps> = ({
  value, defaultAlign = "center", defaultCap, defaultJoin, showAlign, trailing, onChange,
}) => {
  const dashChoice: DashChoice = value.dashPattern ? "custom" : value.dashStyle ?? "solid";
  const unit = Math.max(MIN_DASH_UNIT, value.strokeWidth);

  const chooseDash = (choice: DashChoice): void => {
    if (choice === "custom") {
      onChange({ dashPattern: value.dashPattern ?? [unit * DEFAULT_DASH_RATIO, unit * DEFAULT_GAP_RATIO] });
      return;
    }
    onChange({ dashStyle: choice, dashPattern: undefined });
  };

  const pattern = value.dashPattern;

  return (
    <>
      {showAlign && (
        <BtnGroup
          options={ALIGN_CHOICES}
          value={value.strokeAlign ?? defaultAlign}
          onChange={(next) => onChange({ strokeAlign: next as StrokeAlign })}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <BtnGroup
          options={DASH_CHOICES.map(({ value: choice, title }) => ({ value: choice, title, icon: dashIcon(choice) }))}
          value={dashChoice}
          onChange={(next) => chooseDash(next as DashChoice)}
        />
        <BtnGroup
          options={CAP_CHOICES.map(({ value: cap, title }) => ({ value: cap, title, icon: <LineCapIcon cap={cap} /> }))}
          value={value.lineCap ?? defaultCap}
          onChange={(next) => onChange({ lineCap: next as LineCap })}
        />
      </div>
      {pattern && (
        <div className="grid grid-cols-2 gap-2">
          <ScrubField label="Dash" value={pattern[0]} min={MIN_DASH_UNIT} max={MAX_DASH} onChange={(dash) => onChange({ dashPattern: [dash, pattern[1]] })} />
          <ScrubField label="Gap" value={pattern[1]} min={0} max={MAX_DASH} onChange={(gap) => onChange({ dashPattern: [pattern[0], gap] })} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <BtnGroup
          options={JOIN_CHOICES.map(({ value: join, title }) => ({ value: join, title, icon: <LineJoinIcon join={join} /> }))}
          value={value.lineJoin ?? defaultJoin}
          onChange={(next) => onChange({ lineJoin: next as LineJoin })}
        />
        {trailing}
      </div>
    </>
  );
};
