import React from "react";
import { loadComments } from "../comments/comment-actions";
import { commentErrorSignal } from "../comments/comments-store";
import { ShareSyncNotice } from "../share-dialog/ShareSyncNotice";
import { shareBusySignal } from "../share-dialog/share-dialog-store";
import { syncStudioProject } from "../studio/studio-share-bridge";

const SYNC_FAILED_MESSAGE = "We couldn't sync this design. Try again in a moment.";

const syncThenLoad = async (): Promise<void> => {
  shareBusySignal.value = true;
  const outcome = await syncStudioProject();
  shareBusySignal.value = false;
  if (outcome !== "saved") {
    commentErrorSignal.value = SYNC_FAILED_MESSAGE;
    return;
  }
  await loadComments();
};

export const StudioCommentsNotice: React.FC = () => (
  <div className="flex flex-col gap-3 p-3">
    <p className="text-[12px] leading-relaxed text-[var(--s-text-muted)]">
      Comments live on a shared cloud project. Once this design is in the cloud, you and anyone you share it with can leave
      comments right on the canvas.
    </p>
    <ShareSyncNotice onSyncNow={syncThenLoad} />
  </div>
);
