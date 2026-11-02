import React from "react";
import { Plus } from "lucide-react";
import { PanelGroup } from "../../../ui/panel-group";
import { HeaderIconButton } from "../../../ui/HeaderIconButton";

interface EffectsPanelProps {
  isEmpty: boolean;
  emptyHint: string;
  canAdd: boolean;
  onAdd: () => void;
  children?: React.ReactNode;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ isEmpty, emptyHint, canAdd, onAdd, children }) => {
  const addAction = canAdd ? (
    <HeaderIconButton title="Add effect" onClick={onAdd}>
      <Plus size={13} strokeWidth={1.75} />
    </HeaderIconButton>
  ) : undefined;

  return (
    <PanelGroup title="Effects" actions={addAction}>
      {isEmpty ? <p className="text-[12px] text-[var(--s-text-subtle)]">{emptyHint}</p> : children}
    </PanelGroup>
  );
};
