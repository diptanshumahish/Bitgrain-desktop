async function syncProjects(syncKey: string): Promise<void> {
  try {
    const { syncLocalProjectsToCloud } = await import("../../utils/sync-projects");
    await syncLocalProjectsToCloud();
    sessionStorage.setItem(syncKey, "true");
  } catch (error) {
    console.error("project sync failed:", error);
  }
}

export function syncProjectsOnce(userId: string): void {
  const syncKey = `bg_synced_${userId}`;
  if (sessionStorage.getItem(syncKey)) return;
  void syncProjects(syncKey);
}
