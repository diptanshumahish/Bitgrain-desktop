import React from "react";
import { Plus } from "lucide-react";
import type { LayerStroke } from "@bitgrain/studio-core/model/layer-paint-types";
import type { LineCap, LineJoin } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../ui/panel-group";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { StrokeStyleControls, type StrokeStyleValue } from "../stroke/StrokeStyleControls";
import { moveItem, removeAt, replaceAt, topFirst } from "./paint-list-ops";
import { newStroke } from "./paint-defaults";
import { StrokeItem } from "./StrokeItem";

interface StrokeListSectionProps {
  strokes: LayerStroke[];
  style: StrokeStyleValue;
  closed: boolean;
  defaultCap: LineCap;
  defaultJoin: LineJoin;
  trailing?: React.ReactNode;
  onChange: (strokes: LayerStroke[]) => void;
  onStyleChange: (updates: Partial<StrokeStyleValue>) => void;
}

export const StrokeListSection: React.FC<StrokeListSectionProps> = ({
  strokes, style, closed, defaultCap, defaultJoin, trailing, onChange, onStyleChange,
}) => {
  const addAction = (
    <HeaderIconButton title="Add stroke" onClick={() => onChange([...strokes, newStroke()])}>
      <Plus size={13} strokeWidth={1.75} />
    </HeaderIconButton>
  );

  return (
    <PanelGroup title="Stroke" actions={addAction}>
      {topFirst(strokes).map(({ item, index }) => (
        <StrokeItem
          key={item.id}
          stroke={item}
          index={index}
          count={strokes.length}
          showAlign={closed}
          onChange={(next) => onChange(replaceAt(strokes, index, next))}
          onMove={(delta) => onChange(moveItem(strokes, index, delta))}
          onRemove={() => onChange(removeAt(strokes, index))}
        />
      ))}
      {strokes.length > 0 && (
        <StrokeStyleControls
          value={style}
          defaultCap={defaultCap}
          defaultJoin={defaultJoin}
          showAlign={false}
          trailing={trailing}
          onChange={onStyleChange}
        />
      )}
    </PanelGroup>
  );
};
