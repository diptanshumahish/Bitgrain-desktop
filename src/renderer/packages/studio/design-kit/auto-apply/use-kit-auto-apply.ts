import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { brandKitProWhenKnown } from "@bitgrain/platform/plans/gate/pro-features/brand-kit-gate";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackKit } from "../../state/design-kits-store";
import { applyKitToPages } from "./apply-kit-to-pages";
import { autoApplyKit } from "./kit-auto-apply-store";
import { consumeKitAutoApply, requestKitAutoApply, type AutoApplyReason } from "./kit-auto-apply-request";
import { waitForFreshDesign } from "./wait-for-fresh-design";

interface UseKitAutoApplyArgs {
  pages: TemplatePage[];
  setPages: (pages: TemplatePage[]) => void;
  pushHistory: () => void;
  enabled: boolean;
  applyOnOpen: boolean;
}

interface LatestArgs {
  current: UseKitAutoApplyArgs;
}

const isReady = async (reason: AutoApplyReason): Promise<boolean> => {
  if (reason === "new-design" && !(await waitForFreshDesign())) return false;
  return autoApplyKit() !== null && (await brandKitProWhenKnown());
};

const runAutoApply = async (reason: AutoApplyReason, latest: LatestArgs): Promise<void> => {
  if (!(await isReady(reason))) return;
  const kit = autoApplyKit();
  const { pages, setPages, pushHistory } = latest.current;
  if (!kit) return;
  const next = applyKitToPages(pages, kit);
  if (next === pages) return;
  pushHistory();
  setPages(next);
  trackKit("kit_applied", { token: "auto_apply", reason });
  emitStatusToast({
    title: `${kit.name} applied`,
    detail: "Your kit colors, fonts and logos are in. Undo once to see the original design.",
  });
};

export const useKitAutoApply = (args: UseKitAutoApplyArgs): void => {
  const latestRef = useRef(args);
  const openedRef = useRef(false);

  useEffect(() => {
    latestRef.current = args;
  });

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    if (latestRef.current.applyOnOpen) requestKitAutoApply("new-design");
  }, []);

  useEffect(() => {
    const reason = consumeKitAutoApply();
    if (reason && latestRef.current.enabled) void runAutoApply(reason, latestRef);
  }, [args.pages]);
};
