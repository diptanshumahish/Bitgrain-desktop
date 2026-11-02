import React from "react";
import { isFeedPending, type TemplateFeed } from "../grid/use-template-feed";

export const ResultsMeta: React.FC<{ feed: TemplateFeed }> = ({ feed }) => {
  if (isFeedPending(feed) && feed.templates.length === 0) {
    return <span className="skeleton-shimmer inline-block h-3 w-20 rounded align-middle" />;
  }
  if (feed.total === 0) return null;
  return <>{feed.total === 1 ? "1 template" : `${feed.total} templates`}</>;
};
