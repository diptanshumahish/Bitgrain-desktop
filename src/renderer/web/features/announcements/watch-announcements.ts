import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { fetchMyAnnouncements } from "./announcements-api";
import { emitAnnouncements } from "./announcement-events";
import { clearAnnouncements } from "./announcement-store";

const loadForUser = async (): Promise<void> => {
  const announcements = await fetchMyAnnouncements();
  if (announcements.length > 0) emitAnnouncements(announcements);
};

export function watchAnnouncements(): () => void {
  const lastUserId = { current: "" };
  const sync = (): void => {
    const userId = userSignal.value?.id ?? "";
    if (userId === lastUserId.current) return;
    lastUserId.current = userId;
    if (!userId) {
      clearAnnouncements();
      return;
    }
    void loadForUser();
  };
  sync();
  return userSignal.subscribe(sync);
}
