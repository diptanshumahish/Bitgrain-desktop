import React from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { paletteOpenSignal } from "../state/palette-store";
import { usePaletteShortcut } from "../state/use-palette-shortcut";
import { CommandPaletteDialog } from "./CommandPaletteDialog";

export const CommandPalettePortal: React.FC = () => {
  const open = useSignalValue(paletteOpenSignal);
  usePaletteShortcut();

  if (!open) return null;
  return createPortal(<CommandPaletteDialog />, document.body);
};
