import React from "react";

export const HomeFooter: React.FC = () => (
  <div className="hidden md:flex absolute bottom-4 right-5 z-40 items-center gap-3 font-editorial">
    <a
      href="/recipes"
      className="text-[9px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
    >
      Community recipes
    </a>
    <a
      href="/privacy"
      className="text-[9px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
    >
      Privacy Policy
    </a>
    <a
      href="/terms"
      className="text-[9px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
    >
      Terms
    </a>
    <span className="text-[9px] text-zinc-400 dark:text-zinc-600 select-none">
      © bitgrain 2026 · no AI, deterministic algorithms only
    </span>
  </div>
);
