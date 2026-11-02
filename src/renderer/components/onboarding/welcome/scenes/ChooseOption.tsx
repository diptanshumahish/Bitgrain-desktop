import React from "react";
import { useNavigate } from "react-router-dom";
import type { HubDestination } from "../../../../pages/landing-page/HubDestinations";
import { leaveWelcome } from "../welcome-store";

interface ChooseOptionProps {
  destination: HubDestination;
  body: string;
}

export const ChooseOption: React.FC<ChooseOptionProps> = ({ destination, body }) => {
  const navigate = useNavigate();
  const Icon = destination.icon;

  const handleChoose = (): void => {
    leaveWelcome(destination.key);
    navigate(destination.to);
  };

  return (
    <button
      type="button"
      data-option
      onClick={handleChoose}
      className="group flex flex-col items-start gap-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-md transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.09] md:gap-12 md:p-6"
    >
      <Icon size={22} strokeWidth={1.6} className="text-white/60 transition-colors duration-300 group-hover:text-white" />
      <span>
        <span className="block text-lg font-medium text-white">{destination.title}</span>
        <span className="mt-1 block text-pretty text-sm leading-snug text-white/50">{body}</span>
      </span>
    </button>
  );
};
