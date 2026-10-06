import React, { useEffect, useRef } from "react";
import { Palette } from "lucide-react";
import { signal, useSignalValue } from "../../../lib/signal";
import type { Layer } from "../../../data/studioTypes";
import type { TextStyleVariable, NumberToken } from "../../../data/design-kit-types";
import { DesignKitPanel } from "../design-kit/DesignKitPanel";

const openSignal = signal(false);

interface TopBarDesignKitProps {
  selectedLayer: Layer | null;
  selectedLayerIds: string[];
  onApplyKitColor: (varId: string, hex: string) => void;
  onApplyKitTextStyle: (style: TextStyleVariable) => void;
  onApplyKitNumber: (token: NumberToken) => void;
  onVariableColorChange: (varId: string, hex: string) => void;
}

export const TopBarDesignKit: React.FC<TopBarDesignKitProps> = (props) => {
  const open = useSignalValue(openSignal);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (ref.current?.contains(target)) return;
      if (target?.closest("[data-popover-root]")) return;
      openSignal.value = false;
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative h-full flex items-center">
      <button
        type="button"
        onClick={() => { openSignal.value = !openSignal.value; }}
        title="Design kit"
        className={`flex items-center gap-1.5 px-2 h-7 rounded-md border-none cursor-pointer text-[12px] font-medium transition-colors ${
          open
            ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
            : "bg-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
        }`}
      >
        <Palette size={13} strokeWidth={1.75} />
        <span>Kit</span>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 w-[300px] max-h-[72vh] overflow-y-auto no-scrollbar bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl z-[200] font-editorial">
          <DesignKitPanel {...props} />
        </div>
      )}
    </div>
  );
};
