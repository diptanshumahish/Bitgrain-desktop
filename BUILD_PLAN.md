# Bitgrain Desktop, Executable Build Plan

Companion to `DESKTOP_APP_PLAN.md`. That document is the architecture and the feature map. This document is the sequenced work order: what gets built, in what order, which files get touched, and how each step is proven done.

Source repo to port from: `/Users/diptanshumahish/personal/imgi` (referred to below as **web repo**).
Target folder: `/Users/diptanshumahish/personal/bg-desktop` (this folder).

---

## 0. Ground truth measured from the web repo

Numbers below were measured, not estimated. They drive the sequencing.

| Area | Path | Files | LOC | Port verdict |
|---|---|---:|---:|---|
| Effects engine | `src/engine` | 89 | 9,554 | port as-is, do not touch pixel math |
| Video editor | `src/modules` | 162 | 16,736 | port as-is |
| UI components | `src/components` | 296 | 35,544 | port selectively, drop marketing and payments |
| Pages | `src/pages` | 142 | 18,733 | port editor pages only, drop landing/blog/docs/legal |
| Utils | `src/utils` | 36 | 3,614 | port, rework persistence |
| Data (templates, types) | `src/data` | 17 | 2,820 | port |
| Stores | `src/store` | 19 | 1,227 | port as-is |
| Lib | `src/lib` | 23 | 1,416 | port, rewrite `api-client.ts` |
| Hooks | `src/hooks` | 14 | 1,250 | port, rewrite auth hooks |
| Studio plugins | `src/studio-plugins` | 7 | 447 | port, route its `fetch` through api-client |
| **Total** | `src` | **811** | **~91k** | |

Droppable page LOC (marketing, not app): `landing-page` 3,173, `legal` 740, `blog-renderers` 484, `docs-page` 477, `comparisons` 358, `blog-page` 330, `landings` 228, `tools` 146, plus top-level `Landing.tsx`, `Pricing.tsx`, `BlogList.tsx`, `BlogPost.tsx`, `ComparisonLanding.tsx`, `StyleLanding.tsx`, `ToolLanding.tsx`, `showcase.tsx`, `Hub.tsx`, `docs.tsx`, `Legal.tsx`, `Unsubscribed.tsx`. Roughly 7k LOC never gets copied.

Facts that make the port cheaper than it looks:

1. **No path aliases.** `vite.config.ts` defines none, so every import in the web repo is relative. Copying a subtree keeps its imports valid. Only cross-subtree imports need attention.
2. **Workers are Vite-native.** All 7 `new Worker(...)` sites use `new URL("./x.worker.ts", import.meta.url)`. electron-vite handles this in the renderer with no change.
3. **One env var matters.** `VITE_API_BASE` appears 5 times. The rest are Razorpay, PayPal, PostHog, coupons, all of which get dropped.
4. **api-client is already a choke point.** `callApi` already returns `null` and flips `backendOnlineSignal` when the backend is unreachable, which is exactly the offline behaviour the desktop app needs.

Facts that make it more expensive than it looks:

1. **25 files touch `localStorage` directly.** Each needs an audit: keep (UI preference) or migrate to SQLite (project data).
2. **3 files bypass `api-client` with raw `fetch`** and are not droppable: `src/hooks/useAuth.ts`, `src/studio-plugins/host/api.ts`, `src/components/chatbot/chat-logic.ts`. The other raw-fetch files are marketing pages that get dropped.
3. **`react-router-dom` BrowserRouter** does not work from `file://` in a packaged Electron build. Must become `HashRouter` or `MemoryRouter`.
4. **Auth is cookie-based today** (`credentials: "include"`, HttpOnly `imgi_token`). Cookies do not survive a loopback local server cleanly. This is the Bearer-token rewrite the architecture doc calls for.

---

