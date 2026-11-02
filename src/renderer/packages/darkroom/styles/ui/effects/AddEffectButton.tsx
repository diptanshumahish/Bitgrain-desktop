import React from "react";
import { Plus } from "lucide-react";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { effectGroups, type EffectGroup } from "./effect-groups";

interface AddEffectButtonProps {
  activeKeys: ReadonlySet<string>;
  onAdd: (key: string) => void;
}

const closeMenu = (): void => emitPopover(null);

const EFFECT_MENU_CLASS = "w-60 max-h-[70vh] overflow-y-auto bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-1.5 font-editorial";

interface EffectMenuProps {
  groups: readonly EffectGroup[];
  onPick: (key: string) => void;
  className?: string;
}

export const EffectMenu: React.FC<EffectMenuProps> = ({ groups, onPick, className = EFFECT_MENU_CLASS }) => (
  <div className={className}>
    {groups.map((group) => (
      <div key={group.label} className="pb-1">
        <p className="px-2 pt-2 pb-1 text-[12px] font-semibold text-[var(--s-text-subtle)]">{group.label}</p>
        {group.effects.map((effect) => (
          <button key={effect.key} type="button" onClick={() => onPick(effect.key)}
            className="w-full flex flex-col items-start px-2 py-1.5 rounded-md text-left hover:bg-[var(--s-bg-input-hover)]">
            <span className="text-[12px] font-medium text-[var(--s-text)]">{effect.label}</span>
            <span className="text-[12px] text-[var(--s-text-subtle)] truncate max-w-full">{effect.hint}</span>
          </button>
        ))}
      </div>
    ))}
  </div>
);

export const AddEffectButton: React.FC<AddEffectButtonProps> = ({ activeKeys, onAdd }) => {
  const pick = (key: string): void => {
    onAdd(key);
    closeMenu();
  };
  const open = (event: React.MouseEvent<HTMLButtonElement>): void => {
    emitPopover({ type: "side-menu", anchorRect: event.currentTarget.getBoundingClientRect(), content: <EffectMenu groups={effectGroups(activeKeys)} onPick={pick} /> });
  };
  return (
    <button type="button" onClick={open} data-tutorial="home-print"
      className="w-full h-9 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--s-border)] text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:border-[var(--s-border-hover)] transition-colors">
      <Plus size={13} />
      Add effect
    </button>
  );
};
