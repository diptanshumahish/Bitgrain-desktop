import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { hoveredThreadSignal } from "../comment-state/comment-ui-store";
import { isCommentPopoverOpen, openCommentPopoverSignal, openThreadId } from "../comment-state/comment-popover-store";
import { closeCommentPopover, startDraft } from "../comment-state/thread-navigation";
import { DraftPin } from "./draft-pin";
import { pointInSurface } from "./pin-geometry";
import { ThreadPin } from "./thread-pin";
import { usePagePinThreads } from "./use-visible-pin-threads";

interface PagePinsLayerProps {
  pageId: string;
  placing: boolean;
  counterScale: boolean;
}

const placeOrDismiss = (event: React.MouseEvent<HTMLDivElement>, pageId: string): void => {
  event.stopPropagation();
  if (isCommentPopoverOpen()) {
    closeCommentPopover();
    return;
  }
  startDraft({ pageId, ...pointInSurface(event.currentTarget, event.clientX, event.clientY) });
};

export const PagePinsLayer: React.FC<PagePinsLayerProps> = ({ pageId, placing, counterScale }) => {
  const threads = usePagePinThreads(pageId);
  const popover = useSignalValue(openCommentPopoverSignal);
  const hoveredId = useSignalValue(hoveredThreadSignal);
  const activeId = openThreadId(popover);
  const draft = popover?.kind === "composer" && popover.draft.pageId === pageId ? popover.draft : null;

  return (
    <div
      data-comment-surface={pageId}
      aria-label={placing ? "Click to leave a comment" : undefined}
      className={`absolute inset-0 ${placing ? "pointer-events-auto comment-cursor" : "pointer-events-none"}`}
      onPointerDown={placing ? (event) => event.stopPropagation() : undefined}
      onClick={placing ? (event) => placeOrDismiss(event, pageId) : undefined}
    >
      {threads.map((thread) => (
        <ThreadPin
          key={thread.root.id}
          thread={thread}
          active={thread.root.id === activeId}
          highlighted={thread.root.id === hoveredId}
          counterScale={counterScale}
        />
      ))}
      {draft && <DraftPin draft={draft} counterScale={counterScale} />}
    </div>
  );
};
