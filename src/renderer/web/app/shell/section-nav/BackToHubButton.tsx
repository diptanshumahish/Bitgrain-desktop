import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { trackEvent } from "@bitgrain/platform/tracker";
import { HUB_DESTINATION } from "./section-destinations";

interface BackToHubButtonProps {
  className?: string;
}

const DEFAULT_CLASS =
  "flex items-center gap-1 h-7 pl-1.5 pr-2 rounded-md text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-900/5 dark:hover:bg-white/5 transition-colors";

export const BackToHubButton: React.FC<BackToHubButtonProps> = ({ className = DEFAULT_CLASS }) => {
  const navigate = useNavigate();
  const goToHub = (): void => {
    trackEvent("nav", "back_to_hub_clicked");
    navigate(HUB_DESTINATION.to);
  };
  return (
    <button type="button" onClick={goToHub} aria-label="Back to hub" title="Back to hub" className={className}>
      <ArrowLeft size={12} strokeWidth={1.75} />
      <span>Hub</span>
    </button>
  );
};
