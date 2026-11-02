import React from "react";
import { ColorPicker } from "../../../ui/ColorPicker";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";

const GLOW_MAX = 100;

interface GlowFieldsProps {
  size: number;
  color: string;
  onSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
}

export const GlowFields: React.FC<GlowFieldsProps> = ({ size, color, onSizeChange, onColorChange }) => (
  <>
    <ScrubField label="Size" title="How far the glow reaches" value={size} min={0} max={GLOW_MAX} step={1} onChange={onSizeChange} />
    <ColorPicker color={color} onChange={onColorChange} />
  </>
);
