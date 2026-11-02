import React from "react";
import { Plus } from "lucide-react";
import type { LayerFill } from "@bitgrain/studio-core/model/layer-paint-types";
import { PanelGroup } from "../../ui/panel-group";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import type { PanelBox } from "../paint/gradient-defaults";
import { moveItem, removeAt, replaceAt, topFirst } from "./paint-list-ops";
import { newFill } from "./paint-defaults";
import { FillItem } from "./FillItem";

interface FillListSectionProps {
  fills: LayerFill[];
  box: PanelBox;
  layerId: string;
  pageImage: string | null;
  onChange: (fills: LayerFill[]) => void;
}

export const FillListSection: React.FC<FillListSectionProps> = ({ fills, box, layerId, pageImage, onChange }) => {
  const addAction = (
    <HeaderIconButton title="Add fill" onClick={() => onChange([...fills, newFill()])}>
      <Plus size={13} strokeWidth={1.75} />
    </HeaderIconButton>
  );

  return (
    <PanelGroup title="Fill" actions={addAction}>
      {topFirst(fills).map(({ item, index }) => (
        <FillItem
          key={item.id}
          fill={item}
          index={index}
          count={fills.length}
          box={box}
          layerId={layerId}
          pageImage={pageImage}
          onChange={(next) => onChange(replaceAt(fills, index, next))}
          onMove={(delta) => onChange(moveItem(fills, index, delta))}
          onRemove={() => onChange(removeAt(fills, index))}
        />
      ))}
    </PanelGroup>
  );
};
