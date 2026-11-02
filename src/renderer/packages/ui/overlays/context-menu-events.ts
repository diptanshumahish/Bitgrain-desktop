import type { LucideIcon } from "lucide-react";
import { createEventChannel } from "@bitgrain/core/events/event-channel";

const CONTEXT_MENU_KEY = "bg:context-menu";

export interface ContextMenuAction {
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  dividerBefore?: boolean;
  danger?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export interface ContextMenuEvent {
  x: number;
  y: number;
  actions: ContextMenuAction[];
}

const contextMenuChannel = createEventChannel<ContextMenuEvent | null>(CONTEXT_MENU_KEY);

export const emitContextMenu = contextMenuChannel.emit;
export const onContextMenu = contextMenuChannel.on;
