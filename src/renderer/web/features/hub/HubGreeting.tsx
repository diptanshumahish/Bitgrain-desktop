import React from "react";
import { AppKicker } from "../../app/shell/app-marine/AppKicker";
import { APP_DISPLAY_CLASS, APP_SERIF_ACCENT_CLASS } from "@bitgrain/ui/theme/app-marine-classes";

const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Late night";
};

interface HubGreetingProps {
  firstName: string;
}

export const HubGreeting: React.FC<HubGreetingProps> = ({ firstName }) => (
  <div className="mb-10 md:mb-12">
    <AppKicker label={`${greeting()}, ${firstName}`} />
    <h1 className={`mt-5 text-[clamp(2.5rem,5.4vw,4.25rem)] ${APP_DISPLAY_CLASS}`}>
      What are we <span className={APP_SERIF_ACCENT_CLASS}>making</span> today?
    </h1>
  </div>
);
