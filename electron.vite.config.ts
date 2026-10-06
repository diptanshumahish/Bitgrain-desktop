import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    worker: {
      format: "es",
    },
    build: {
      chunkSizeWarningLimit: 1400,
      rollupOptions: {
        input: {
          index: resolve("src/renderer/index.html"),
          harness: resolve("src/renderer/harness.html"),
          // Separate from `harness.html` on purpose: that page is engine-only and
          // network-free so the determinism checks can assert both. This one
          // exercises the video module's pure edit logic.
          videoHarness: resolve("src/renderer/video-harness.html"),
        },
      },
    },
  },
});