## 1. Decisions to lock before writing code

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | Package manager | **npm** | Electron native modules (`better-sqlite3`) and `electron-rebuild` are best supported on npm. The web repo uses bun, but this is a separate repo with a native dependency. |
| D2 | Port style | **Incremental per milestone** | Copying all 811 files on day one gives a red type-check wall with 200+ errors and no way to tell signal from noise. Copy per milestone, keep the build green at every step. |
| D3 | Router | **HashRouter** | Works from `file://` in the packaged app with the least change to existing route definitions. |
| D4 | Local backend | **fastify + better-sqlite3 in the main process** (as the architecture doc says) | No second binary, shared TypeScript types, small surface. |
| D5 | Where Windows builds happen | **GitHub Actions `windows-latest`** | Dev machine is macOS. Cross-building a signed NSIS installer from macOS is fragile. Local dev and verification happen on macOS, packaging and Authenticode signing happen on a Windows runner. |
| D6 | Licensing work timing | **After the editor works (M7)** | Licensing is a business gate, not a technical unknown. Build the thing that must be correct first. |

D5 changes the meaning of "Windows first" in the architecture doc: Windows stays the **first shipping target**, but macOS is the **first running target**, because that is the dev machine. The engine is CPU Canvas-2D on `Float32Array`, so output is identical on both.

---

## 2. Milestones

Each milestone has a goal, a task list, and an acceptance test. Nothing moves forward until the acceptance test passes.

### M0, Repository skeleton, DONE 2026-07-24

**Goal:** an empty, well-configured Electron app that boots.

Tasks:
- `git init` in `bg-desktop`, `.gitignore`, `README.md`
- `package.json` with electron, electron-vite, electron-builder, react 19, typescript 5.9, tailwind v4
- `electron.vite.config.ts` with three targets: main, preload, renderer
- `tsconfig.json` split into `tsconfig.node.json` (main + preload) and `tsconfig.web.json` (renderer)
- `src/main/index.ts` creating one `BrowserWindow`, `src/preload/index.ts` with an empty `contextBridge` surface
- `src/renderer/` with a placeholder React page and the ported `index.css`
- `CLAUDE.md` copied and adapted from the web repo so code style stays identical

Acceptance: `npm run dev` opens a window showing the placeholder, `npm run build` completes with zero type errors. **Met.** Stack landed as electron 43, electron-vite 5, vite 7, react 19, tailwind 4. Vite 7 rather than 8, because electron-vite 5 does not yet peer-accept 8, which also forced `@vitejs/plugin-react` 5 rather than 6.

### M1, Engine renders offline, DONE 2026-07-24

**Goal:** the deterministic core runs inside Electron. This is the highest-risk step and it comes first.

Tasks:
- Copy `src/engine/**` verbatim into `src/renderer/engine/`. No edits to pixel math.
- Copy the engine's util dependencies: `src/utils/bitgrain-effect.ts`, `bitgrain-effect-core.ts`, `bitgrain-worker-client.ts`, `bitgrain-effect.worker.ts`, `render-scale.ts`, `image-utils.ts`
- Copy `src/lib/signal.ts` and the stores the engine path needs (`transform-store`, `image-store`, `history-store`)
- Copy `src/pages/Home.tsx`, `src/pages/home-page/**`, `src/components/output-preview/**`, `src/components/toolbar/**`
- Build a throwaway harness route that loads a file from disk, applies halftone, and writes a PNG
- Verify all 7 worker sites resolve under electron-vite

Acceptance: load a JPEG, apply halftone, export a PNG to disk, with the network fully disabled. **Met**, and exceeded: 229 files ported as the exact import closure, typecheck green on the first pass, 6 effects rendering (halftone mono and CMYK, Floyd-Steinberg, Atkinson, ASCII, grayscale), a repeat render matching checksum-for-checksum, and any network request during the run treated as a hard failure. Two runnable gates now exist, `npm run smoke` and `npm run render-check`, combined as `npm run verify`.

### M2, Parity harness

**Goal:** prove the port did not drift, and keep proving it forever. This is the guard on the brand promise.

Tasks:
- Fixture set: 6 source images (photo, high-contrast graphic, flat colour, text-heavy, transparent PNG, wide-gamut) checked into `test/fixtures/`
- Matrix: every effect at 3 parameter sets, plus 5 preset chains, plus 2 export scales
- A script that renders the matrix in the web repo (headless Chromium against the dev server) and writes reference PNGs
- A script that renders the same matrix in the desktop renderer and pixel-diffs against the references
- Wire it as `npm run parity`, fail on any nonzero diff

