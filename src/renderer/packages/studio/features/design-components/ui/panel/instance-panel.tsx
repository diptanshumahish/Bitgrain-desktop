import React from "react";
import { Diamond, RotateCcw, Unlink } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { ComponentEntry } from "@bitgrain/studio-core/model/component-types";
import { PanelGroup } from "../../../../ui/panel-group";
import { Dropdown } from "../../../../ui/dropdown";
import { Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { Button } from "@bitgrain/ui/components/Button";
import { emitComponentAction } from "@bitgrain/studio-core/components/events/component-events";
import { componentSetOf, variantLabel } from "@bitgrain/studio-core/components/registry/collect-components";
import { VariantPickers } from "./variant-pickers";

interface InstancePanelProps {
  instance: Layer;
  entries: ComponentEntry[];
}

const swapLabel = (entry: ComponentEntry): string => {
  const variant = variantLabel(entry);
  return variant ? `${entry.setName ?? entry.name}, ${variant}` : entry.name;
};

const overrideCountLabel = (count: number): string => {
  if (count === 0) return "Matches the main component";
  return count === 1 ? "1 layer changed from the main" : `${count} layers changed from the main`;
};

export const InstancePanel: React.FC<InstancePanelProps> = ({ instance, entries }) => {
  const meta = instance.instance;
  if (!meta) return null;
  const current = entries.find((entry) => entry.id === meta.componentId);
  const set = componentSetOf(entries, current?.setId);
  const overrideCount = Object.keys(meta.overrides ?? {}).length;
  return (
    <PanelGroup title="Instance">
      <div className="flex items-center gap-2 min-w-0">
        <Diamond size={13} strokeWidth={1.75} className="shrink-0 text-[var(--s-text-muted)]" />
        <span className="flex-1 min-w-0 truncate text-[12px] font-medium text-[var(--s-text)]">
          {current ? current.setName ?? current.name : "Main component was deleted"}
        </span>
        {current && (
          <Button size="xs" variant="ghost" onClick={() => emitComponentAction({ kind: "go-to-main", componentId: meta.componentId })}>
            Go to main
          </Button>
        )}
      </div>
      {current && set && <VariantPickers instanceId={instance.id} current={current} set={set} />}
      {current && entries.length > 1 && (
        <div className="grid grid-cols-[72px_1fr] items-center gap-2">
          <span className="text-[11px] text-[var(--s-text-subtle)]">Swap with</span>
          <Dropdown
            searchable
            options={entries.map((entry) => ({ label: swapLabel(entry), value: entry.id }))}
            value={meta.componentId}
            onChange={(componentId) => emitComponentAction({ kind: "swap", layerId: instance.id, componentId })}
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[var(--s-text-subtle)]">Scale contents when resized</span>
        <Toggle
          value={meta.resize === "scale"}
          onChange={(scale) => emitComponentAction({ kind: "set-resize", layerId: instance.id, resize: scale ? "scale" : "auto" })}
        />
      </div>
      <span className="text-[11px] text-[var(--s-text-subtle)]">{overrideCountLabel(overrideCount)}</span>
      <div className="grid grid-cols-2 gap-1.5">
        <Button size="xs" disabled={overrideCount === 0} onClick={() => emitComponentAction({ kind: "reset", layerId: instance.id })}>
          <RotateCcw size={12} strokeWidth={1.75} />
          Reset all
        </Button>
        <Button size="xs" onClick={() => emitComponentAction({ kind: "detach", layerId: instance.id })}>
          <Unlink size={12} strokeWidth={1.75} />
          Detach
        </Button>
      </div>
    </PanelGroup>
  );
};
