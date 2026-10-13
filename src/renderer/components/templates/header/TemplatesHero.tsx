import React from "react";
import { useSignalValue } from "../../../lib/signal";
import { libraryShowcaseSignal } from "../../../store/templates/library-showcase";
import { HeroCollage } from "./HeroCollage";
import { TemplateCountPill } from "./TemplateCountPill";

interface TemplatesHeroProps {
  isPending: boolean;
}

export const TemplatesHero: React.FC<TemplatesHeroProps> = ({ isPending }) => {
  const library = useSignalValue(libraryShowcaseSignal);
  return (
    <header className="mx-auto grid max-w-[1500px] items-center gap-8 px-6 pb-8 pt-8 md:grid-cols-[1.2fr_1fr] md:px-8 md:pb-6 md:pt-6">
      <div>
        <p className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">Template library</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.02] text-zinc-900 md:text-[48px] dark:text-zinc-50">
          Start from a template
        </h1>
        <p className="mt-4 max-w-[480px] text-[14px] leading-[1.6] text-zinc-500 md:text-[16px] dark:text-zinc-400">
          Album covers, posters, wallpapers, social cards and more. Pick one and make it yours in the Studio.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <TemplateCountPill total={library.total} isPending={isPending} />
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-700 md:hidden dark:bg-amber-950/30 dark:text-amber-500">
            Desktop recommended for editing
          </span>
        </div>
      </div>
      <HeroCollage templates={library.showcase} isPending={isPending} />
    </header>
  );
};
