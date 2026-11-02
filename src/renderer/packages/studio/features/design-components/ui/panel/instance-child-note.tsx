import React from "react";
import { RotateCcw } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../../../ui/panel-group";
import { Button } from "@bitgrain/ui/components/Button";
import { emitSelectLayers } from "../../../../editor/select-layers-event";
import { emitComponentAction } from "@bitgrain/studio-core/components/events/component-events";
import { instanceSourceKey } from "@bitgrain/studio-core/components/core/instance-ids";

interface InstanceChildNoteProps {
  instance: Layer;
  childId: string;
}

export const InstanceChildNote: React.FC<InstanceChildNoteProps> = ({ instance, childId }) => {
  const key = instanceSourceKey(instance.id, childId);
  const overridden = Boolean(key && instance.instance?.overrides?.[key]);
  return (
    <PanelGroup title="Inside an instance">
      <p className="text-[11px] leading-snug text-[var(--s-text-subtle)]">
        This layer belongs to {instance.name}. You can change its text, colours, image, font and visibility here, the rest follows the main component.
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <Button size="xs" onClick={() => emitSelectLayers([instance.id])}>
          Select instance
        </Button>
        <Button
          size="xs"
          disabled={!overridden}
          onClick={() => key && emitComponentAction({ kind: "reset", layerId: instance.id, overrideKey: key })}
        >
          <RotateCcw size={12} strokeWidth={1.75} />
          Reset layer
        </Button>
      </div>
    </PanelGroup>
  );
};
