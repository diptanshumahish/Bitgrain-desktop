import { createEventChannel } from "@bitgrain/core/events/event-channel";

const SECTION_MENU_KEY = "bg:section-menu";

export interface SectionMenuEvent {
  anchorRect: DOMRect;
}

const sectionMenuChannel = createEventChannel<SectionMenuEvent | null>(SECTION_MENU_KEY);

export const emitSectionMenu = sectionMenuChannel.emit;
export const onSectionMenu = sectionMenuChannel.on;
