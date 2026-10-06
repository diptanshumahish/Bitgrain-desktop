import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useSignalValue } from "../../lib/signal";
import { leftRailElementSignal } from "../../store/left-rail-store";

// Portals a surface's options panel into the shell's full-height left rail, but
// only while that surface is the active one. Because every surface stays mounted,
// `active` is what keeps a hidden surface from also filling the shared rail. The
// panel lives in the caller's render tree, so its state and handlers are normal.
export function LeftRailPortal({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const element = useSignalValue(leftRailElementSignal);
  if (!active || !element) return null;
  return createPortal(children, element);
}
