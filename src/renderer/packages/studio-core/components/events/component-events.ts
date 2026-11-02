import { createEventChannel } from "@bitgrain/core/events/event-channel";
import type { InstanceResizeMode } from "../../model/component-types";

export const COMPONENT_DRAG_MIME = "application/x-bitgrain-component";

const COMPONENT_ACTION_EVENT = "bg:component-action";

export interface ComponentDropPoint {
  pageId: string;
  x: number;
  y: number;
}

export type ComponentAction =
  | { kind: "create" }
  | { kind: "insert"; componentId: string; drop: ComponentDropPoint | null }
  | { kind: "go-to-main"; componentId: string }
  | { kind: "detach"; layerId: string }
  | { kind: "reset"; layerId: string; overrideKey?: string }
  | { kind: "swap"; layerId: string; componentId: string }
  | { kind: "pick-variant"; layerId: string; property: string; value: string }
  | { kind: "set-resize"; layerId: string; resize: InstanceResizeMode }
  | { kind: "add-variant"; layerId: string }
  | { kind: "set-variant-value"; componentId: string; property: string; value: string }
  | { kind: "rename-property"; setId: string; from: string; to: string }
  | { kind: "add-property"; setId: string; name: string }
  | { kind: "rename-set"; setId: string; name: string };

const componentActionChannel = createEventChannel<ComponentAction>(COMPONENT_ACTION_EVENT);

export const emitComponentAction = componentActionChannel.emit;
export const onComponentAction = componentActionChannel.on;
