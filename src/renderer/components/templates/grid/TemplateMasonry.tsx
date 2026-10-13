import React, { useMemo } from "react";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { MasonryGrid } from "../../masonry/MasonryGrid";
import { TemplatesNetworkNotice } from "../network/TemplatesNetworkNotice";
import { TemplateCardShimmer } from "../loading/TemplateCardShimmer";
import { buildMasonryEntries, entryHeightRatio, entryKey, type MasonryEntry } from "./masonry-entries";
import { shimmerCount } from "./shimmer-count";
import { GridEndNote } from "./GridEndNote";
import { shuffleInChunks } from "./shuffle-in-chunks";
import type { TemplateFeed } from "./use-template-feed";

const GRID_MIN_COLUMN_WIDTH = 230;

interface TemplateMasonryProps {
  feed: TemplateFeed;
  renderCard: (template: TemplateSummary) => React.ReactNode;
  onReachEnd: () => void;
  shuffled?: boolean;
}

export const TemplateMasonry: React.FC<TemplateMasonryProps> = ({ feed, renderCard, onReachEnd, shuffled = false }) => {
  const failed = feed.isFailed;
  const sentinelRef = useIntersectionObserver(onReachEnd, feed.hasMore && !failed);
  const hasCards = feed.templates.length > 0;
  const orderedTemplates = useMemo(
    () => (shuffled ? shuffleInChunks(feed.templates) : feed.templates),
    [shuffled, feed.templates],
  );
  const entries = buildMasonryEntries(
    orderedTemplates,
    shimmerCount({
      templateCount: feed.templates.length,
      isPending: feed.isLoading || !feed.isReady,
      hasMore: feed.hasMore,
      failed,
    }),
  );
  const isFinished = hasCards && !feed.hasMore && !feed.isLoading;

  const renderEntry = (entry: MasonryEntry): React.ReactNode =>
    entry.kind === "template" ? (
      <div className="template-card-in">{renderCard(entry.template)}</div>
    ) : (
      <TemplateCardShimmer slot={entry.slot} />
    );

  return (
    <div aria-busy={feed.isLoading}>
      {!hasCards && <TemplatesNetworkNotice theme="site" className="mb-8" />}
      <MasonryGrid
        items={entries}
        getKey={entryKey}
        getHeightRatio={entryHeightRatio}
        renderItem={renderEntry}
        minColumnWidth={GRID_MIN_COLUMN_WIDTH}
        gap="gap-3"
      />
      {hasCards && <TemplatesNetworkNotice theme="site" className="mt-4" />}
      {isFinished && <GridEndNote total={feed.total || feed.templates.length} />}
      <div ref={sentinelRef} className="h-10" />
    </div>
  );
};
