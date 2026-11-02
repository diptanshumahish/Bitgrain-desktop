import React from "react";
import { useParams } from "react-router-dom";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useCommentKeys } from "../comment-state/use-comment-keys";
import { useLinkedThread } from "../comment-state/use-linked-thread";
import { CommentPopoverPortal } from "../popover/comment-popover-portal";
import { useStudioCommentsSession } from "./use-studio-comments-session";
import { useStudioThreadFocus } from "./use-studio-thread-focus";

interface StudioCommentsHostProps {
  pages: TemplatePage[];
}

const STUDIO_TOOL_KEYS = ["v", "h", "p", "b", "f", "r", "t"] as const;

export const StudioCommentsHost: React.FC<StudioCommentsHostProps> = ({ pages }) => {
  const { workId } = useParams<{ workId?: string }>();
  useStudioCommentsSession(workId);
  useStudioThreadFocus(pages);
  useCommentKeys(!!workId, STUDIO_TOOL_KEYS);
  useLinkedThread();
  return <CommentPopoverPortal />;
};
