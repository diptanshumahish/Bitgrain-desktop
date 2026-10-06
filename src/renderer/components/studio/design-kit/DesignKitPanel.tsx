import React from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Layer } from "../../../data/studioTypes";
import type { TextStyleVariable, NumberToken } from "../../../data/design-kit-types";
import { useSignalValue } from "../../../lib/signal";
import { emitPopover, emitModal } from "../../../lib/event-bus";
import {
  designKitsSignal,
  activeKitIdSignal,
  useActiveKit,
  createKit,
  renameKit,
  deleteKit,
  setActiveKit,
} from "../../../store/design-kits-store";
import { Dropdown } from "../ui/dropdown";
import { SmallBtn } from "../ui/panelPrimitives";
import { styleFromTextLayer } from "./apply-design-kit";
import { KitColorsSection } from "./KitColorsSection";
import { KitTextStylesSection } from "./KitTextStylesSection";
import { KitNumbersSection } from "./KitNumbersSection";

interface DesignKitPanelProps {
  selectedLayer: Layer | null;
  selectedLayerIds: string[];
  onApplyKitColor: (varId: string, hex: string) => void;
  onApplyKitTextStyle: (style: TextStyleVariable) => void;
  onApplyKitNumber: (token: NumberToken) => void;
  onVariableColorChange: (varId: string, hex: string) => void;
}

const prefillColorFor = (layer: Layer | null): string | undefined => {
  if (!layer) return undefined;
  if (layer.type === "text") return layer.color;
  if (layer.type === "shape" || layer.type === "vector") return layer.fill;
  return undefined;
};

export const DesignKitPanel: React.FC<DesignKitPanelProps> = ({
  selectedLayer,
  selectedLayerIds,
  onApplyKitColor,
  onApplyKitTextStyle,
  onApplyKitNumber,
  onVariableColorChange,
}) => {
  const kits = useSignalValue(designKitsSignal);
  const activeId = useSignalValue(activeKitIdSignal);
  const kit = useActiveKit();

  const hasSelection = selectedLayerIds.length > 0;
  const isTextSelected = selectedLayer?.type === "text";
  const captured =
    selectedLayer?.type === "text" ? styleFromTextLayer(selectedLayer) : null;

  const handleNewKit = (): void => {
    emitModal({
      type: "prompt",
      title: "New design kit",
      label: "Kit name",
      defaultValue: "Untitled kit",
      confirmLabel: "Create",
      onSubmit: (name) => createKit(name),
    });
  };

  const openKitMenu = (event: React.MouseEvent): void => {
    if (!kit) return;
    const rect = event.currentTarget.getBoundingClientRect();
    emitPopover({
      type: "tool-dropdown",
      anchorRect: rect,
      content: (
        <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-1 flex flex-col min-w-[160px] font-editorial">
          <button
            onClick={() => {
              emitPopover(null);
              emitModal({
                type: "prompt",
                title: "Rename kit",
                label: "Kit name",
                defaultValue: kit.name,
                confirmLabel: "Rename",
                onSubmit: (name) => renameKit(kit.id, name),
              });
            }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] hover:bg-[var(--s-bg-input)] rounded-lg transition-colors text-[var(--s-text)]"
          >
            <Pencil size={13} strokeWidth={1.75} /> Rename kit
          </button>
          <div className="h-px bg-[var(--s-border)] my-1" />
          <button
            onClick={() => {
              emitPopover(null);
              emitModal({
                type: "confirm",
                title: "Delete kit",
                message: `Delete "${kit.name}"? This can't be undone.`,
                confirmLabel: "Delete",
                danger: true,
                onConfirm: () => deleteKit(kit.id),
              });
            }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
          >
            <Trash2 size={13} strokeWidth={1.75} /> Delete kit
          </button>
        </div>
      ),
    });
  };

  return (
    <div className="flex flex-col">
      <div className="px-3 py-2.5 flex items-center gap-1.5">
        <div className="flex-1 min-w-0">
          <Dropdown
            options={kits.map((entry) => ({ label: entry.name, value: entry.id }))}
            value={activeId ?? ""}
            placeholder="No kit"
            onChange={setActiveKit}
          />
        </div>
        <SmallBtn title="New kit" onClick={handleNewKit}>
          <Plus size={12} strokeWidth={2} />
        </SmallBtn>
        <button
          type="button"
          title="Kit options"
          onClick={openKitMenu}
          className="w-6 h-6 rounded-md border-none cursor-pointer flex items-center justify-center text-[10px] transition-all duration-100 bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
        >
          <MoreHorizontal size={12} strokeWidth={2} />
        </button>
      </div>

      {!kit ? (
        <div className="px-3 pb-3">
          <button
            onClick={handleNewKit}
            className="w-full py-1.5 rounded-lg bg-[var(--s-bg-input)] text-[11px] text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors"
          >
            Create a design kit
          </button>
        </div>
      ) : (
        <>
          <KitColorsSection
            colors={kit.colors}
            prefillColor={prefillColorFor(selectedLayer)}
            canApply={hasSelection}
            onVariableColorChange={onVariableColorChange}
            onApply={(variable) => onApplyKitColor(variable.id, variable.value)}
          />
          <KitTextStylesSection
            styles={kit.textStyles}
            captured={captured}
            canApply={!!isTextSelected}
            onApply={onApplyKitTextStyle}
          />
          <KitNumbersSection
            numbers={kit.numbers}
            canApply={hasSelection}
            onApply={onApplyKitNumber}
          />
        </>
      )}
    </div>
  );
};
