import { savedWorkFoundSignal, workLoadStateSignal } from "../../state/studio-load-state";

const isSettled = (): boolean => workLoadStateSignal.value !== "loading";

const isFreshDesign = (): boolean => workLoadStateSignal.value !== "failed" && !savedWorkFoundSignal.value;

export const waitForFreshDesign = (): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    if (isSettled()) {
      resolve(isFreshDesign());
      return;
    }
    const unsubscribe = workLoadStateSignal.subscribe(() => {
      if (!isSettled()) return;
      unsubscribe();
      resolve(isFreshDesign());
    });
  });
