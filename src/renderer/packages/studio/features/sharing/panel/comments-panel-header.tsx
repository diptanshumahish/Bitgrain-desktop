import React from "react";
import { ListFilter, Search } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { commentQuerySignal } from "../comment-state/comment-ui-store";
import { IconButton } from "../comment-ui/icon-button";
import { openCommentsFilterMenu } from "./comments-filter-menu";

const ICON_SIZE = 14;
const SEARCH_ICON_SIZE = 13;

export const CommentsPanelHeader: React.FC = () => {
  const signedIn = !!useSignalValue(userSignal);
  return (
    <div className="shrink-0 border-b border-[var(--s-border)]">
      <div className="h-10 flex items-center pl-3 pr-1.5">
        <h2 className="flex-1 text-[13px] font-semibold text-[var(--s-text)]">Comments</h2>
        <IconButton label="Sort and filter" onClick={(event) => openCommentsFilterMenu(event.currentTarget, signedIn)}>
          <ListFilter size={ICON_SIZE} />
        </IconButton>
      </div>
      <label className="mx-3 mb-2.5 h-7 flex items-center gap-1.5 px-2 rounded-md bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] focus-within:ring-1 focus-within:ring-[var(--s-border-focus)]">
        <Search size={SEARCH_ICON_SIZE} className="shrink-0" />
        <input
          type="search"
          defaultValue={commentQuerySignal.value}
          placeholder="Search comments"
          aria-label="Search comments"
          onInput={(event) => {
            commentQuerySignal.value = event.currentTarget.value;
          }}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-[12px] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)]"
        />
      </label>
    </div>
  );
};
