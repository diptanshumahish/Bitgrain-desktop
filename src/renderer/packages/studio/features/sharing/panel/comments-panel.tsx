import React, { useMemo } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { commentErrorSignal, commentsLoadingSignal } from "../comments/comments-store";
import { commentingModeSignal } from "../comment-state/comment-ui-store";
import { openCommentPopoverSignal, openThreadId } from "../comment-state/comment-popover-store";
import { CommentsEmptyState } from "./comments-empty-state";
import { CommentsPanelHeader } from "./comments-panel-header";
import { ThreadListCard } from "./thread-list-card";
import { usePanelThreads } from "./use-panel-threads";

export interface PanelPage {
  id: string;
  name: string;
}

interface CommentsPanelProps {
  pages: PanelPage[];
  widthClass: string;
  notice?: React.ReactNode;
}

const REMOVED_PAGE_NAME = "Removed page";

export const CommentsPanel: React.FC<CommentsPanelProps> = ({ pages, widthClass, notice }) => {
  const pageOrder = useMemo(() => pages.map((page) => page.id), [pages]);
  const { shown, total } = usePanelThreads(pageOrder);
  const activeId = openThreadId(useSignalValue(openCommentPopoverSignal));
  const loading = useSignalValue(commentsLoadingSignal);
  const error = useSignalValue(commentErrorSignal);
  const mode = useSignalValue(commentingModeSignal);
  const pageName = (pageId: string): string => pages.find((page) => page.id === pageId)?.name || REMOVED_PAGE_NAME;

  return (
    <aside
      data-comments-panel
      aria-label="Comments"
      className={`${widthClass} shrink-0 h-full flex flex-col bg-[var(--s-bg-panel)] border-l border-[var(--s-border)] font-editorial overflow-hidden`}
    >
      <CommentsPanelHeader />
      {notice}
      {error && !notice && <p role="alert" className="px-3 pt-2.5 text-[11.5px] text-red-600">{error}</p>}
      {!notice && (
        <ul className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {shown.map((thread) => (
            <li key={thread.root.id} className="border-b border-[var(--s-border)]">
              <ThreadListCard thread={thread} pageName={pageName(thread.root.pageId)} active={thread.root.id === activeId} />
            </li>
          ))}
          {shown.length === 0 && (
            <li>
              <CommentsEmptyState hasThreads={total > 0} loading={loading} mode={mode} />
            </li>
          )}
        </ul>
      )}
    </aside>
  );
};
