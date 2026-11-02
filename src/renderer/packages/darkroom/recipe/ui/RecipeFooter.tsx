import React, { memo } from "react";
import { LayoutTemplate } from "lucide-react";
import { pushHistory } from "../../state/history-store";
import { Button } from "@bitgrain/ui/components/Button";
import { SurpriseButton } from "../../styles/ui/SurpriseButton";
import { ensureStyleMode } from "../../toolbar/inspector/look/look-actions";
import { openPresets } from "../recipe-selection";

const SURPRISE_CLASS =
  "h-8 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--s-bg-input)] text-[12px] font-medium text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors";

const startFromSurprise = (): void => {
  ensureStyleMode();
  pushHistory();
};

const RecipeFooterView: React.FC = () => (
  <div className="shrink-0 flex flex-col gap-2 px-3 py-3 border-t border-[var(--s-border)]">
    <p className="text-[12px] text-[var(--s-text-muted)] px-1">Start over from</p>
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" size="sm" leftIcon={<LayoutTemplate size={13} strokeWidth={1.75} />} onClick={openPresets}>
        A preset
      </Button>
      <SurpriseButton onCommit={startFromSurprise} className={SURPRISE_CLASS} />
    </div>
  </div>
);

export const RecipeFooter = memo(RecipeFooterView);
