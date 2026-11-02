import React from "react";
import { ShieldCheck } from "lucide-react";
import { openMetadataCleaner, type CleanerSource } from "../open-metadata-cleaner";

interface MetadataExportRowProps {
  source: CleanerSource;
  onBeforeOpen: () => void;
}

export const MetadataExportRow: React.FC<MetadataExportRowProps> = ({ source, onBeforeOpen }) => (
  <button
    type="button"
    onClick={() => {
      onBeforeOpen();
      openMetadataCleaner(source);
    }}
    className="group flex items-center gap-2.5 w-full px-2 py-2 rounded-md text-left hover:bg-[var(--s-bg-input)] transition-colors"
  >
    <ShieldCheck size={13} strokeWidth={1.75} className="shrink-0 text-[var(--s-text-muted)]" />
    <span className="flex flex-col gap-0.5 flex-1 min-w-0">
      <span className="text-[12px] font-medium text-[var(--s-text)]">Hidden data removed</span>
      <span className="text-[10.5px] leading-snug text-[var(--s-text-subtle)]">
        No camera details, content credentials or AI labels from your images end up in the file
      </span>
    </span>
    <span className="shrink-0 text-[11.5px] text-[var(--s-text-muted)] group-hover:text-[var(--s-text)]">Clean a file</span>
  </button>
);
