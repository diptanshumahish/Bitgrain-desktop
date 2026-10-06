import React from 'react'
import {
  MoreHorizontal, ChevronUp, ChevronDown,
  FlipHorizontal, FlipVertical, Trash2, PanelRightClose,
} from 'lucide-react'
import { emitPopover } from '../../../lib/event-bus'

export interface LayerOptionsHandlers {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onDelete: () => void;
}

export const LayerOptionsMenu: React.FC<LayerOptionsHandlers> = ({
  onMoveUp, onMoveDown, onFlipH, onFlipV, onDelete,
}) => (
  <button
    type="button"
    aria-label="Layer options"
    className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors shrink-0"
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      emitPopover({
        type: 'tool-dropdown',
        anchorRect: rect,
        content: (
          <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-1 flex flex-col min-w-[180px] font-editorial">
            <button onClick={onMoveUp} className="flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] hover:bg-[var(--s-bg-input)] rounded-lg transition-colors text-[var(--s-text)]">
              <ChevronUp size={13} strokeWidth={1.75} /> Move layer up
            </button>
            <button onClick={onMoveDown} className="flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] hover:bg-[var(--s-bg-input)] rounded-lg transition-colors text-[var(--s-text)]">
              <ChevronDown size={13} strokeWidth={1.75} /> Move layer down
            </button>
            <div className="h-px bg-[var(--s-border)] my-1" />
            <button onClick={onFlipH} className="flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] hover:bg-[var(--s-bg-input)] rounded-lg transition-colors text-[var(--s-text)]">
              <FlipHorizontal size={13} strokeWidth={1.75} /> Flip horizontal
            </button>
            <button onClick={onFlipV} className="flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] hover:bg-[var(--s-bg-input)] rounded-lg transition-colors text-[var(--s-text)]">
              <FlipVertical size={13} strokeWidth={1.75} /> Flip vertical
            </button>
            <div className="h-px bg-[var(--s-border)] my-1" />
            <button onClick={onDelete} className="flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] hover:bg-red-500/10 rounded-lg transition-colors text-red-500">
              <Trash2 size={13} strokeWidth={1.75} /> Delete layer
            </button>
          </div>
        ),
      });
    }}
  >
    <MoreHorizontal size={14} strokeWidth={1.75} />
  </button>
);

interface RightPanelHeaderProps {
  title: string;
  onCollapse: () => void;
  action?: React.ReactNode;
}

export const RightPanelHeader: React.FC<RightPanelHeaderProps> = ({ title, onCollapse, action }) => (
  <div className="pl-2 pr-3 h-11 border-b border-[var(--s-border)] flex items-center gap-2 shrink-0 bg-[var(--s-bg-panel)]">
    <button
      type="button"
      onClick={onCollapse}
      aria-label="Hide right panel"
      title="Hide right panel"
      className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors shrink-0"
    >
      <PanelRightClose size={15} strokeWidth={1.75} />
    </button>
    <span className="text-[13px] font-medium text-[var(--s-text)] leading-none flex-1 truncate">
      {title}
    </span>
    {action}
  </div>
);
