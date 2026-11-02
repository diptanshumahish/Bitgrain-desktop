import { signal } from "@bitgrain/core/signal";
import { dismissAnnouncement, type Announcement } from "./announcements-api";

export const announcementQueueSignal = signal<Announcement[]>([]);

export function enqueueAnnouncements(incoming: Announcement[]): void {
  const queued = announcementQueueSignal.value;
  const knownIds = new Set(queued.map((announcement) => announcement.id));
  const fresh = incoming.filter((announcement) => !knownIds.has(announcement.id));
  if (fresh.length === 0) return;
  announcementQueueSignal.value = [...queued, ...fresh];
}

export function dismissCurrentAnnouncement(): void {
  const [current, ...rest] = announcementQueueSignal.value;
  if (!current) return;
  announcementQueueSignal.value = rest;
  void dismissAnnouncement(current.id);
}

export function clearAnnouncements(): void {
  announcementQueueSignal.value = [];
}
