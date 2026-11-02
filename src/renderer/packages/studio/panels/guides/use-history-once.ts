import { useRef } from "react";

interface HistoryOnce {
  takeRecord: () => boolean;
  reset: () => void;
}

export function useHistoryOnce(): HistoryOnce {
  const recordedRef = useRef(false);
  return {
    takeRecord: () => {
      if (recordedRef.current) return false;
      recordedRef.current = true;
      return true;
    },
    reset: () => {
      recordedRef.current = false;
    },
  };
}
