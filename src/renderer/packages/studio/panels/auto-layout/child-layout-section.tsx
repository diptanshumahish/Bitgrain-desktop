import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { DEFAULT_CONSTRAINTS } from "@bitgrain/studio-core/model/auto-layout-types";
import { hasAutoLayout, laidOutChildren } from "@bitgrain/studio-core/layout/auto-layout";
import { findLayerParent, type LayerParent } from "@bitgrain/studio-core/layout/engine/find-layer-parent";
import { PanelGroup } from "../../ui/panel-group";
import { Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { ChildSizingFields } from "./child-sizing-fields";
import { ConstraintsSection } from "./constraints/constraints-section";

interface ChildLayoutSectionProps {
  layer: Layer;
  pageLayers: Layer[];
  onChange: (updates: Partial<Layer>) => void;
}

const absoluteUpdates = (layer: Layer, parent: LayerParent, absolute: boolean): Partial<Layer> => {
  if (!absolute || !parent) return { layoutAbsolute: absolute };
  const placed = laidOutChildren(parent).find((child) => child.id === layer.id);
  if (!placed) return { layoutAbsolute: true };
  return { layoutAbsolute: true, x: placed.x, y: placed.y, width: placed.width, height: placed.height };
};

export const ChildLayoutSection: React.FC<ChildLayoutSectionProps> = ({ layer, pageLayers, onChange }) => {
  const match = findLayerParent(pageLayers, layer.id);
  if (!match) return null;
  const parent = match.parent;
  const inAutoLayout = parent !== null && hasAutoLayout(parent);
  const absolute = layer.layoutAbsolute ?? false;
  const showConstraints = parent === null || (parent.type === "frame" && (!inAutoLayout || absolute));

  return (
    <>
      {inAutoLayout && (
        <PanelGroup title="In auto layout">
          {!absolute && <ChildSizingFields layer={layer} onChange={onChange} />}
          <div className="h-7 flex items-center justify-between">
            <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">Ignore auto layout</span>
            <Toggle value={absolute} onChange={(next) => onChange(absoluteUpdates(layer, parent, next))} />
          </div>
        </PanelGroup>
      )}
      {showConstraints && (
        <ConstraintsSection
          constraints={layer.constraints ?? DEFAULT_CONSTRAINTS}
          onChange={(constraints) => onChange({ constraints })}
        />
      )}
    </>
  );
};
