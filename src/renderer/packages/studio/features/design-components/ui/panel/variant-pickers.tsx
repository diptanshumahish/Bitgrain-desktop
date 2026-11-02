import React from "react";
import type { ComponentEntry, ComponentSet } from "@bitgrain/studio-core/model/component-types";
import { Dropdown } from "../../../../ui/dropdown";
import { emitComponentAction } from "@bitgrain/studio-core/components/events/component-events";

interface VariantPickersProps {
  instanceId: string;
  current: ComponentEntry;
  set: ComponentSet;
}

export const VariantPickers: React.FC<VariantPickersProps> = ({ instanceId, current, set }) => (
  <div className="flex flex-col gap-1.5">
    {set.properties.map((property) => (
      <div key={property.name} className="grid grid-cols-[72px_1fr] items-center gap-2">
        <span className="truncate text-[11px] text-[var(--s-text-subtle)]">{property.name}</span>
        <Dropdown
          options={property.values.map((value) => ({ label: value, value }))}
          value={current.variant?.[property.name] ?? ""}
          placeholder="Pick one"
          onChange={(value) => emitComponentAction({ kind: "pick-variant", layerId: instanceId, property: property.name, value })}
        />
      </div>
    ))}
  </div>
);
