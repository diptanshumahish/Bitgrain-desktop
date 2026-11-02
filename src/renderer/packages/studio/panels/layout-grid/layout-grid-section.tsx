import React from "react";
import { Plus } from "lucide-react";
import { makeLayoutGrid, type LayoutGrid } from "@bitgrain/studio-core/model/layout-grid-types";
import { PanelGroup } from "../../ui/panel-group";
import { SmallBtn } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { LayoutGridRow } from "./layout-grid-row";

interface LayoutGridSectionProps {
  grids: LayoutGrid[] | undefined;
  onChange: (grids: LayoutGrid[]) => void;
}

const ICON_SIZE = 12;

export const LayoutGridSection: React.FC<LayoutGridSectionProps> = ({ grids, onChange }) => {
  const list = grids ?? [];

  const updateGrid = (id: string, patch: Partial<LayoutGrid>): void =>
    onChange(list.map((grid) => (grid.id === id ? { ...grid, ...patch } : grid)));

  const removeGrid = (id: string): void => onChange(list.filter((grid) => grid.id !== id));

  const addGrid = (): void => onChange([...list, makeLayoutGrid("columns")]);

  return (
    <PanelGroup
      title="Layout grid"
      actions={
        <SmallBtn title="Add layout grid" onClick={addGrid}>
          <Plus size={ICON_SIZE} />
        </SmallBtn>
      }
    >
      {list.length > 0 &&
        list.map((grid) => (
          <LayoutGridRow
            key={grid.id}
            grid={grid}
            onChange={(patch) => updateGrid(grid.id, patch)}
            onRemove={() => removeGrid(grid.id)}
          />
        ))}
    </PanelGroup>
  );
};
