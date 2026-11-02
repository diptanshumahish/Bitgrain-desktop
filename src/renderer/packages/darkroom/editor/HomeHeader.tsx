import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useHubPath } from "@bitgrain/ui/shell/shell-config";
import { UserAvatar } from "@bitgrain/platform/account/UserAvatar";
import { toggleTheme } from "@bitgrain/ui/theme/global-theme-store";
import { MobileTopBarButton } from "./mobile-topbar/MobileTopBarButton";
import { MobileHistoryButtons } from "./mobile-topbar/MobileHistoryButtons";

interface HomeHeaderProps {
  isDark: boolean;
  hasImage: boolean;
}

const ICON_SIZE = 18;
const ICON_STROKE = 1.75;

export const HomeHeader: React.FC<HomeHeaderProps> = ({ isDark, hasImage }) => {
  const navigate = useNavigate();
  const hubPath = useHubPath();
  return (
    <header className="md:hidden h-12 shrink-0 flex items-center justify-between gap-2 px-1 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial">
      <div className="flex items-center min-w-0">
        <MobileTopBarButton label="Back to hub" onClick={() => navigate(hubPath)}>
          <ArrowLeft size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </MobileTopBarButton>
        {hasImage ? <MobileHistoryButtons /> : <span className="text-[15px] font-medium text-[var(--s-text)]">Photo effects</span>}
      </div>
      <div className="flex items-center gap-1 pr-2 shrink-0">
        <MobileTopBarButton label={isDark ? "Switch to light" : "Switch to dark"} onClick={toggleTheme}>
          {isDark ? <Sun size={ICON_SIZE} strokeWidth={ICON_STROKE} /> : <Moon size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        </MobileTopBarButton>
        <UserAvatar />
      </div>
    </header>
  );
};
