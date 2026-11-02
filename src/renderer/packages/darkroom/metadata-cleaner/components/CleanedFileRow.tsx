import React from "react";
import { Download } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";
import type { CleanEntry } from "../store/cleaner-store";
import { downloadCleanEntry } from "../store/download-clean";
import { describeFound } from "./metadata-labels";

interface CleanedFileRowProps {
  entry: CleanEntry;
}

const rowSummary = (entry: CleanEntry): string => {
  if (entry.status === "working") return "Cleaning…";
  if (entry.status === "failed") return entry.error ?? "Could not read this image";
  if (entry.rebuilt) return "Rebuilt from pixels as a PNG, nothing hidden came along";
  if (entry.found.length === 0) return "Nothing hidden was found, the copy is clean";
  return `Removed: ${describeFound(entry.found)}`;
};

export const CleanedFileRow: React.FC<CleanedFileRowProps> = ({ entry }) => (
  <li className="flex items-center gap-3 py-2.5 border-b border-[var(--s-border)] last:border-b-0">
    <div className="flex-1 min-w-0">
      <p className="text-[12.5px] font-medium truncate">{entry.name}</p>
      <p className="text-[11.5px] text-[var(--s-text-muted)]">{rowSummary(entry)}</p>
    </div>
    <Button
      size="xs"
      variant="secondary"
      disabled={entry.status !== "done"}
      leftIcon={<Download size={12} />}
      onClick={() => downloadCleanEntry(entry)}
    >
      Download
    </Button>
  </li>
);
