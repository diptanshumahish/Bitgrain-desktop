import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle, Share2 } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { saveWork } from "@bitgrain/platform/projects/works-store";
import type { CloudSyncOutcome } from "@bitgrain/platform/projects/save-to-cloud";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { commentModeSignal } from "../comment-state/comment-ui-store";
import { toggleCommentMode } from "../comment-state/comment-mode";
import { emitShareDialog } from "./sharing-events";
import { buildWorkSnapshot, type StudioDocumentState } from "./build-work-snapshot";
import { registerStudioSync, syncStudioProject } from "./studio-share-bridge";
import { unreadCountSignal, useUnreadPolling } from "./unread-store";

const MAX_BADGE_COUNT = 9;

const badgeText = (count: number): string => (count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count));

const commentsLabel = (unread: number): string => (unread > 0 ? `Comments, ${unread} unread` : "Comments (C)");

const useStudioSync = (workId: string | undefined, state: StudioDocumentState): void => {
  const latestRef = useRef({ workId, state });
  useEffect(() => {
    latestRef.current = { workId, state };
  });
  const syncRef = useRef(async (): Promise<CloudSyncOutcome> => {
    const latest = latestRef.current;
    return latest.workId ? await saveWork(buildWorkSnapshot(latest.workId, latest.state)) : "not_synced";
  });
  useEffect(() => registerStudioSync(syncRef.current), []);
};

const syncForShare = async (): Promise<CloudSyncOutcome> => (await syncStudioProject()) ?? "not_synced";

export const TopBarShare: React.FC<StudioDocumentState> = (state) => {
  const { workId } = useParams<{ workId?: string }>();
  const user = useSignalValue(userSignal);
  const unread = useSignalValue(unreadCountSignal);
  const commentMode = useSignalValue(commentModeSignal);
  useStudioSync(workId, state);
  useUnreadPolling(workId, !!user);
  if (!workId) return null;

  return (
    <div className="flex items-center gap-1 mr-1.5">
      <Tooltip content={commentsLabel(unread)}>
        <button
          type="button"
          onClick={toggleCommentMode}
          aria-label={commentsLabel(unread)}
          aria-pressed={commentMode}
          className={`relative flex items-center justify-center w-7 h-7 rounded-md border-none cursor-pointer transition-colors active:scale-95 ${commentMode ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]" : "bg-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"}`}
        >
          <MessageCircle size={13} strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 flex items-center justify-center rounded-full bg-[var(--s-accent)] text-[var(--s-accent-text)] ring-2 ring-[var(--s-bg-panel)] text-[9px] font-semibold tabular-nums">
              {badgeText(unread)}
            </span>
          )}
        </button>
      </Tooltip>
      <Tooltip content="Share a link">
        <button
          type="button"
          onClick={() => emitShareDialog({ projectId: workId, syncNow: syncForShare })}
          aria-label="Share"
          className="h-7 px-2.5 flex items-center gap-1.5 rounded-md border border-[var(--s-border)] bg-transparent text-[12px] text-[var(--s-text)] cursor-pointer hover:bg-[var(--s-bg-input)] transition-colors active:scale-95"
        >
          <Share2 size={12} strokeWidth={1.75} />
          <span className="hidden lg:inline">Share</span>
        </button>
      </Tooltip>
    </div>
  );
};
