import { commentModeSignal, showCommentsSignal } from "./comment-ui-store";
import { closeCommentPopover } from "./thread-navigation";

export const setCommentMode = (active: boolean): void => {
  commentModeSignal.value = active;
  if (!active) closeCommentPopover();
};

export const toggleCommentMode = (): void => setCommentMode(!commentModeSignal.value);

export const toggleShowComments = (): void => {
  showCommentsSignal.value = !showCommentsSignal.value;
  if (!showCommentsSignal.value && !commentModeSignal.value) closeCommentPopover();
};
