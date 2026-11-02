import React from "react";
import { Plus } from "lucide-react";
import type { ComponentMeta } from "@bitgrain/studio-core/model/component-types";
import { emitComponentAction } from "@bitgrain/studio-core/components/events/component-events";
import { CommitTextInput } from "./commit-text-input";

interface VariantPropertyRowsProps {
  meta: ComponentMeta;
  setName: string;
}

const nextPropertyName = (meta: ComponentMeta): string => `Property ${Object.keys(meta.variant ?? {}).length + 1}`;

export const VariantPropertyRows: React.FC<VariantPropertyRowsProps> = ({ meta, setName }) => {
  const setId = meta.setId;
  if (!setId) return null;
  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--s-text-subtle)]">Variant set name</span>
        <CommitTextInput value={setName} label="Variant set name" onCommit={(name) => emitComponentAction({ kind: "rename-set", setId, name })} />
      </label>
      <span className="text-[11px] text-[var(--s-text-subtle)]">Properties of this variant</span>
      {Object.entries(meta.variant ?? {}).map(([property, value]) => (
        <div key={property} className="grid grid-cols-2 gap-1.5">
          <CommitTextInput
            value={property}
            label="Property name"
            onCommit={(to) => emitComponentAction({ kind: "rename-property", setId, from: property, to })}
          />
          <CommitTextInput
            value={value}
            label={`${property} value`}
            onCommit={(next) => emitComponentAction({ kind: "set-variant-value", componentId: meta.id, property, value: next })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => emitComponentAction({ kind: "add-property", setId, name: nextPropertyName(meta) })}
        className="self-start flex items-center gap-1 text-[11px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
      >
        <Plus size={12} strokeWidth={1.75} />
        Add property
      </button>
    </div>
  );
};
