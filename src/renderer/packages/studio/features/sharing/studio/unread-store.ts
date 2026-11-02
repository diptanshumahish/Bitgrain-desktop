import { useEffect } from "react";
import { signal } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { fetchUnreadCount } from "../api/comments-api";

const UNREAD_POLL_MS = 60_000;

export const unreadCountSignal = signal<number>(0);

export async function refreshUnreadCount(projectId: string): Promise<void> {
  if (!userSignal.value) return;
  unreadCountSignal.value = await fetchUnreadCount(projectId);
}

export const useUnreadPolling = (projectId: string | undefined, signedIn: boolean): void => {
  useEffect(() => {
    unreadCountSignal.value = 0;
    if (!projectId || !signedIn) return undefined;
    void refreshUnreadCount(projectId);
    const refreshWhenVisible = (): void => {
      if (document.visibilityState === "visible") void refreshUnreadCount(projectId);
    };
    const timer = window.setInterval(refreshWhenVisible, UNREAD_POLL_MS);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [projectId, signedIn]);
};
