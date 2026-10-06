/// <reference types="vite/client" />

import type { BitgrainBridge } from "../shared/bridge";

declare global {
  interface Window {
    bitgrain?: BitgrainBridge;
  }
}

export {};
