import React from "react";
import type { DropdownOption } from "../../../ui/dropdown";
import { Dropdown } from "../../../ui/dropdown";
import { PaintRowControls } from "../PaintRowControls";

const ignoreMove = (): void => undefined;

interface EffectRowProps {
  kind: string;
  kinds: DropdownOption[];
  visible: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onKindChange: (kind: string) => void;
  onToggleVisible: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}

export const EffectRow: React.FC<EffectRowProps> = ({
  kind, kinds, visible, canMoveUp, canMoveDown, onKindChange, onToggleVisible, onMoveUp, onMoveDown, onRemove, children,
}) => (
  <div className={`flex flex-col gap-2 rounded-lg border border-[var(--s-border)] p-2 ${visible ? "" : "opacity-50"}`}>
    <div className="flex items-center gap-1.5">
      <div className="flex-1 min-w-0">
        <Dropdown options={kinds} value={kind} onChange={onKindChange} />
      </div>
      <PaintRowControls
        visible={visible}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onToggleVisible={onToggleVisible}
        onMoveUp={onMoveUp ?? ignoreMove}
        onMoveDown={onMoveDown ?? ignoreMove}
        onRemove={onRemove}
      />
    </div>
    {children}
  </div>
);
