import { desktopPlatform } from "./desktop-platform";
import { TitleBarTabs } from "./TitleBarTabs";
import { useSignalValue } from "../lib/signal";
import { titlebarActionsSignal } from "../store/titlebar-actions-store";
import { activeTabIdSignal } from "../store/document-tabs-store";
import { AccountChip } from "./account/AccountChip";
import { AccountSettings } from "./account/AccountSettings";

const DRAG = "[-webkit-app-region:drag]";
const NO_DRAG = "[-webkit-app-region:no-drag]";

const isMac = desktopPlatform === "mac";
const isWindows = desktopPlatform === "windows";

// Only the empty regions are draggable; the tab strip and the action region are
// not inside any drag region, so clicks land on the first press instead of being
// consumed by the window-drag gesture. macOS clears the traffic lights with the
// leading spacer; Windows reserves trailing width for the overlay caption buttons
// (min/max/close), and its File/Edit/View menu lives in the native menu bar
// above this strip rather than in-window.
const leadingWidth = isMac ? "w-[86px]" : "w-3";
const trailingControls = isWindows ? "w-[140px]" : "w-0";

export function TitleBar() {
  const actionsByTab = useSignalValue(titlebarActionsSignal);
  const activeTabId = useSignalValue(activeTabIdSignal);
  const actions = actionsByTab[activeTabId] ?? null;
  return (
    <header
      data-app-titlebar
      data-os={desktopPlatform}
      className="flex h-10 shrink-0 items-center bg-[var(--s-bg-canvas)]"
    >
      <div className={`${DRAG} h-full shrink-0 ${leadingWidth}`} />
      <div className={`${DRAG} flex h-full shrink-0 items-center pr-2.5`}>
        <img
          src="/bitgrainlogo.png"
          alt="Bitgrain"
          className="h-[18px] w-[18px] rounded-[5px] object-cover"
          draggable={false}
        />
      </div>
      <TitleBarTabs />
      <div className={`${DRAG} h-full flex-1`} />
      {actions && (
        <div className={`${NO_DRAG} flex h-full shrink-0 items-center gap-1.5 pr-1.5`}>
          {actions}
        </div>
      )}
      <div className={`${NO_DRAG} flex h-full shrink-0 items-center pr-2`}>
        <AccountChip />
      </div>
      <div className={`${DRAG} h-full shrink-0 ${trailingControls}`} />
      <AccountSettings />
    </header>
  );
}
