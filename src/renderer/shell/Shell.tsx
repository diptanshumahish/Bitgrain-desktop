import { useEffect, useRef, type ReactNode } from "react";
import { TitleBar } from "./TitleBar";
import { isDesktop, desktopPlatform } from "./desktop-platform";
import { leftRailElementSignal } from "../store/left-rail-store";

// macOS masks the window to ~10px rounded corners; clip the content to match so
// the chrome follows the window shape instead of showing square corners.
const windowRounding = desktopPlatform === "mac" ? "rounded-[10px]" : "";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  if (!isDesktop) return <>{children}</>;
  return <DesktopShell>{children}</DesktopShell>;
}

// The tabs title bar spans the full width at the top. Below it, the active
// surface's options panel (portaled into the rail) runs full height on the left,
// and the surface's own content (studio strip, canvas, right panel) fills the
// column to its right — so the secondary bar starts after the panel.
function DesktopShell({ children }: ShellProps) {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    leftRailElementSignal.value = railRef.current;
    return () => {
      leftRailElementSignal.value = null;
    };
  }, []);

  return (
    <div className={`flex h-screen w-full flex-col overflow-hidden bg-[var(--s-bg-canvas)] ${windowRounding}`}>
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <div ref={railRef} className="flex h-full shrink-0" />
        <div className="relative min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
