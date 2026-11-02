import React from "react";
import { distributeIntoColumns } from "./distribute-columns";
import { useColumnCount } from "./use-column-count";

export type MasonryGap = "gap-3" | "gap-4";

const GAP_PX: Record<MasonryGap, number> = {
  "gap-3": 12,
  "gap-4": 16,
};

interface MasonryGridProps<T> {
  items: T[];
  getKey: (item: T) => string;
  getHeightRatio: (item: T) => number;
  renderItem: (item: T, index: number) => React.ReactNode;
  minColumnWidth: number;
  gap: MasonryGap;
  minColumns?: number;
  maxColumns?: number;
  className?: string;
}

const DEFAULT_MIN_COLUMNS = 1;
const DEFAULT_MAX_COLUMNS = 8;

export function MasonryGrid<T>({
  items,
  getKey,
  getHeightRatio,
  renderItem,
  minColumnWidth,
  gap,
  minColumns = DEFAULT_MIN_COLUMNS,
  maxColumns = DEFAULT_MAX_COLUMNS,
  className = "",
}: MasonryGridProps<T>): React.ReactElement {
  const { containerRef, columnCount } = useColumnCount({
    minColumnWidth,
    gapPx: GAP_PX[gap],
    minColumns,
    maxColumns,
  });
  const indexByKey = new Map(items.map((item, index) => [getKey(item), index]));
  const columns = distributeIntoColumns(items, columnCount, getHeightRatio);

  return (
    <div ref={containerRef} className={`flex items-start ${gap} ${className}`}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex min-w-0 flex-1 flex-col">
          {column.map((item) => (
            <React.Fragment key={getKey(item)}>
              {renderItem(item, indexByKey.get(getKey(item)) ?? 0)}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
