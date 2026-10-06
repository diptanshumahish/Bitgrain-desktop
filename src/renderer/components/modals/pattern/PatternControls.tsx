import React from "react";
import { Square, Circle, Triangle, Diamond, Hexagon } from "lucide-react";
import type { ShapeType } from "../../../data/studioTypes";
import { ColorPicker } from "../../studio/ui/ColorPicker";
import { Slider } from "../../studio/ui/slider";
import { BtnGroup } from "../../studio/ui/panelPrimitives";
import type { PatternParams } from "../../../utils/pattern-engine";

interface PatternControlsProps {
  params: PatternParams;
  onChange: (next: PatternParams) => void;
}

const SHAPE_ICON_SIZE = 13;

const SHAPE_CHOICES: Array<{ value: ShapeType; icon: React.ReactNode }> = [
  { value: "rect", icon: <Square size={SHAPE_ICON_SIZE} strokeWidth={1.75} /> },
  { value: "circle", icon: <Circle size={SHAPE_ICON_SIZE} strokeWidth={1.75} /> },
  { value: "triangle", icon: <Triangle size={SHAPE_ICON_SIZE} strokeWidth={1.75} /> },
  { value: "diamond", icon: <Diamond size={SHAPE_ICON_SIZE} strokeWidth={1.75} /> },
  { value: "hexagon", icon: <Hexagon size={SHAPE_ICON_SIZE} strokeWidth={1.75} /> },
];

interface ShapePickerProps {
  value: ShapeType;
  onChange: (shape: ShapeType) => void;
}

