import React from "react";
import { Component, CopyPlus, Diamond } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { ComponentEntry } from "@bitgrain/studio-core/model/component-types";
import { PanelGroup } from "../../../../ui/panel-group";
import { Button } from "@bitgrain/ui/components/Button";
import { emitComponentAction } from "@bitgrain/studio-core/components/events/component-events";
import { instanceCountLabel } from "@bitgrain/studio-core/components/registry/count-instances";
import { componentSetOf } from "@bitgrain/studio-core/components/registry/collect-components";
import { VariantPropertyRows } from "./variant-property-rows";

interface MainComponentPanelProps {
  layer: Layer;
  entries: ComponentEntry[];
  instanceCount: number;
}

export const MainComponentPanel: React.FC<MainComponentPanelProps> = ({ layer, entries, instanceCount }) => {
  const meta = layer.component;
  if (!meta) return null;
  const set = componentSetOf(entries, meta.setId);
  return (
    <PanelGroup title="Main component">
      <div className="flex items-center gap-2 min-w-0">
        <Component size={13} strokeWidth={1.75} className="shrink-0 text-[var(--s-text-muted)]" />
        <span className="flex-1 min-w-0">
          <span className="block truncate text-[12px] font-medium text-[var(--s-text)]">{layer.name}</span>
          <span className="block text-[10.5px] text-[var(--s-text-subtle)]">{instanceCountLabel(instanceCount)}</span>
        </span>
      </div>
      <p className="text-[11px] leading-snug text-[var(--s-text-subtle)]">
        Changes you make here show up in every instance, on every page.
      </p>
      {set && <VariantPropertyRows meta={meta} setName={set.name} />}
      <div className="grid grid-cols-2 gap-1.5">
        <Button size="xs" onClick={() => emitComponentAction({ kind: "add-variant", layerId: layer.id })}>
          <CopyPlus size={12} strokeWidth={1.75} />
          Add variant
        </Button>
        <Button size="xs" onClick={() => emitComponentAction({ kind: "insert", componentId: meta.id, drop: null })}>
          <Diamond size={12} strokeWidth={1.75} />
          Place instance
        </Button>
      </div>
    </PanelGroup>
  );
};
