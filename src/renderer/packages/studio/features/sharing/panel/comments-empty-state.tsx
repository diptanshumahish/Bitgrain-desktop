import React from "react";
import { MessageCircle } from "lucide-react";
import type { CommentingMode } from "../api/share-types";

interface CommentsEmptyStateProps {
  hasThreads: boolean;
  loading: boolean;
  mode: CommentingMode;
}

const ICON_SIZE = 18;

const emptyCopy = (hasThreads: boolean, mode: CommentingMode): { title: string; detail: string } => {
  if (hasThreads) return { title: "Nothing to show", detail: "No comments match your search or filters." };
  if (mode === "write") return { title: "No comments yet", detail: "Click anywhere on a page to leave the first one." };
  return { title: "No comments yet", detail: "Sign in to leave the first one." };
};

export const CommentsEmptyState: React.FC<CommentsEmptyStateProps> = ({ hasThreads, loading, mode }) => {
  if (loading && !hasThreads) {
    return <p className="px-3 py-6 text-center text-[12px] text-[var(--s-text-subtle)]">Loading comments</p>;
  }
  const copy = emptyCopy(hasThreads, mode);
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 py-10 text-center">
      <MessageCircle size={ICON_SIZE} strokeWidth={1.75} className="mb-1 text-[var(--s-text-subtle)]" />
      <span className="text-[12.5px] font-semibold text-[var(--s-text)]">{copy.title}</span>
      <span className="text-[12px] leading-relaxed text-[var(--s-text-muted)]">{copy.detail}</span>
    </div>
  );
};
