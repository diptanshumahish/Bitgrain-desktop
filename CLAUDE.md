# Bitgrain Desktop, Developer Guide (CLAUDE.md)

This repo inherits the coding standards of the web repo (`/Users/diptanshumahish/personal/imgi/CLAUDE.md`). Those rules apply here in full. What follows are the rules specific to the desktop app.

NO INSTRUCTION OF THIS DOCUMENT SHOULD BE DISOBEYED.

## Commands

- **Typecheck**: `npm run typecheck`
- **Build**: `npm run build`
- **Verify (the gate)**: `npm run verify`, runs build, smoke, and render-check
- **Lint**: `npm run lint`

Run `npm run verify` before every commit. A red render-check means output determinism broke, which is the one failure this project cannot ship.

## The hard rule

**Never edit pixel math in `src/renderer/packages/engine/`** (the web repo's `packages/engine`, imported as `@bitgrain/engine/...`). It is ported verbatim from the web repo and it is the brand promise: same input, same settings, same output, forever. If engine code looks like it needs changing, the surrounding shell is wrong instead.

As of the 2026-11-02 re-sync the engine has no deviations: native saves are handled outside it by `shell/native-downloads.ts`. Any future deviation must be recorded in `PORTED.md`, or it will be silently lost on the next re-sync from the web repo.

## The video module is forked

`src/renderer/modules/video/` is desktop-owned as of 2026-07-26 and is no longer kept in sync with the web repo. Change it freely; do not "restore parity" with the web version. Its architecture (worker-pool preview, render cache, background pre-render, tool modes) is documented in `PORTED.md`. The engine rule below still binds it: nothing in `modules/video` may edit pixel math in `src/renderer/packages/engine/`. The fork also serves the `@bitgrain/video/*` alias.

## Porting files from the web repo

1. Copy, do not retype. Retyping invites drift.
2. Compute the transitive import closure first, then copy exactly that set. Do not bulk-copy `src`.
3. Strip on arrival: analytics calls, payment loaders and modals, SEO and Helmet, service worker code, PWA config, marketing pages.
4. Record every ported subtree and every deviation in `PORTED.md`.
5. The web repo is a monorepo (since 2026-10-28). `packages/<p>/src/x` maps to `src/renderer/packages/<p>/x` and keeps its `@bitgrain/<p>/x` imports (alias in `tsconfig.web.json` and `electron.vite.config.ts`); `apps/web/src/x` maps to `src/renderer/web/x`. Never rewrite imports when copying. `scripts/sync/port.py` copies a closure, `scripts/sync/prune.py` drops what nothing reaches.

## Process boundaries

- **Main process** (`src/main/`): Node, filesystem, dialogs, SQLite, license verification. Never trusts the renderer.
- **Preload** (`src/preload/`): the only bridge. Expose narrow, typed functions through `contextBridge`, never raw `ipcRenderer`, never Node built-ins.
- **Renderer** (`src/renderer/`): the app. `contextIsolation` on, `nodeIntegration` off. Treat it as a browser.
- **Shared** (`src/shared/`): types only, no runtime Node or DOM dependency.

New IPC goes in `src/shared/bridge.ts` first (channel name plus types), then the main handler, then the preload method. All three or none.

## Online is now required (auth gate)

> **Superseded (2026-07-25):** the desktop app now **requires sign-in** against the prod backend `https://api.bitgrain.app`, strict online-only — no session, no entry. This is a deliberate product decision that overrides the offline-first stance below for the app **shell**. The **engine** stays offline-deterministic: `render-check`/`parallel-check` run `harness.html` (engine only, no network) and still enforce no-network + byte-identical output. See `PORTED.md` for the auth/backend design (env, CSP + session CORS shim, `AuthGate`, harness `auth:bypass`).

Still holds for assets and the engine:

- No CDN fonts, no remote stylesheets, no remote images. Bundle them.
- The **engine** makes no network requests; `render-check` fails the build if the harness attempts one.
- Cloud calls outside auth (templates, plugins, sync) still degrade gracefully to a working state, never an error wall.

## Desktop conventions

- File writes go through the native save dialog via `window.bitgrain.saveFile`, never a browser download.
- Routing uses `HashRouter`. `BrowserRouter` cannot resolve from `file://` in a packaged build.
- CSP is applied as a production response header in `src/main/security.ts`, not a meta tag, so Vite dev mode keeps working.
