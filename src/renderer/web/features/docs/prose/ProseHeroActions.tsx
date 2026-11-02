import React from "react";

interface ProseHeroActionsProps {
  children: React.ReactNode;
}

export const ProseHeroActions: React.FC<ProseHeroActionsProps> = ({ children }) => (
  <div className="mt-9 flex flex-col sm:flex-row gap-3">{children}</div>
);
