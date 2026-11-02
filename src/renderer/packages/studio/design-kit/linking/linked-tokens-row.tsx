import React from "react";
import type { Layer, TokenSlot } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { designKitsSignal } from "../../state/design-kits-store";
import { findKitNumber, findKitTextStyle } from "./find-kit-token";
import { TOKEN_SLOTS, withoutSlot } from "./token-slots";
import { LinkedTokenChip } from "./linked-token-chip";

const MISSING_NAME = "Missing from kit";

const SLOT_LABEL: Record<TokenSlot, string> = {
  radius: "Radius",
  strokeWidth: "Stroke",
  fontSize: "Size",
  spacing: "Gap",
};

interface LinkedTokensRowProps {
  layer: Layer;
  onChange: (updates: Partial<Layer>) => void;
  framed?: boolean;
}

export const LinkedTokensRow: React.FC<LinkedTokensRowProps> = ({ layer, onChange, framed = false }) => {
  const kits = useSignalValue(designKitsSignal);
  const styleId = layer.type === "text" ? layer.textStyleId : undefined;
  const boundSlots = TOKEN_SLOTS.filter((slot) => layer.tokenRefs?.[slot]);
  if (!styleId && boundSlots.length === 0) return null;

  return (
    <div className={`flex flex-col gap-1.5 ${framed ? "px-4 pt-4" : ""}`}>
      {styleId && (
        <LinkedTokenChip
          label="Style"
          name={findKitTextStyle(kits, styleId)?.name ?? MISSING_NAME}
          onDetach={() => onChange({ textStyleId: undefined } as Partial<Layer>)}
        />
      )}
      {boundSlots.map((slot) => (
        <LinkedTokenChip
          key={slot}
          label={SLOT_LABEL[slot]}
          name={findKitNumber(kits, layer.tokenRefs?.[slot])?.name ?? MISSING_NAME}
          onDetach={() => onChange({ tokenRefs: withoutSlot(layer.tokenRefs, slot) })}
        />
      ))}
    </div>
  );
};
