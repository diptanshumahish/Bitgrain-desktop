import { useEffect, useRef } from "react";
import { setTemplateFilter } from "../../../store/templates-store";

const SEARCH_DEBOUNCE_MS = 280;
const IMMEDIATE_MS = 0;

export function useTemplateFilter(query: string, category: string): void {
  const appliedCategoryRef = useRef<string | null>(null);

  useEffect(() => {
    const isSameCategory = appliedCategoryRef.current === category;
    appliedCategoryRef.current = category;
    const timer = window.setTimeout(
      () => void setTemplateFilter(query, category),
      isSameCategory ? SEARCH_DEBOUNCE_MS : IMMEDIATE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [query, category]);

  useEffect(() => () => void setTemplateFilter("", ""), []);
}
