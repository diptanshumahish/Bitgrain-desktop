import type { ReactNode } from "react";
import { TitleBar } from "./TitleBar";
import { isDesktop, desktopPlatform } from "./desktop-platform";

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

// The tabs title bar spans the full width at the top; the active surface fills
// everything below it. Each editor brings its own web top bar and panels.
function DesktopShell({ children }: ShellProps) {
  return (
    <div className={`flex h-screen w-full flex-col overflow-hidden bg-[var(--s-bg-canvas)] ${windowRounding}`}>
      <TitleBar />
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
