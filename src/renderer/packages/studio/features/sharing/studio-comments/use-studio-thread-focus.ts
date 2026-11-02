import { useEffect, useLayoutEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { requestCanvasFocus } from "../../../state/canvas-fit-request";
import type { CommentThread } from "../api/share-types";
import { registerThreadFocus } from "../comment-state/thread-focus";

const focusOnPin = (pages: TemplatePage[], thread: CommentThread): void => {
  const page = pages.find((candidate) => candidate.id === thread.root.pageId);
  if (!page || thread.root.x === null || thread.root.y === null) return;
  requestCanvasFocus(page, { x: page.x + thread.root.x * page.width, y: page.y + thread.root.y * page.height });
};

export const useStudioThreadFocus = (pages: TemplatePage[]): void => {
  const pagesRef = useRef(pages);
  useLayoutEffect(() => {
    pagesRef.current = pages;
  });
  useEffect(() => registerThreadFocus((thread) => focusOnPin(pagesRef.current, thread)), []);
};
