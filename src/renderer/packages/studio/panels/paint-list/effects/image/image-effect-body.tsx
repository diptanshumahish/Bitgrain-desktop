import React from "react";
import { LayerEffectFields } from "../layer-effect-fields";
import { ShadowGlowFields } from "./shadow-glow-fields";
import { EdgeFrameFields } from "./edge-frame-fields";
import type { ImageEffectFields, ImageEffectRow } from "./image-effect-rows";
import { updateListEffect } from "./image-effect-edits";

interface ImageEffectBodyProps {
  row: ImageEffectRow;
  fields: ImageEffectFields;
  onChange: (patch: ImageEffectFields) => void;
}

export const ImageEffectBody: React.FC<ImageEffectBodyProps> = ({ row, fields, onChange }) => {
  if (row.slot === "edge") {
    return fields.tornEdge ? <EdgeFrameFields effect={fields.tornEdge} onChange={(tornEdge) => onChange({ tornEdge })} /> : null;
  }
  if (row.slot === "shadow") {
    return fields.shadow ? <ShadowGlowFields shadow={fields.shadow} onChange={(shadow) => onChange({ shadow })} /> : null;
  }
  const effect = fields.layerEffects?.[row.index];
  if (!effect) return null;
  return <LayerEffectFields effect={effect} onChange={(next) => onChange(updateListEffect(row.index, next, fields))} />;
};
