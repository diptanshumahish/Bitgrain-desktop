import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { commentsNotSyncedSignal } from "../comments/comments-store";
import { commentingModeSignal, commentModeSignal, showCommentsSignal } from "../comment-state/comment-ui-store";
import { PagePinsLayer } from "../pins/page-pins-layer";
import { CANVAS_ZOOM_VAR, ZOOM_SCOPE_ATTRIBUTE } from "../../../canvas/zoom/zoom-scopes";

interface StudioPageCommentsProps {
  pageId: string;
  zoom: number;
}

export const StudioPageComments: React.FC<StudioPageCommentsProps> = ({ pageId, zoom }) => {
  const commentMode = useSignalValue(commentModeSignal);
  const showComments = useSignalValue(showCommentsSignal);
  const canWrite = useSignalValue(commentingModeSignal) === "write";
  const notSynced = useSignalValue(commentsNotSyncedSignal);
  if (!commentMode && !showComments) return null;
  return (
    <div
      {...{ [ZOOM_SCOPE_ATTRIBUTE]: "" }}
      className="absolute inset-0 z-[70] pointer-events-none"
      style={{ [CANVAS_ZOOM_VAR]: zoom } as React.CSSProperties}
    >
      <PagePinsLayer pageId={pageId} placing={commentMode && canWrite && !notSynced} counterScale />
    </div>
  );
};