const ShapePicker: React.FC<ShapePickerProps> = ({ value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">Shape</span>
    <BtnGroup
      options={SHAPE_CHOICES.map((shape) => ({
        value: shape.value,
        icon: shape.icon,
        title: shape.value,
      }))}
      value={value}
      onChange={(v) => onChange(v as ShapeType)}
    />
  </div>
);

export const PatternControls: React.FC<PatternControlsProps> = ({ params, onChange }) => {
  if (params.kind === "checkerboard") {
    const p = params.params;
    return (
      <div className="flex flex-col gap-3">
        <Slider label="Rows" value={p.rows} min={2} max={20} onChange={(v) => onChange({ kind: "checkerboard", params: { ...p, rows: v } })} />
        <Slider label="Columns" value={p.cols} min={2} max={20} onChange={(v) => onChange({ kind: "checkerboard", params: { ...p, cols: v } })} />
        <Slider label="Cell size" value={p.cellSize} min={20} max={160} onChange={(v) => onChange({ kind: "checkerboard", params: { ...p, cellSize: v } })} />
        <ColorPicker label="Color A" color={p.colorA} onChange={(v) => onChange({ kind: "checkerboard", params: { ...p, colorA: v } })} />
        <ColorPicker label="Color B" color={p.colorB} onChange={(v) => onChange({ kind: "checkerboard", params: { ...p, colorB: v } })} />
      </div>
    );
  }

  if (params.kind === "grid") {
    const p = params.params;
    return (
      <div className="flex flex-col gap-3">
        <Slider label="Rows" value={p.rows} min={1} max={20} onChange={(v) => onChange({ kind: "grid", params: { ...p, rows: v } })} />
        <Slider label="Columns" value={p.cols} min={1} max={20} onChange={(v) => onChange({ kind: "grid", params: { ...p, cols: v } })} />
        <Slider label="Cell size" value={p.cellSize} min={10} max={200} onChange={(v) => onChange({ kind: "grid", params: { ...p, cellSize: v } })} />
        <Slider label="Gap" value={p.gap} min={0} max={120} onChange={(v) => onChange({ kind: "grid", params: { ...p, gap: v } })} />
        <ShapePicker value={p.shape} onChange={(v) => onChange({ kind: "grid", params: { ...p, shape: v } })} />
        <ColorPicker label="Color" color={p.color} onChange={(v) => onChange({ kind: "grid", params: { ...p, color: v } })} />
      </div>
    );
  }

  if (params.kind === "stripes") {
    const p = params.params;
    return (
      <div className="flex flex-col gap-3">
        <Slider label="Count" value={p.count} min={2} max={40} onChange={(v) => onChange({ kind: "stripes", params: { ...p, count: v } })} />
        <Slider label="Thickness" value={p.thickness} min={4} max={120} onChange={(v) => onChange({ kind: "stripes", params: { ...p, thickness: v } })} />
        <Slider label="Gap" value={p.gap} min={0} max={120} onChange={(v) => onChange({ kind: "stripes", params: { ...p, gap: v } })} />
        <Slider label="Angle" value={p.angle} min={0} max={180} onChange={(v) => onChange({ kind: "stripes", params: { ...p, angle: v } })} />
        <ColorPicker label="Color A" color={p.colorA} onChange={(v) => onChange({ kind: "stripes", params: { ...p, colorA: v } })} />
        <ColorPicker label="Color B" color={p.colorB} onChange={(v) => onChange({ kind: "stripes", params: { ...p, colorB: v } })} />
      </div>
    );
  }

  if (params.kind === "hex") {
    const p = params.params;
    return (
      <div className="flex flex-col gap-3">
        <Slider label="Rows" value={p.rows} min={1} max={20} onChange={(v) => onChange({ kind: "hex", params: { ...p, rows: v } })} />
        <Slider label="Columns" value={p.cols} min={1} max={20} onChange={(v) => onChange({ kind: "hex", params: { ...p, cols: v } })} />
        <Slider label="Cell size" value={p.cellSize} min={20} max={200} onChange={(v) => onChange({ kind: "hex", params: { ...p, cellSize: v } })} />
        <ColorPicker label="Color" color={p.color} onChange={(v) => onChange({ kind: "hex", params: { ...p, color: v } })} />
      </div>
    );
  }

  if (params.kind === "mandala") {
    const p = params.params;
    return (
      <div className="flex flex-col gap-3">
        <Slider label="Copies" value={p.copies} min={3} max={36} onChange={(v) => onChange({ kind: "mandala", params: { ...p, copies: v } })} />
        <Slider label="Radius" value={p.radius} min={40} max={400} onChange={(v) => onChange({ kind: "mandala", params: { ...p, radius: v } })} />
        <Slider label="Petal width" value={p.petalWidth} min={6} max={160} onChange={(v) => onChange({ kind: "mandala", params: { ...p, petalWidth: v } })} />
        <Slider label="Petal height" value={p.petalHeight} min={6} max={300} onChange={(v) => onChange({ kind: "mandala", params: { ...p, petalHeight: v } })} />
        <ShapePicker value={p.shape} onChange={(v) => onChange({ kind: "mandala", params: { ...p, shape: v } })} />
        <ColorPicker label="Color" color={p.color} onChange={(v) => onChange({ kind: "mandala", params: { ...p, color: v } })} />
      </div>
    );
  }

  const p = params.params;
  return (
    <div className="flex flex-col gap-3">
      <Slider label="Pairs" value={p.copies} min={2} max={24} onChange={(v) => onChange({ kind: "kaleidoscope", params: { ...p, copies: v } })} />
      <Slider label="Radius" value={p.radius} min={40} max={400} onChange={(v) => onChange({ kind: "kaleidoscope", params: { ...p, radius: v } })} />
      <Slider label="Petal width" value={p.petalWidth} min={6} max={160} onChange={(v) => onChange({ kind: "kaleidoscope", params: { ...p, petalWidth: v } })} />
      <Slider label="Petal height" value={p.petalHeight} min={6} max={300} onChange={(v) => onChange({ kind: "kaleidoscope", params: { ...p, petalHeight: v } })} />
      <ShapePicker value={p.shape} onChange={(v) => onChange({ kind: "kaleidoscope", params: { ...p, shape: v } })} />
      <ColorPicker label="Color" color={p.color} onChange={(v) => onChange({ kind: "kaleidoscope", params: { ...p, color: v } })} />
    </div>
  );
};
