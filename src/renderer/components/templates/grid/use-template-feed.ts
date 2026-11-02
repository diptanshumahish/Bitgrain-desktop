import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import { useSignalValue } from "../../../lib/signal";
import { templatesNetworkSignal } from "../../../store/templates-network";
import {
  templatesHasMoreSignal,
  templatesLoadingSignal,
  templatesLockedTotalSignal,
  templatesReadySignal,
  templatesSignal,
  templatesTotalSignal,
} from "../../../store/templates-store";

export interface TemplateFeed {
  templates: TemplateSummary[];
  isLoading: boolean;
  isReady: boolean;
  isFailed: boolean;
  isSlow: boolean;
  hasMore: boolean;
  total: number;
  lockedTotal: number;
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
    total: useSignalValue(templatesTotalSignal),
    lockedTotal: useSignalValue(templatesLockedTotalSignal),
  };
}

export function isFeedPending(feed: TemplateFeed): boolean {
  return !feed.isSlow && (feed.isLoading || !feed.isReady);
}

export function isSettledEmpty(feed: TemplateFeed): boolean {
  return feed.isReady && !feed.isLoading && !feed.isFailed && feed.templates.length === 0;
}
