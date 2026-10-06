import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { ScrubField } from "../ui/panelPrimitives";
import { Dropdown } from "../ui/dropdown";
import { NameField, ApplyButton } from "./kit-row-controls";
import type { NumberToken } from "../../../data/design-kit-types";
import { NUMBER_KINDS, newId } from "../../../data/design-kit-types";
import { addNumber, updateNumber, removeNumber } from "../../../store/design-kits-store";

const KIND_OPTIONS = NUMBER_KINDS.map((kind) => ({ label: kind.label, value: kind.value }));

const NumberRow: React.FC<{
  token: NumberToken;
  canApply: boolean;
  onApply: (token: NumberToken) => void;
}> = ({ token, canApply, onApply }) => {
  const applyable = canApply && token.kind !== "generic";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <NameField value={token.name} onCommit={(name) => updateNumber(token.id, { name })} />
        <ApplyButton
          enabled={applyable}
          title={token.kind === "generic" ? "Set a kind to apply" : "Apply to selection"}
          onClick={() => onApply(token)}
        />
        <button
          onClick={() => removeNumber(token.id)}
          title="Remove"
          className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <Trash2 size={11} strokeWidth={1.75} />
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-[72px]">
          <ScrubField
            label="px"
            value={token.value}
            min={0}
            step={1}
            onChange={(v) => updateNumber(token.id, { value: v })}
          />
        </div>
        <div className="flex-1">
          <Dropdown
            options={KIND_OPTIONS}
            value={token.kind}
            onChange={(v) => updateNumber(token.id, { kind: v as NumberToken["kind"] })}
          />
        </div>
      </div>
    </div>
  );
};

interface KitNumbersSectionProps {
  numbers: NumberToken[];
  canApply: boolean;
  onApply: (token: NumberToken) => void;
}

export const KitNumbersSection: React.FC<KitNumbersSectionProps> = ({
  numbers, canApply, onApply,
}) => (
  <div className="flex flex-col gap-2.5 px-3 py-2.5 border-t border-[var(--s-border)]">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold text-[var(--s-text-muted)]">Numbers</span>
      <button
        onClick={() =>
          addNumber({ id: newId(), name: `Number ${numbers.length + 1}`, value: 16, kind: "generic" })
        }
        title="Add number"
        className="w-5 h-5 rounded-md flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)] transition-colors"
      >
        <Plus size={12} strokeWidth={2} />
      </button>
    </div>
    {numbers.length === 0 ? (
      <p className="text-[10px] text-[var(--s-text-subtle)] py-1">No numbers yet.</p>
    ) : (
      numbers.map((token) => (
        <NumberRow key={token.id} token={token} canApply={canApply} onApply={onApply} />
      ))
    )}
  </div>
);
