import React from "react";

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
  <h1 className="mb-6 font-editorial text-3xl font-medium leading-tight text-[var(--s-text)] md:text-4xl">
    {greeting()}, {firstName}. <span className="text-[var(--s-text-muted)]">What are we making?</span>
  </h1>
);
