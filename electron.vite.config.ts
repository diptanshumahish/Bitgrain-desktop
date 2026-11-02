import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The web repo is a monorepo whose editors live in `packages/*` and import each
// other as `@bitgrain/<package>/<path>`. The desktop vendors those packages under
// `src/renderer/packages/`, and `@bitgrain/video` resolves to the desktop-owned
// video fork. See PORTED.md.
const RENDERER_ROOT = resolve("src/renderer");
const bitgrainWorkspaceAlias = [
  { find: /^@bitgrain\/video\/(.*)$/, replacement: `${RENDERER_ROOT}/modules/video/$1` },
  { find: /^@bitgrain\/([a-z-]+)\/(.*)$/, replacement: `${RENDERER_ROOT}/packages/$1/$2` },
];

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: bitgrainWorkspaceAlias,
    },
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
