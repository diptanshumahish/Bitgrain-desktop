import { CodeXml, ImageDown } from "lucide-react";
import type { ContextMenuAction } from "@bitgrain/ui/overlays/context-menu-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { MOD_SHIFT_KEY } from "../../../editor/shortcut-labels";
import { copySelectionAs } from "./copy-selection";

const tracked = (action: string, handler: () => void) => (): void => {
  trackEvent("studio", "context_menu_action", { details: { action } });
  handler();
};

export const copyAsMenuActions = (ids: string[]): ContextMenuAction[] => [
  {
    label: "Copy as PNG", icon: ImageDown, shortcut: `${MOD_SHIFT_KEY}C`,
    onClick: tracked("copy_as_png", () => void copySelectionAs("png", ids)),
  },
  { label: "Copy as SVG", icon: CodeXml, onClick: tracked("copy_as_svg", () => void copySelectionAs("svg", ids)) },
];
