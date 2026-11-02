import React from "react";

export const WelcomeBackdrop: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(240,230,196,0.09),transparent_70%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(240,230,196,0.07)_0.6px,transparent_1px)] bg-[size:3px_3px]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.7))]" />
  </div>
);
