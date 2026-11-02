import React from "react";
import { useNavigate } from "react-router-dom";
import type { HubDestination } from "../../../landing/HubDestinations";
import { leaveWelcome } from "../welcome-store";
import { followLink } from "../../../../app/routes/follow-link";

interface ChooseOptionProps {
  destination: HubDestination;
  body: string;
}

export const ChooseOption: React.FC<ChooseOptionProps> = ({ destination, body }) => {
  const navigate = useNavigate();
  const Icon = destination.icon;

  const handleChoose = (): void => {
    leaveWelcome(destination.key);
    followLink(destination.to, navigate);
  };

  return (
    <button
      type="button"
      data-option
      onClick={handleChoose}
      className="group flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-[0_30px_60px_-30px_rgba(20,18,90,0.6)] transition-[background-color,translate] duration-300 hover:-translate-y-1 hover:bg-apricot md:flex-col md:items-start md:gap-12 md:p-6"
    >
      <Icon size={22} strokeWidth={1.75} className="shrink-0 text-ultramarine" />
      <span>
        <span className="block text-lg font-medium tracking-[-0.02em] text-ultramarine">{destination.title}</span>
        <span className="mt-1 block text-pretty text-sm leading-snug text-ink-soft/70">{body}</span>
      </span>
    </button>
  );
};
