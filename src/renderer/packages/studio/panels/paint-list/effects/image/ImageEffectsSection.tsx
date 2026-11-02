import React from "react";
import { hashStringSeed } from "@bitgrain/studio-core/geometry/torn-edge";
import { EffectsPanel } from "../effects-panel";
import { EffectRow } from "../effect-row";
import { ImageEffectBody } from "./image-effect-body";
import type { ImageEffectFields, ImageEffectKind, ImageEffectRow } from "./image-effect-rows";
import { imageEffectOptions, imageEffectRows, isRowVisible, rowKind } from "./image-effect-rows";
import { addImageEffect, moveListEffect, removeImageEffect, switchImageEffect, toggleImageEffect } from "./image-effect-edits";

interface ImageEffectsSectionProps {
  layerId: string;
  fields: ImageEffectFields;
  supportsEdge: boolean;
  onChange: (patch: ImageEffectFields) => void;
}

const SHADOW_HINT = "Add a shadow, a glow or a blur";
const EDGE_HINT = "Add a shadow, a glow, a blur or a torn paper edge";

const rowKey = (row: ImageEffectRow): string => (row.slot === "list" ? `list-${row.index}` : row.slot);

export const ImageEffectsSection: React.FC<ImageEffectsSectionProps> = ({ layerId, fields, supportsEdge, onChange }) => {
  const seed = hashStringSeed(layerId);
  const rows = imageEffectRows(fields);
  const listCount = fields.layerEffects?.length ?? 0;

  return (
    <EffectsPanel isEmpty={rows.length === 0} emptyHint={supportsEdge ? EDGE_HINT : SHADOW_HINT} canAdd onAdd={() => onChange(addImageEffect(fields, seed))}>
      {rows.map((row) => (
        <EffectRow
          key={rowKey(row)}
          kind={rowKind(row, fields)}
          kinds={imageEffectOptions(fields, supportsEdge, row)}
          visible={isRowVisible(row, fields)}
          canMoveUp={row.slot === "list" && row.index < listCount - 1}
          canMoveDown={row.slot === "list" && row.index > 0}
          onKindChange={(next) => onChange(switchImageEffect(row, next as ImageEffectKind, fields, seed))}
          onToggleVisible={() => onChange(toggleImageEffect(row, fields))}
          onMoveUp={() => row.slot === "list" && onChange(moveListEffect(row.index, 1, fields))}
          onMoveDown={() => row.slot === "list" && onChange(moveListEffect(row.index, -1, fields))}
          onRemove={() => onChange(removeImageEffect(row, fields))}
        >
          <ImageEffectBody row={row} fields={fields} onChange={onChange} />
        </EffectRow>
      ))}
    </EffectsPanel>
  );
};
