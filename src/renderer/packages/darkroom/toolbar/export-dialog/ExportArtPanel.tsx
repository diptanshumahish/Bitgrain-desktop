import React from "react";
import { ImageOff } from "lucide-react";
import type { OutputSnapshot } from "./read-output-snapshot";

const EMPTY_ICON_SIZE = 20;

interface ExportArtPanelProps {
  snapshot: OutputSnapshot | null;
  fileName: string;
}

export const ExportArtPanel: React.FC<ExportArtPanelProps> = ({ snapshot, fileName }) => (
  <div className="hidden md:flex w-[300px] shrink-0 flex-col bg-[var(--s-bg-input)] border-r border-[var(--s-border)]">
    <div className="flex-1 min-h-0 flex items-center justify-center p-8">
      {snapshot ? (
        <img
          src={snapshot.src}
          alt="Preview of your export"
          className="block max-w-full max-h-full object-contain rounded-[3px] border border-[var(--s-border)] bg-[var(--s-bg-panel)]"
        />
      ) : (
        <ImageOff size={EMPTY_ICON_SIZE} strokeWidth={1.5} className="text-[var(--s-text-subtle)]" />
      )}
    </div>
    <div className="flex flex-col gap-0.5 px-5 py-4 border-t border-[var(--s-border)]">
      <span className="text-[12px] font-medium text-[var(--s-text)] truncate">{fileName}</span>
      {snapshot && (
        <span className="text-[12px] text-[var(--s-text-subtle)] tabular-nums">
          {snapshot.width} × {snapshot.height} px original
        </span>
      )}
    </div>
  </div>
);
