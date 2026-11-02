import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { activeKit, trackKit } from "../../state/design-kits-store";
import { onBrandFix } from "./brand-fix-events";
import { fixBrandIssues } from "./fix-brand-issues";

interface UseBrandFixArgs {
  pages: TemplatePage[];
  setPages: (pages: TemplatePage[]) => void;
  pushHistory: () => void;
}

export const useBrandFix = (args: UseBrandFixArgs): void => {
  const latestRef = useRef(args);

  useEffect(() => {
    latestRef.current = args;
  });

  useEffect(
    () =>
      onBrandFix((issues) => {
        const kit = activeKit();
        const { pages, setPages, pushHistory } = latestRef.current;
        if (!kit || issues.length === 0) return;
        const next = fixBrandIssues(pages, issues, kit.textStyles);
        if (next === pages) return;
        pushHistory();
        setPages(next);
        trackKit("kit_applied", { token: "brand_fix", count: issues.length });
      }),
    [],
  );
};
