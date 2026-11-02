import { createEventChannel } from "@bitgrain/core/events/event-channel";

const SELECT_LAYERS_EVENT = "bg:select-layers";

const selectLayersChannel = createEventChannel<string[]>(SELECT_LAYERS_EVENT);

export const emitSelectLayers = selectLayersChannel.emit;
export const onSelectLayers = selectLayersChannel.on;

