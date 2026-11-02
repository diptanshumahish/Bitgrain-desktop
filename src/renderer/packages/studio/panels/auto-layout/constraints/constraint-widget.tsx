import React from "react";
import type { LayerConstraints } from "@bitgrain/studio-core/model/auto-layout-types";
import { ConstraintBar } from "./constraint-bar";
import { pickHorizontal, pickVertical } from "./constraint-options";

interface ConstraintWidgetProps {
  constraints: LayerConstraints;
  onChange: (constraints: LayerConstraints) => void;
}

export const ConstraintWidget: React.FC<ConstraintWidgetProps> = ({ constraints, onChange }) => {
  const { horizontal, vertical } = constraints;
  const setHorizontal = (side: "left" | "right" | "center", extend: boolean): void =>
    onChange({ ...constraints, horizontal: pickHorizontal(horizontal, side, extend) });
  const setVertical = (side: "top" | "bottom" | "center", extend: boolean): void =>
    onChange({ ...constraints, vertical: pickVertical(vertical, side, extend) });

  return (
    <div className="relative w-[72px] h-[72px] shrink-0 rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)]">
      <div className="absolute inset-[24px] rounded-[3px] border border-[var(--s-text-subtle)] opacity-60" />
      <ConstraintBar
        label="Pin to top"
        orientation="vertical"
        active={vertical === "top" || vertical === "top-bottom"}
        placement="left-1/2 -translate-x-1/2 top-[3px] h-[18px] w-3"
        onPick={(extend) => setVertical("top", extend)}
      />
      <ConstraintBar
        label="Pin to bottom"
        orientation="vertical"
        active={vertical === "bottom" || vertical === "top-bottom"}
        placement="left-1/2 -translate-x-1/2 bottom-[3px] h-[18px] w-3"
        onPick={(extend) => setVertical("bottom", extend)}
      />
      <ConstraintBar
        label="Pin to left"
        orientation="horizontal"
        active={horizontal === "left" || horizontal === "left-right"}
        placement="top-1/2 -translate-y-1/2 left-[3px] w-[18px] h-3"
        onPick={(extend) => setHorizontal("left", extend)}
      />
      <ConstraintBar
        label="Pin to right"
        orientation="horizontal"
        active={horizontal === "right" || horizontal === "left-right"}
        placement="top-1/2 -translate-y-1/2 right-[3px] w-[18px] h-3"
        onPick={(extend) => setHorizontal("right", extend)}
      />
      <ConstraintBar
        label="Keep centered horizontally"
        orientation="vertical"
        active={horizontal === "center"}
        placement="left-1/2 -translate-x-1/2 top-[28px] h-[14px] w-2"
        onPick={(extend) => setHorizontal("center", extend)}
      />
      <ConstraintBar
        label="Keep centered vertically"
        orientation="horizontal"
        active={vertical === "center"}
        placement="top-1/2 -translate-y-1/2 left-[28px] w-[14px] h-2"
        onPick={(extend) => setVertical("center", extend)}
      />
    </div>
  );
};
