import { useCallback, useRef } from "react";
import { signal, useSignalValue } from "../../lib/signal";

export interface ColumnCountOptions {
  minColumnWidth: number;
  gapPx: number;
  minColumns: number;
  maxColumns: number;
}

interface ColumnCountResult {
  containerRef: (node: HTMLDivElement | null) => void;
  columnCount: number;
}

function countColumns(width: number, options: ColumnCountOptions): number {
  const fitting = Math.floor((width + options.gapPx) / (options.minColumnWidth + options.gapPx));
  return Math.min(options.maxColumns, Math.max(options.minColumns, fitting));
}

export function useColumnCount(options: ColumnCountOptions): ColumnCountResult {
  const countSignal = useRef(signal(options.minColumns)).current;
  const observerRef = useRef<ResizeObserver | null>(null);
  const { minColumnWidth, gapPx, minColumns, maxColumns } = options;

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;
      const settings = { minColumnWidth, gapPx, minColumns, maxColumns };
      const observer = new ResizeObserver(([entry]) => {
        countSignal.value = countColumns(entry.contentRect.width, settings);
      });
      observer.observe(node);
      observerRef.current = observer;
    },
    [countSignal, minColumnWidth, gapPx, minColumns, maxColumns],
  );

  return { containerRef, columnCount: useSignalValue(countSignal) };
}
