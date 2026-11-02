import React from "react";
import { Zap } from "lucide-react";

interface ExportPackNoteProps {
  balance: number;
}

export const ExportPackNote: React.FC<ExportPackNoteProps> = ({ balance }) => (
  <div className="flex items-start gap-2 bg-[var(--s-accent-soft)] text-[var(--s-accent)] border border-[var(--s-accent)]/30 px-2.5 py-2 w-full rounded-lg">
    <Zap size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
    <span className="flex flex-col gap-0.5">
      <span className="text-[12px] font-medium leading-tight">This export is full resolution</span>
      <span className="text-[12px] opacity-75 leading-snug">
        It uses one from your pack, {balance} left
      </span>
    </span>
  </div>
);
