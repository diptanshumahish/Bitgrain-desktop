import React from "react";

// Desktop: web's marketing subline ("rendered in your browser. no AI, ever.") removed.
export const EmptyStateHeading: React.FC = () => (
  <div className="flex flex-col items-center text-center">
    <h1 className="font-medium text-[var(--s-text)] leading-[1.05] text-balance text-[clamp(2rem,4.5vw,3rem)]">
      drop an image, make it <span className="italic">feel printed.</span>
    </h1>
  </div>
);
