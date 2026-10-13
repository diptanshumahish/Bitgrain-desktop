import { trackEvent } from "../../lib/tracker";

export function trackTemplateSearch(query: string, resultsCount: number, category: string): void {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;
  void trackEvent("templates", "search_used", {
    details: { query_length: trimmedQuery.length, results_count: resultsCount, category },
  });
}
