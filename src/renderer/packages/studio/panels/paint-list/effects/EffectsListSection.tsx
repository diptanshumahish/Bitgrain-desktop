import React from "react";
import type { LayerEffect, LayerEffectKind } from "@bitgrain/studio-core/model/layer-paint-types";
import { moveItem, removeAt, replaceAt, topFirst } from "../paint-list-ops";
import { newEffect } from "../paint-defaults";
import { EffectItem } from "./EffectItem";
import { EffectsPanel } from "./effects-panel";
import { EFFECT_KIND_OPTIONS } from "./effect-kind-options";

const EMPTY_HINT = "Add a shadow, a glow or a blur";

interface EffectsListSectionProps {
  effects: LayerEffect[] | undefined;
  excludeKinds?: LayerEffectKind[];
  onChange: (effects: LayerEffect[] | undefined) => void;
}

export const EffectsListSection: React.FC<EffectsListSectionProps> = ({ effects, excludeKinds = [], onChange }) => {
  const list = effects ?? [];
  const kinds = EFFECT_KIND_OPTIONS.filter((option) => !excludeKinds.includes(option.value));
  const commit = (next: LayerEffect[]): void => onChange(next.length > 0 ? next : undefined);

  return (
    <EffectsPanel isEmpty={list.length === 0} emptyHint={EMPTY_HINT} canAdd onAdd={() => commit([...list, newEffect()])}>
      {topFirst(list).map(({ item, index }) => (
        <EffectItem
          key={item.id}
          effect={item}
          index={index}
          count={list.length}
          kinds={kinds}
          onChange={(next) => commit(replaceAt(list, index, next))}
          onMove={(delta) => commit(moveItem(list, index, delta))}
          onRemove={() => commit(removeAt(list, index))}
        />
      ))}
    </EffectsPanel>
  );
};
