import React from "react";
import { Check } from "lucide-react";
import { PanelGroup } from "../ui/panel-group";
import { useSignalValue } from "../../../lib/signal";
import { activeKitIdSignal, designKitsSignal, setActiveKit } from "../../../store/design-kits-store";

const KIT_SWATCH_LIMIT = 8;

export const DesignKitList: React.FC = () => {
  const kits = useSignalValue(designKitsSignal);
  const activeKitId = useSignalValue(activeKitIdSignal);

  return (
    <PanelGroup title="Design kit">
      {kits.length === 0 && (
        <span className="text-[11px] text-[var(--s-text-subtle)]">No kits yet. Create one from the Kit menu.</span>
      )}
      <div className="flex flex-col gap-1.5">
        {kits.map((kit) => {
          const active = kit.id === activeKitId;
          return (
            <button
              key={kit.id}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveKit(kit.id)}
              className={`flex flex-col gap-2.5 rounded-lg p-2.5 text-left transition-colors border ${
                active
                  ? "border-[var(--s-border)] bg-[var(--s-bg-input)]"
                  : "border-transparent bg-[var(--s-bg-input)]/60 hover:bg-[var(--s-bg-input)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-medium text-[var(--s-text)] truncate">{kit.name}</span>
                {active ? (
                  <span className="w-4 h-4 rounded-full bg-[var(--s-accent)] text-[var(--s-accent-text)] flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--s-text-subtle)] shrink-0">
                    {kit.colors.length} {kit.colors.length === 1 ? "colour" : "colours"}
                  </span>
                )}
              </div>
              <div className="flex h-3 rounded-full overflow-hidden border border-[var(--s-border)]">
                {kit.colors.slice(0, KIT_SWATCH_LIMIT).map((color) => (
                  <span key={color.id} title={color.name} className="flex-1" style={{ backgroundColor: color.value }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </PanelGroup>
  );
};
