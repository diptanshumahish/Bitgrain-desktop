import React from "react";
import type { ShapeLayer } from "@bitgrain/studio-core/model/studio-types";
import type { LineEndCap } from "@bitgrain/studio-core/model/paint-types";
import { Dropdown } from "../../ui/dropdown";

const CAP_OPTIONS: { label: string; value: LineEndCap }[] = [
  { label: "None", value: "none" },
  { label: "Arrow", value: "arrow" },
  { label: "Triangle", value: "triangle" },
  { label: "Circle", value: "circle" },
  { label: "Bar", value: "bar" },
];

interface LineCapFieldsProps {
  layer: ShapeLayer;
  onChange: (updates: Partial<ShapeLayer>) => void;
}

const legacyEndCap = (layer: ShapeLayer): LineEndCap => (layer.shapeType === "arrow" ? "arrow" : "none");

export const LineCapFields: React.FC<LineCapFieldsProps> = ({ layer, onChange }) => {
  const startCap = layer.startCap ?? "none";
  const endCap = layer.endCap ?? legacyEndCap(layer);
  const setCaps = (updates: { startCap?: LineEndCap; endCap?: LineEndCap }): void =>
    onChange({ startCap, endCap, ...updates });

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">Start</span>
        <Dropdown options={CAP_OPTIONS} value={startCap} onChange={(value) => setCaps({ startCap: value as LineEndCap })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">End</span>
        <Dropdown options={CAP_OPTIONS} value={endCap} onChange={(value) => setCaps({ endCap: value as LineEndCap })} />
      </div>
    </div>
  );
};
