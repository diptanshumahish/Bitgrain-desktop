import React from "react";
import { PanelGroup } from "../ui/panel-group";
import { QUICK_SHORTCUT_GROUPS } from "../panels/studio-shortcuts";

export const QuickKeysGrid: React.FC = () => (
  <PanelGroup title="Quick keys">
    <div className="flex flex-col gap-3.5">
      {QUICK_SHORTCUT_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium text-[var(--s-text-subtle)]">{group.title}</span>
          <div className="grid grid-cols-2 gap-1">
            {group.items.map((item) => (
              <div
                key={item.keys + item.label}
                className="h-7 px-2 rounded-md bg-[var(--s-bg-input)]/60 flex items-center justify-between gap-1.5 min-w-0"
              >
                <span className="text-[10.5px] text-[var(--s-text-muted)] truncate">{item.label}</span>
                <kbd className="text-[10px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums] shrink-0">
                  {item.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </PanelGroup>
);
