import { createEventChannel } from "@bitgrain/core/events/event-channel";
import type { LibraryOpenRequest } from "./element-library-types";

const OPEN_ELEMENT_LIBRARY_EVENT = "bg:open-element-library";

const openElementLibraryChannel = createEventChannel<LibraryOpenRequest>(OPEN_ELEMENT_LIBRARY_EVENT);

export const emitOpenElementLibrary = (request: LibraryOpenRequest = {}): void => openElementLibraryChannel.emit(request);
export const onOpenElementLibrary = openElementLibraryChannel.on;
