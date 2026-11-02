import { createEventChannel } from "@bitgrain/core/events/event-channel";

const PAGE_NOTES_EVENT = "bg:page-notes-update";

interface PageNotesUpdate {
  pageId: string;
  notes: string;
  recordHistory: boolean;
}

const pageNotesUpdateChannel = createEventChannel<PageNotesUpdate>(PAGE_NOTES_EVENT);

export const emitPageNotesUpdate = pageNotesUpdateChannel.emit;
export const onPageNotesUpdate = pageNotesUpdateChannel.on;

