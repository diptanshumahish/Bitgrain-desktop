import { app } from "electron";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);

interface HapticsAddon {
  perform(pattern: number): void;
}

let addon: HapticsAddon | null = null;
let attempted = false;

const load = (): HapticsAddon | null => {
  if (attempted) return addon;
  attempted = true;
  if (process.platform !== "darwin") return null;
  try {
    const modulePath = join(
      app.getAppPath(),
      "native/haptics/build/Release/haptics.node",
    );
    addon = require(modulePath) as HapticsAddon;
  } catch {
    addon = null;
  }
  return addon;
};

// Fires a Force Touch trackpad haptic. No-ops off macOS, when the addon is not
// built, or on hardware without an actuator. Never throws into the caller.
export const performHaptic = (pattern: number): void => {
  try {
    load()?.perform(pattern);
  } catch {
    // haptics are non-essential polish, never surface a failure
  }
};
