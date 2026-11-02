import type { Announcement } from "./announcements-api";
import { createEventChannel } from "@bitgrain/core/events/event-channel";

const ANNOUNCEMENTS_EVENT_KEY = "bg:announcements";

const announcementsChannel = createEventChannel<Announcement[]>(ANNOUNCEMENTS_EVENT_KEY);

export const emitAnnouncements = announcementsChannel.emit;
export const onAnnouncements = announcementsChannel.on;

