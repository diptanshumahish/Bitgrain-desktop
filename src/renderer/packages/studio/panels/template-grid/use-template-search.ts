import { useEffect, useRef, useState } from "react";
import { setTemplateFilter } from "@bitgrain/platform/templates/store/templates-store";

const SEARCH_DEBOUNCE_MS = 250;
const ALL_CATEGORIES = "";

interface TemplateSearch {
  query: string;
  searching: boolean;
  setQuery: (value: string) => void;
}

export const useTemplateSearch = (): TemplateSearch => {
  const [query, setQueryState] = useState("");
  const [settledQuery, setSettledQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef("");

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const setQuery = (value: string): void => {
    setQueryState(value);
    latestRef.current = value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runSearch(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const runSearch = async (value: string): Promise<void> => {
    await setTemplateFilter(value, ALL_CATEGORIES);
    if (latestRef.current === value) setSettledQuery(value);
  };

  return { query, searching: query.trim() !== settledQuery.trim(), setQuery };
};
