import React, { useMemo } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { commentingModeSignal } from "../comment-state/comment-ui-store";
import { commentsNotSyncedSignal } from "../comments/comments-store";
import { CommentsPanel, type PanelPage } from "../panel/comments-panel";
import { StudioCommentsNotice } from "./studio-comments-notice";

interface StudioCommentsSidebarProps {
  pages: TemplatePage[];
}

const toPanelPages = (pages: TemplatePage[]): PanelPage[] =>
  pages.map((page, index) => ({ id: page.id, name: page.name || `Page ${index + 1}` }));

export const StudioCommentsSidebar: React.FC<StudioCommentsSidebarProps> = ({ pages }) => {
  const panelPages = useMemo(() => toPanelPages(pages), [pages]);
  const notSynced = useSignalValue(commentsNotSyncedSignal);
  const canWrite = useSignalValue(commentingModeSignal) === "write";
  const notice = notSynced || !canWrite ? <StudioCommentsNotice /> : undefined;
  return <CommentsPanel pages={panelPages} widthClass="w-[252px]" notice={notice} />;
};
