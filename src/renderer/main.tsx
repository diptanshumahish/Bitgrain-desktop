import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@bitgrain/ui/theme/global-theme-store";
import { installNativeDragBlock } from "@bitgrain/ui/native-drag/block-native-drag";
import { configureShell } from "@bitgrain/ui/shell/shell-config";
import { registerDocLinks } from "@bitgrain/studio/features/command-palette/entries/doc-links";
import { installNativeDownloads } from "./shell/native-downloads";
import { DESKTOP_HUB_PATH } from "./shell/home/desktop-paths";
import { DESKTOP_DOC_LINKS } from "./shell/home/desktop-doc-links";
import App from "./App";

// Desktop counterpart of web's apps/web/src/main.tsx. No service worker, SEO,
// referral capture or chunk-reload recovery. Editors get no workspace switcher
// (tabs replace it), and "back to hub" activates the home tab (HomeSurface).
installNativeDownloads();
installNativeDragBlock();
configureShell({ hubPath: DESKTOP_HUB_PATH });
registerDocLinks(DESKTOP_DOC_LINKS);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
