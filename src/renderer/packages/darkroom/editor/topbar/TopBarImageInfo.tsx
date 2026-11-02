import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { imageMetaSignal, isSampleSignal } from "../../state/image-store";
import { formatImageMetaParts } from "./format-image-meta";

const EMPTY_TITLE = "Photo effects";
const SAMPLE_TITLE = "Sample image";

export const TopBarImageInfo: React.FC = () => {
  const meta = useSignalValue(imageMetaSignal);
  const isSample = useSignalValue(isSampleSignal);
  const title = isSample ? SAMPLE_TITLE : meta?.name ?? EMPTY_TITLE;
  const parts = meta ? formatImageMetaParts(meta) : [];

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[12px] font-medium text-[var(--s-text)] truncate max-w-[220px]" title={title}>
        {title}
      </span>
      {parts.map((part) => (
        <React.Fragment key={part}>
          <span className="hidden xl:block w-px h-3 bg-[var(--s-border)] shrink-0" aria-hidden />
          <span className="hidden xl:inline text-[12px] text-[var(--s-text-subtle)] shrink-0 tabular-nums">{part}</span>
        </React.Fragment>
      ))}
    </div>
  );
};