Acceptance: `npm run parity` reports 0 differing pixels across the whole matrix.

This runs after every subsequent milestone. If it goes red, the last change broke determinism.

### M3, Native shell integration, PARTIAL 2026-07-24

**Goal:** the app stops behaving like a web page.

Tasks:
- IPC surface in `src/preload/index.ts`: `window.bitgrain.saveFile`, `openFile`, `showInFolder`, `getSystemFonts`, `appInfo` — **saveFile, openImage, showInFolder, appInfo, platform done; getSystemFonts pending (M5, fonts)**
- Replace browser download with `dialog.showSaveDialog` at the export entry points (`src/components/toolbar/ExportPopover.tsx`, later the Studio ones). Encoders stay untouched, only the final write changes. — **done at the single choke point (`Exporter.ts` `triggerBlobDownload`)**
- **Custom title bar, done.** Frameless window (`hiddenInset` on mac with inset traffic lights, `hidden` + `titleBarOverlay` on Windows for native controls), a draggable React `TitleBar` in `src/renderer/shell/`, wrapped by a `Shell` that owns the flex column. Redesigned to be borderless and painted in `var(--s-bg-canvas)` so it reads as one surface with the editor, not a separate bar; wordmark only, no marketing copy. See section 7.1.
- **`app://` protocol, done.** The packaged app loads over a registered `app://bundle` origin (`src/main/protocol.ts`) instead of `file://`, so absolute asset paths (logo, samples, fonts) resolve. This fixed the logo not loading. The smoke test now loads over `app://` and asserts the logo actually decodes.
- **Document tabs, done.** Figma-style tabs live in the title bar (`shell/TitleBarTabs.tsx`, `store/document-tabs-store.ts`). Each tab is an independent document: switching snapshots the live editor (image, sample flag, meta, full `TransformSnapshot` via the store's `captureSnapshot`/`applySnapshot`) into the outgoing tab and restores the incoming one. Open with `+`, close with `x`, titles auto-derive from the loaded image's filename. Proven end to end by `npm run tabs-check` (load a sample, open a new tab, switch back, assert each tab kept its own document).
- **Native menus, done.** A native application menu (`src/main/menu.ts`) with File/Edit/View/Window/Help, and a native right-click context menu (editing roles, reveal-exports, plus reload/inspect in dev).
- **macOS trackpad haptics, done.** A native N-API addon (`native/haptics/`, Objective-C++ over `NSHapticFeedbackManager`) fires Force Touch feedback; the effect sliders tick per step and thump at the edges (`shell/haptics.ts`). No-ops off macOS or when the addon is not built. Built with `npm run build:native`.
- Native menu bar — done (above). Window state persistence — pending.
- Drag and drop a file onto the window opens it — pending

Acceptance: export writes to a user-chosen path via a native dialog, and the exported bytes still pass `npm run render-check`. **Title-bar and choke-point pieces met; determinism re-confirmed byte-for-byte after the shell changes.**

### M4, Local backend, STARTED 2026-07-24

**Goal:** the ported `api-client` talks to localhost instead of the cloud, and projects live on disk.

**Progress:** project persistence is live. Rather than the HTTP-server-plus-api-client approach below, the first cut uses **direct IPC + a file-based store** in the main process (`src/main/projects.ts`), exposed through the bridge (`listProjects`/`saveProject`/`loadProject`/`deleteProject`). Projects live under `userData/projects/<id>/` (data.json + asset + thumbnail.png) with an `index.json`; the `app://` protocol serves `/@asset/<id>` and `/@thumb/<id>` from there. Darkroom documents save (Cmd+S / File > Save) with an auto-generated thumbnail, appear in the Home **Library** with that thumbnail, and reopen into a tab. Proven by `npm run persistence-check` (save, reload, Library survives). Still to do: Studio/Video persistence, autosave, and deciding whether to adopt the fastify+SQLite+api-client path below for the online-parity surfaces (credits, templates, presets, kits).

Tasks:
- `src/main/local-server/server.ts`: fastify on `127.0.0.1`, ephemeral port, port handed to the renderer via IPC before the window loads
- `src/main/local-server/db.ts`: `better-sqlite3` plus the migration runner. Schema exactly as `DESKTOP_APP_PLAN.md` section 7.2.
- Routes: `GET /api/credits`, `GET|POST /api/projects`, `GET|POST /api/presets`, `GET|POST /api/design-kits`, `GET /api/templates`, `GET /api/assets`, `GET /api/fonts`, `GET /auth/me`
- Rewrite `src/renderer/lib/api-client.ts`: `resolveApiBase()` returns the local URL, drop `credentials: "include"`, add `Authorization: Bearer` for cloud-bound calls only
- Route the 3 raw-fetch files through the client
- Audit the 25 `localStorage` files, split into UI preference (keep) and project data (move to SQLite)
- `.btg` save and load through the local server, files on disk under the user-data dir, SQLite holding the index only

Acceptance: create a project, quit the app, reopen it, and the project is listed and loads with identical pixels.

### M5, Studio, STARTED 2026-07-24

**Goal:** the multi-layer design surface works offline.

**Progress:** Studio is ported and renders natively as a `studio`-kind tab (192-file closure delta, deps `fflate`/`jspdf`/`polygon-clipping` added, one SEO strip). It comes up with Layers, Pages, Templates, the canvas, page properties, design kits, and the tool bar. Not yet done here: routing `.btg` save/load and templates through the local backend (needs M4), bundling baseline templates offline, and verifying every Studio export format. Also new this pass: the desktop tab/surface architecture (Home dashboard + heterogeneous Home/Darkroom/Studio/Video tabs, each its own document), proven by `npm run surfaces-check`.

Tasks:
- Copy `src/components/studio/**` (~17k LOC), `src/pages/Studio.tsx`, `src/pages/studio-page/**` minus the mobile shell
- Copy `src/data/studioTypes.ts`, `src/utils/studio-layers.ts`, `src/utils/pattern-engine.ts`, `src/data/pattern-meta.ts`
- Copy design kit files and the templates client, point the templates client at the local server
- Bundle a baseline template set under `resources/templates/`, served by the local `GET /api/templates`
- Fonts: bundle the core set in `resources/fonts/`, add native system font enumeration behind `window.bitgrain.getSystemFonts`
- Port Studio export (PNG, WebP, JPEG, HDR, SVG, PDF, riso ZIP) onto the native save dialog

Acceptance: open a bundled template offline, edit it, export a multi-page PDF and a riso ZIP, both byte-identical to the web app's output for the same input.

### M6, Video editor, STARTED 2026-07-24

**Goal:** timeline editing and MP4 export inside Electron.

**Progress:** the video editor is ported and renders natively as a `video`-kind tab (media panel, preview, transport, multi-track timeline, inspector, Export). 160-file closure delta, two small strips (SEO, section-nav logo). Each video tab is its own blank project, persisted to IndexedDB and gated on tab-active so switching is lossless. Not yet verified end to end: an actual MP4/WebM export from an imported clip (the pipeline is present and builds; needs a real export run). That, and routing video projects into the Home Library, are the remaining M6 items.

Tasks:
- Copy `src/modules/video/**` (~16.7k LOC) and `src/pages/VideoEditor.tsx`, `src/pages/VideoHome.tsx`
- Verify WebCodecs and `mp4-muxer` behave in the Electron renderer, including the H.264 High profile path
- Route video project persistence through the local server
- Confirm the plan gate file still compiles once licensing lands in M7 (resolution gating hooks into it)

Acceptance: import a clip, cut on a beat, add a text animation, export a 1080p MP4 that plays in QuickTime and VLC.

### M7, Licensing and auth

**Goal:** Model A, exactly as specified in `DESKTOP_APP_PLAN.md` section 6.

Cloud side (in the web repo's Go server):
- `server/internal/handlers/desktop_auth.go` with `POST /desktop/auth/request-code`, `POST /desktop/auth/verify-code`, `POST /desktop/refresh`, `POST /desktop/revoke`, `GET /desktop/devices`
- `server/internal/license/sign.go`, Ed25519 signer, key from `DESKTOP_LICENSE_SIGN_KEY`
- Migrations `053_desktop_devices.sql` and `054_desktop_updates_until.sql` (confirmed: current head is `052_tickets.sql`)
- SKU `pro-desktop` wired into `grantCreditsForOrder` and `grantCreditsForPayPalOrder`, perpetual plan plus `updates_until = now() + 1 year`
- Register routes in `server/router_public.go`

Desktop side:
- Login screen, email plus 6-digit code, no browser, no payment UI
- `src/main/license/verify.ts`, Ed25519 verification against the baked-in public key in `resources/`
- `src/main/license/store.ts`, tokens in the OS keychain via `safeStorage`
- `deviceId` generated on first run and persisted
- Clock-tamper guard, reject if the local clock rolled back past the last server-seen timestamp
- Lease refresh at half life when online, silent logout to the login screen at lease end while offline
- Run gate: allow the build when `featureLine(build) <= entitledVersion`

Acceptance: log in with a Pro account and enter the app; log in with a non-Pro account and get the buy-on-website screen; pull the network, restart, and still work; wind the system clock forward past the lease and land on the login screen with all local projects intact.

### M8, Packaging and updates

**Goal:** a real installer that updates itself.

Tasks:
- `electron-builder.yml` for NSIS `.exe`, `.btg` file association, per-feature-line update feeds (`updates/<major.minor>/latest.yml`)
- GitHub Actions workflow building on `windows-latest`, Authenticode signing with a cloud HSM or hardware token
- `electron-updater` wiring pointed at the entitled line's feed
- `GET /desktop/latest-version` on the cloud for feature-line discovery, non-blocking renew note when a newer line is not covered
- Inject build metadata (version, feature line) at build time

Acceptance: install the `.exe` on a clean Windows box with no SmartScreen warning, double-click a `.btg` and it opens in the app, publish a patch and watch the installed copy update itself.

### M9, macOS and Linux

Tasks: `.dmg` with Developer ID signing and notarization, `.AppImage` plus `.deb`, macOS-specific polish (vibrancy, dock progress, and the Force Touch haptics addon for canvas snapping if it earns its keep).

---

## 2b. Desktop-native direction (title bar, compute, design)

The first port made the app *run* in Electron. It did not yet make it *feel* or *perform* like a desktop app. Three directions close that gap. They are cross-cutting, not a single milestone, and they interleave with M3 through M9.

### 7.1 Custom title bar (started M3)

A packaged Electron app should not wear the OS default window chrome. The app now runs frameless with a custom bar:

- **Window** (`src/main/window.ts`): mac uses `titleBarStyle: "hiddenInset"` with the traffic lights inset to `{x:16, y:13}`; Windows and Linux use `titleBarStyle: "hidden"` plus `titleBarOverlay` so the native minimise/maximise/close controls paint over our bar in the app's colours. `nativeTheme.themeSource = "dark"`.
- **Renderer** (`src/renderer/shell/`): `Shell` owns a flex column, `TitleBar` is a 40px draggable strip (`-webkit-app-region: drag`, interactive children opt out with `no-drag`). It insets its content per platform so it never collides with the window controls. `desktop-platform.ts` reads `window.bitgrain.platform` synchronously (exposed through the preload) so there is no async flash.
- The ported `Home` root changed from `h-screen` to `h-full` so it fills the shell body rather than the whole viewport. Recorded in `PORTED.md`.

Still to do: window state persistence (remember size and position), a native application menu, and drag-and-drop-to-open. Later polish: per-view title labels (`bitgrain / studio`), and on mac a subtle vibrancy behind the bar.

### 7.2 Bare-metal compute (new milestone, target after M4)

**The problem is real.** The engine is CPU Canvas-2D on `Float32Array`, running in the same Chromium the browser uses, so today the desktop build has no performance advantage. The single-image preview path uses one worker; full-res export is effectively single-threaded.

**The constraint is non-negotiable.** Output must stay byte-identical (the parity gate, the brand promise). That rules acceleration methods in or out:

| Method | Throughput | Byte-identical? | Verdict |
|---|---|---|---|
| Multi-core CPU (worker pool / native threads, same math, partitioned) | High | **Yes**, if partitioned by independent regions | **Authoritative accelerator.** Use for export and batch. |
| Native SIMD addon (C++/Rust) | Very high | Only if float rounding matches JS exactly | Candidate later, gated hard by parity, not first. |
| WebGPU compute shaders | Highest | **No**, GPU floats differ from CPU | **Live-preview only.** Never writes the exported file. |

So the design is two lanes:

1. **Authoritative lane (multi-core CPU).** Partition each effect's pixel work by row bands (or tiles) across `cores - 1` workers over a `SharedArrayBuffer`, run the *same* code each worker runs today, recombine. Effects that are per-pixel or per-tile independent (grayscale, invert, LUT, color grade, halftone per-cell, posterize, most filters) parallelise cleanly and stay byte-identical. Sequential error-diffusion dithers (Floyd-Steinberg, Atkinson, Sierra) cannot be row-split without changing output, so they stay single-threaded or use a serpentine-safe block scheme only if it is proven parity-clean. This lane feeds export and batch, where the win matters most.

2. **Preview lane (WebGPU, optional).** A GPU path for the *interactive* preview only, so dragging a slider is instant on large images. It is explicitly non-authoritative: the moment the user exports, the CPU authoritative lane produces the file. A visible, honest distinction, never a silent one.

**Headroom is measured, not assumed.** `npm run compute-bench` partitions a representative per-pixel workload (posterize + gamma over a 4K RGBA buffer, 8 passes) single-threaded vs across all cores on a `SharedArrayBuffer`, and asserts the two outputs are byte-identical.

```
device            Apple M3 Pro
cores             11 logical, 10 workers
workload          3840x2160 RGBA, 8 passes (66 Mpix)
single-threaded   2282 ms
multi-core        440 ms
speedup           5.19x
byte-identical    yes
```

5.2x with identical output on this machine, and it will climb on higher-core desktops. That is the concrete desktop advantage the browser cannot match, earned without touching the brand promise.

Rollout:
- **C1 DONE 2026-07-24.** Band-parallel worker pool in the renderer (`src/renderer/engine/parallel/`). Instead of `SharedArrayBuffer` it splits the image into horizontal strips and transfers each to a pool worker running the *unchanged* engine, then stitches — no cross-origin-isolation needed. The band whitelist (C3, done) is `invert, grayscale, lut, colorgrade, duotone, posterize, colorwash`, verified against plugin source as pure per-pixel. `npm run parallel-check` asserts banded output is byte-identical to single-pass for every whitelisted effect and confirms the `OffscreenCanvas` downscale is deterministic. The export path (`export-render.ts`) now routes band-splittable chains through the pool. Measured on M3 Pro at ~4320px: invert 3.7x, grayscale+posterize 3.5x, grayscale 1.6x; cheap single ops (posterize, colorwash) stay near 1x and are guarded by a 1 MP minimum-work threshold. A scaling-parity check caught (and forced the fix for) a real HTMLCanvas-vs-OffscreenCanvas resampling difference.
- **C2** Route the *batch* path through the pool too (export done); keep the parity gate green on every effect.
- **C3 DONE.** Effect classification is the whitelist in `band-splittable.ts`; sequential and neighbourhood effects opt out explicitly.
- **C4** (optional, later) WebGPU preview lane behind a setting, clearly labelled non-authoritative.
- **C5** (optional, later) Native N-API addon for the hottest sequential effects, only if C1 to C3 leave a real gap, and only behind parity.

### 7.3 Desktop-oriented design

The ported UI is the responsive web layout. It works, but it still reads as a website in a window. Desktop-native design principles to apply as Studio and the editor mature:

- **Density over marketing whitespace.** Desktop users expect information-dense panels, not hero-sized empty canvas. Tighten the editor chrome, drop the web hero framing.
- **Real panels, not floating web toolbars.** Dockable left tools / right properties, resizable splitters, collapsible sections. The Studio port (M5) already has panel components; lean into them and drop the mobile shell entirely.
- **Native affordances.** Right-click context menus, keyboard-first shortcuts surfaced in an application menu, hover tooltips, a status bar (zoom, dimensions, colour under cursor, export size).
- **Window-aware layout.** Multi-monitor friendliness, remembered panel sizes, optional detachable preview.
- **Restraint on web-only motion.** Page-transition and stagger-reveal animations meant for a marketing site should be toned down for a tool people use all day.

These are design directions, not a single task; they land incrementally with each ported surface. The title bar (7.1) is the first installment.

---

## 3. Port mechanics

Rules that keep the copy honest.

**Copy, do not retype.** Every file that ports as-is gets copied with `cp -R`. Retyping invites drift.

**Track provenance.** Each ported subtree gets a one-line entry in `PORTED.md`: source path, source git SHA, date, and whether it was modified. When the web repo's engine changes, that file tells you what to re-sync.

**Import rewrite rules.** The web repo's `src/x` becomes `src/renderer/x`, so relative imports within a subtree stay valid. Cross-subtree imports (for example `components/studio` reaching into `utils`) also stay valid because the relative depth is preserved. The only breakages are files that import a dropped marketing module. Those get stubbed or the import gets deleted.

**Strip on copy.** Delete on arrival: PostHog analytics calls, Razorpay and PayPal loaders, `StudioPaymentModal.tsx`, `PayPalCheckoutModal.tsx`, `react-helmet-async` SEO blocks, service worker teardown in `main.tsx`, the `vite-plugin-pwa` config.

**Never edit `src/engine`.** If something in the engine appears to need a change, that is a signal the surrounding shell is wrong, not the engine. The one exception is a build-level shim, and it gets recorded in `PORTED.md`.

**Style rules carry over.** The web repo's `CLAUDE.md` applies here too: files under 300 lines, no nested components, signals over `useState`, popovers via events and a portal, no unnecessary comments, no em dashes in copy.

---

## 4. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Output drift between web and desktop | Medium | Fatal to the brand promise | M2 parity harness runs after every milestone, not just once |
| `better-sqlite3` native build against Electron's node ABI | High | Blocks M4 | `electron-rebuild` in postinstall, pinned Electron version, prebuild cache in CI |
| WebCodecs H.264 High profile unavailable in the Electron build | Low | Blocks M6 | Verify in M0 with a 20-line spike before committing to the milestone |
| Authenticode certificate procurement (OV now needs hardware token or cloud HSM) | High | Blocks shipping, not building | Start procurement during M4, it has weeks of lead time |
| BrowserRouter fails from `file://` | Certain | Blocks M0 | HashRouter, decided up front (D3) |
| Cookie auth does not survive the localhost server | Certain | Blocks M4 | Bearer tokens, already planned |
| Bundle size, ~91k LOC plus WASM decoders | Medium | Slow installer, slow cold start | Keep route-level lazy loading, ship WASM as `extraResources` rather than bundled |
| Exit insurance, server death locks out users | Low | Reputational | Decide the kill-switch-to-perpetual commitment before M7 ships, not after |

---

## 5. Open decisions still owed (from the architecture doc, section 12)

These do not block M0 through M6. They must be answered before M7 ships.

- Lease length (suggested 30 days)
- Updates window (suggested 1 year) and renewal price (suggested 50 to 60 percent of initial)
- Device seat count per license
- Hard lock versus soft nag at lease expiry, and the exit-insurance commitment
- Desktop price point, independent of the web pricing
- Whether the web app eventually moves to the same perpetual-plus-paid-updates model

---

## 6. Sequencing summary

```
M0 skeleton        ->  M1 engine offline  ->  M2 parity harness
                                                    |
                          M3 native shell  <--------+
                                  |
                          M4 local backend
                                  |
                    +-------------+-------------+
                    |                           |
              M5 studio                    M6 video
                    |                           |
                    +-------------+-------------+
                                  |
              (C) compute lane, multi-core CPU accelerator, parity-gated
              measured headroom on M3 Pro: 5.2x, byte-identical
                                  |
                          M7 licensing (cloud + desktop)
                                  |
                          M8 packaging, signing, updates
                                  |
                          M9 macOS and Linux
```

M5 and M6 are independent once M4 lands and can be done in either order. Everything else is strictly sequential.
