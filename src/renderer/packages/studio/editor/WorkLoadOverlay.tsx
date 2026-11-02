import React from "react";
import { Loader2 } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { workLoadStateSignal } from "../state/studio-load-state";
import { Button } from "@bitgrain/ui/components/Button";

interface WorkLoadOverlayProps {
  onRetry: () => void;
  onBack: () => void;
}

const LOADER_SIZE = 18;

const LoadingMessage: React.FC = () => (
  <div className="flex items-center gap-2.5 text-[13px] text-[var(--s-text-muted)]">
    <Loader2 size={LOADER_SIZE} className="animate-spin" />
    Opening your design
  </div>
);

const LoadErrorMessage: React.FC<WorkLoadOverlayProps> = ({ onRetry, onBack }) => (
  <div role="alert" className="flex max-w-sm flex-col items-center gap-4 text-center">
    <div className="flex flex-col gap-1.5">
      <h2 className="text-[16px] font-semibold text-[var(--s-text)]">We couldn't open this design</h2>
      <p className="text-[13px]   text-[var(--s-text-muted)]">
        Your work is safe. We just couldn't reach it right now, so nothing has been changed or saved over it.
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onBack}>
        Back to designs
      </Button>
      <Button variant="primary" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  </div>
);

export const WorkLoadOverlay: React.FC<WorkLoadOverlayProps> = ({ onRetry, onBack }) => {
  const loadState = useSignalValue(workLoadStateSignal);
  if (loadState !== "loading" && loadState !== "failed") return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-[var(--s-bg-canvas)] px-4">
      {loadState === "loading" ? <LoadingMessage /> : <LoadErrorMessage onRetry={onRetry} onBack={onBack} />}
    </div>
  );
};
