import React from "react";
import type { TextEffect } from "@bitgrain/studio-core/model/studio-types";
import { moveItem, removeAt, replaceAt } from "../../paint-list-ops";
import { EffectsPanel } from "../effects-panel";
import { EffectRow } from "../effect-row";
import { TextEffectFields } from "./text-effect-fields";
import type { TextEffectType } from "./text-effect-options";
import { TEXT_EFFECT_OPTIONS, defaultTextEffect, switchTextEffect } from "./text-effect-options";

const EMPTY_HINT = "Add a shadow, outline, lift, glow or glitch";

interface TextEffectsSectionProps {
  effects: TextEffect[] | undefined;
  onChange: (effects: TextEffect[] | undefined) => void;
}

export const TextEffectsSection: React.FC<TextEffectsSectionProps> = ({ effects, onChange }) => {
  const list = effects ?? [];
  const commit = (next: TextEffect[]): void => onChange(next.length > 0 ? next : undefined);

  return (
    <EffectsPanel isEmpty={list.length === 0} emptyHint={EMPTY_HINT} canAdd onAdd={() => commit([defaultTextEffect("shadow"), ...list])}>
      {list.map((item, index) => (
        <EffectRow
          key={index}
          kind={item.type}
          kinds={TEXT_EFFECT_OPTIONS}
          visible={!item.hidden}
          canMoveUp={index > 0}
          canMoveDown={index < list.length - 1}
          onKindChange={(type) => commit(replaceAt(list, index, switchTextEffect(item, type as TextEffectType)))}
          onToggleVisible={() => commit(replaceAt(list, index, { ...item, hidden: !item.hidden }))}
          onMoveUp={() => commit(moveItem(list, index, -1))}
          onMoveDown={() => commit(moveItem(list, index, 1))}
          onRemove={() => commit(removeAt(list, index))}
        >
          <TextEffectFields effect={item} onChange={(next) => commit(replaceAt(list, index, next))} />
        </EffectRow>
      ))}
    </EffectsPanel>
  );
};
