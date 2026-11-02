import React from "react";
import { Button } from "@bitgrain/ui/components/Button";

interface LibraryGridMessageProps {
  title: string;
  detail: string;
  actionLabel: string;
  onAction: () => void;
}

export const LibraryGridMessage: React.FC<LibraryGridMessageProps> = ({ title, detail, actionLabel, onAction }) => (
  <div className="h-full min-h-[280px] flex flex-col items-center justify-center gap-3 px-6 text-center">
    <div className="flex flex-col gap-1 max-w-sm">
      <p className="text-[13.5px] font-semibold text-[var(--s-text)]">{title}</p>
      <p className="text-[12px]   text-[var(--s-text-muted)]">{detail}</p>
    </div>
    <Button size="sm" onClick={onAction}>
      {actionLabel}
    </Button>
  </div>
);
