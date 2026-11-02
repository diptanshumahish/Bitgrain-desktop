import React, { useDeferredValue } from "react";
import { InspectorHeader } from "./InspectorHeader";
import { InspectorBody } from "./InspectorBody";
import { InspectorEmpty } from "./InspectorEmpty";
import { inspectorTitle } from "./inspector-titles";
import type { ActivePopover, ToolbarCallbacks } from "../toolbar-types";
import { resolveInspectorPanel } from "./resolve-panel";
import { useSignalValue } from "@bitgrain/core/signal";
import { selectedEffectKeySignal } from "../../recipe/recipe-selection";
import { imageSignal } from "../../state/image-store";
import { effectTitle } from "../../recipe/effect-title";

interface EditorInspectorProps {
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
  callbacks: ToolbarCallbacks;
}

export const EditorInspector: React.FC<EditorInspectorProps> = ({ active, toggle, close, callbacks }) => {
  const panel = resolveInspectorPanel(active);
  const shownPanel = useDeferredValue(panel);
  const effectKey = useSignalValue(selectedEffectKeySignal);
  const hasImage = useSignalValue(imageSignal) !== null;
  const title = panel === "effect" ? effectTitle(effectKey) : inspectorTitle(panel);
  return (
    <aside
      aria-label="Inspector"
      className="hidden md:flex w-[272px] lg:w-[300px] shrink-0 flex-col bg-[var(--s-bg-panel)] border-l border-[var(--s-border)] font-editorial"
    >
      <InspectorHeader panel={panel} title={title} onSelect={(next) => { if (next !== panel) toggle(next); }} />
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {hasImage ? (
          <InspectorBody panel={shownPanel} toggle={toggle} close={close} callbacks={callbacks} />
        ) : (
          <InspectorEmpty />
        )}
      </div>
    </aside>
  );
};
