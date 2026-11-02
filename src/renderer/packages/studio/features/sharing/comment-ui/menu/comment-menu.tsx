import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { CommentMenu, type CommentMenuEntry } from "./comment-menu-list";

export type { CommentMenuEntry };

export const openCommentMenu = (anchor: HTMLElement, entries: CommentMenuEntry[]): void => {
  emitPopover({
    type: "tool-dropdown",
    anchorRect: anchor.getBoundingClientRect(),
    preferBelow: true,
    content: <CommentMenu entries={entries} />,
  });
};
