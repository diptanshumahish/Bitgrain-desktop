import { createEventChannel } from "@bitgrain/core/events/event-channel";

const OPEN_FIND_REPLACE_EVENT = "bg:open-find-replace";

const openFindReplaceChannel = createEventChannel<void>(OPEN_FIND_REPLACE_EVENT);

export const emitOpenFindReplace = (): void => openFindReplaceChannel.emit();
export const onOpenFindReplace = openFindReplaceChannel.on;
