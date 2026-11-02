import { createEventChannel } from "@bitgrain/core/events/event-channel";

const RENAME_LAYER_EVENT = "bg:rename-layer";

const renameLayerChannel = createEventChannel<string>(RENAME_LAYER_EVENT);

export const emitRenameLayer = renameLayerChannel.emit;
export const onRenameLayer = renameLayerChannel.on;

