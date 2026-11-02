import React from "react";
import { ChevronDown } from "lucide-react";
import type { LayerConstraints } from "@bitgrain/studio-core/model/auto-layout-types";
import { signal, useSignalValue } from "@bitgrain/core/signal";
import { PanelGroup } from "../../../ui/panel-group";
import { HeaderIconButton } from "../../../ui/HeaderIconButton";
import { ConstraintsFields } from "./constraints-fields";

const CONSTRAINTS_HINT = "Pick which edges this layer sticks to when the page or frame around it is resized.";

const constraintsOpenSignal = signal<boolean>(false);

const toggleConstraints = (): void => {
  constraintsOpenSignal.value = !constraintsOpenSignal.value;
};

interface ConstraintsSectionProps {
  constraints: LayerConstraints;
  onChange: (constraints: LayerConstraints) => void;
}

export const ConstraintsSection: React.FC<ConstraintsSectionProps> = ({ constraints, onChange }) => {
  const open = useSignalValue(constraintsOpenSignal);
  const actions = (
    <HeaderIconButton title={open ? "Hide constraints" : "Show constraints"} active={open} onClick={toggleConstraints}>
      <ChevronDown size={13} strokeWidth={1.75} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
    </HeaderIconButton>
  );

  return (
    <PanelGroup title="Constraints" actions={actions} onTitleClick={toggleConstraints}>
      {open && (
        <>
          <p className="text-[12px] leading-snug text-[var(--s-text-subtle)]">{CONSTRAINTS_HINT}</p>
          <ConstraintsFields constraints={constraints} onChange={onChange} />
        </>
      )}
    </PanelGroup>
  );
};
