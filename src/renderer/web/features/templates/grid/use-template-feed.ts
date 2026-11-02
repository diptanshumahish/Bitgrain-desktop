import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import { useSignalValue } from "@bitgrain/core/signal";
import { templatesNetworkSignal } from "@bitgrain/platform/templates/store/templates-network";
import {
  templatesHasMoreSignal,
  templatesLoadingSignal,
  templatesReadySignal,
  templatesSignal,
} from "@bitgrain/platform/templates/store/templates-store";

export interface TemplateFeed {
  templates: TemplateSummary[];
  isLoading: boolean;
  isReady: boolean;
  isFailed: boolean;
  isSlow: boolean;
  hasMore: boolean;
}

export function useTemplateFeed(): TemplateFeed {
  const networkState = useSignalValue(templatesNetworkSignal);
  return {
    templates: useSignalValue(templatesSignal),
    isLoading: useSignalValue(templatesLoadingSignal),
    isReady: useSignalValue(templatesReadySignal),
    isFailed: networkState === "failed",
    isSlow: networkState !== "ok",
    hasMore: useSignalValue(templatesHasMoreSignal),
  };
}

export function isFeedPending(feed: TemplateFeed): boolean {
  return !feed.isSlow && (feed.isLoading || !feed.isReady);
}

export function isSettledEmpty(feed: TemplateFeed): boolean {
  return feed.isReady && !feed.isLoading && !feed.isFailed && feed.templates.length === 0;
}
