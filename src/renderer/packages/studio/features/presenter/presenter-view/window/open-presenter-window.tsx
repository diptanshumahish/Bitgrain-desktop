import { createRoot, type Root } from "react-dom/client";
import { PresenterView } from "../ui/presenter-view";
import { preparePresenterDocument } from "./prepare-presenter-document";

const PRESENTER_WINDOW_NAME = "bitgrain-presenter";
const PRESENTER_WINDOW_FEATURES = "popup,width=1280,height=800";

const mountedRoots = new WeakMap<Window, Root>();

const mountPresenterView = (presenterWindow: Window, sessionId: string): void => {
  mountedRoots.get(presenterWindow)?.unmount();
  const root = createRoot(preparePresenterDocument(presenterWindow.document));
  root.render(<PresenterView sessionId={sessionId} hostWindow={presenterWindow} />);
  mountedRoots.set(presenterWindow, root);
  presenterWindow.addEventListener(
    "pagehide",
    () => {
      root.unmount();
      mountedRoots.delete(presenterWindow);
    },
    { once: true },
  );
};

export const openPresenterWindow = (sessionId: string): Window | null => {
  const presenterWindow = window.open("", PRESENTER_WINDOW_NAME, PRESENTER_WINDOW_FEATURES);
  if (!presenterWindow) return null;
  mountPresenterView(presenterWindow, sessionId);
  return presenterWindow;
};
