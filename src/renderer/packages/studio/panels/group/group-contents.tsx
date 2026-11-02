import React from "react";
import { MousePointerSquareDashed } from "lucide-react";
import type { GroupLayer } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../ui/panel-group";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { LayerPickList } from "../../ui/layer-pick-list";
import { emitSelectLayers } from "../../editor/select-layers-event";

interface GroupContentsProps {
  layer: GroupLayer;
}

export const GroupContents: React.FC<GroupContentsProps> = ({ layer }) => {
  const topFirst = [...layer.layers].reverse();
  const selectAll = (
    <>
      <span className="pr-1 text-[12px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums]">{layer.layers.length}</span>
      <HeaderIconButton title="Select every layer inside" onClick={() => emitSelectLayers(layer.layers.map((child) => child.id))}>
      <MousePointerSquareDashed size={12} strokeWidth={1.75} />
      </HeaderIconButton>
    </>
  );

  return (
    <PanelGroup title="Layers" actions={selectAll}>
      <LayerPickList layers={topFirst} onPick={(id) => emitSelectLayers([id])} />
    </PanelGroup>
  );
};
