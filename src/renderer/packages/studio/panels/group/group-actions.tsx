import React from "react";
import { Shrink, Ungroup } from "lucide-react";
import type { GroupLayer } from "@bitgrain/studio-core/model/studio-types";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { fitGroupToChildren } from "./fit-group-to-children";

interface GroupActionsProps {
  layer: GroupLayer;
  onChange: (updates: Partial<GroupLayer>) => void;
  onUngroup?: () => void;
}

export const GroupActions: React.FC<GroupActionsProps> = ({ layer, onChange, onUngroup }) => {
  const fitToContents = (): void => {
    const updates = fitGroupToChildren(layer);
    if (updates) onChange(updates);
  };

  return (
    <>
      <HeaderIconButton title="Fit box to contents" onClick={fitToContents}>
        <Shrink size={12} strokeWidth={1.75} />
      </HeaderIconButton>
      {onUngroup && (
        <HeaderIconButton title="Ungroup" onClick={onUngroup}>
          <Ungroup size={12} strokeWidth={1.75} />
        </HeaderIconButton>
      )}
    </>
  );
};
