import React from "react";
import type { LayerEffect, LayerEffectKind } from "@bitgrain/studio-core/model/layer-paint-types";
import { switchEffectKind } from "../paint-defaults";
import { EffectRow } from "./effect-row";
import { LayerEffectFields } from "./layer-effect-fields";

interface EffectItemProps {
  effect: LayerEffect;
  index: number;
  count: number;
  kinds: { label: string; value: string }[];
  onChange: (effect: LayerEffect) => void;
  onKindChange?: (kind: string) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

export const EffectItem: React.FC<EffectItemProps> = ({ effect, index, count, kinds, onChange, onKindChange, onMove, onRemove }) => (
  <EffectRow
    kind={effect.kind}
    kinds={kinds}
    visible={effect.visible}
    canMoveUp={index < count - 1}
    canMoveDown={index > 0}
    onKindChange={onKindChange ?? ((kind) => onChange(switchEffectKind(effect, kind as LayerEffectKind)))}
    onToggleVisible={() => onChange({ ...effect, visible: !effect.visible })}
    onMoveUp={() => onMove(1)}
    onMoveDown={() => onMove(-1)}
    onRemove={onRemove}
  >
    <LayerEffectFields effect={effect} onChange={onChange} />
  </EffectRow>
);
