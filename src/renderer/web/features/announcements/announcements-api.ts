import { callApi } from "@bitgrain/api/api-client";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
}

export async function fetchMyAnnouncements(): Promise<Announcement[]> {
  const response = await callApi<{ items: Announcement[] }>("/api/announcements");
  return response?.items ?? [];
}

export async function dismissAnnouncement(id: string): Promise<void> {
  await callApi<{ id: string }>(`/api/announcements/${id}/dismiss`, { method: "POST" });
}
