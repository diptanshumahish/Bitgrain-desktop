# Port provenance

Every file under `src/renderer/` that came from the web repo is tracked here. When the web repo changes, this file tells you what needs re-syncing and what was deliberately altered.

Source repo: `/Users/diptanshumahish/personal/imgi`
Source commit: `2294da118740e90f6d851dc0d9e290dc3cf276ac` (2026-07-23), re-synced to `765ed1f` **plus the web repo's uncommitted working tree** on 2026-10-01 (see below). Diff future re-syncs against that working tree, not against `765ed1f` alone.

---

## M1 slice, imported 2026-07-24

229 files, selected as the exact transitive import closure of `src/pages/Home.tsx` plus the entire `src/engine` tree plus three lightweight portals. The closure was computed by parsing static imports, dynamic imports, and `new URL(..., import.meta.url)` worker references. It resolved with zero missing modules.

| Source subtree | Files | Mapped to | State |
|---|---:|---|---|
| `src/engine/**` | 89 | `src/renderer/engine/**` | verbatim, except one file below |
| `src/components/**` (closure only) | 60 | `src/renderer/components/**` | verbatim |
| `src/utils/**` (closure only) | 19 | `src/renderer/utils/**` | verbatim |
| `src/pages/**` (closure only) | 15 | `src/renderer/pages/**` | one file deleted, see below |
| `src/lib/**` (closure only) | 15 | `src/renderer/lib/**` | one file stubbed, see below |
| `src/hooks/**` (closure only) | 10 | `src/renderer/hooks/**` | verbatim |
| `src/store/**` (closure only) | 6 | `src/renderer/store/**` | verbatim |
| `src/data/**` (closure only) | 5 | `src/renderer/data/**` | verbatim |
| `src/modules/video/**` (closure only) | 3 | `src/renderer/modules/video/**` | verbatim |
| `src/config`, `src/types` | 2 | same | verbatim |
| `index.css` | 1 | `src/renderer/index.css` | two lines removed, see below |
| `public/` (fonts, samples, logo) | 19 | `src/renderer/public/` | verbatim |

Not yet ported, deliberately: template gallery, all marketing and blog and docs pages, admin, payments UI. (The video editor was later added in the M6 slice, and the feature-modal subtree in the M7 slice below.)

## Web re-sync, 2026-10-01

Brought the desktop up to the web repo's 31 commits since the port (`2294da1..765ed1f`) plus its uncommitted working tree. Method: every web file changed since `2294da1` was classified against the desktop copy.

- **135 untouched desktop files**: copied verbatim. This includes the whole **engine** delta (plugins, presets, `print-finish.ts`, `transform.worker.ts`, new `engine/utils/seeded-random.ts`, `engine/presets/preset-snapshot.ts`, `engine/selective/*`). `src/renderer/engine/` is again byte-identical to web apart from deviation 1, so a given input and settings render the same pixels in both apps.
- **40 desktop-modified files**: three-way merged (base = web `2294da1`, ours = desktop, theirs = web now). Fifteen merged cleanly; the rest were resolved by hand as below.
- **61 new files**: copied as the transitive import closure of the desktop renderer, nothing more. No new third-party deps.
- Web-only, deliberately not ported: marketing/docs/blog/checkout/MCP/account pages, `MaintenanceGate`, `SectionMenuPortal`, web `StudioHome`/`VideoHome` project browsers (desktop Home dashboard covers them), `LocalSaveNote`, `SettingsModal`, lazy `ModalPortal` split, web video `frame-pipeline.ts` (replaced by the desktop worker pool).

Features this brings in: studio **frame layers** (nested frames, F-key frame drawing, frame presets, add-frame-inside, reparent on drop), **adjustment layers**, drag-to-place text/shapes, layer shadow/glow, torn-edge uploads, match-page-to-layer, custom font upload, empty-canvas hint; darkroom **film grain toggle**, filter-mode defaults, seeded print finish; video **dip-to-colour fades**, **track locking**, in/out **export range**, markers and range **stored in the project** (they now survive save/reload), motion-adaptive jitter, any-property keyframes, text pixel-scaling, frame-step `,`/`.` keys and the Esc cascade.

Hand resolutions to re-apply on the next re-sync:

- **Studio canvas tooling is now web's.** `canvas-area.tsx`, `canvas/use-canvas-tools.ts` and `ui/FloatingAdder.tsx` are taken from web (their placement + frame drawing supersede the desktop's own drag-to-create). Desktop hunks on top: `UserAvatar` removed from the canvas (account lives in the shell), `hapticEdge()` when a placed object or drawn frame lands, adder at `bottom-16`. `canvas/use-placement-tool.ts` is now **unused** and should be deleted.
- `use-studio-layers.ts`: web verbatim (the desktop `handleAddShapeAt`/`handleAddTextAt` are gone).
- `use-studio-page-handlers.ts`: the desktop `handleAddFrame(width, height)` is renamed `handleAddSizedPage` (web now owns `handleAddFrame(parentId, rect)`); `handleAddFrameAt` removed.
- `StudioWorkspace.tsx` / `Studio.tsx`: desktop rail portal, title-bar actions and native-menu commands kept; web frame handlers, adjustment layer and `handleMatchPageToLayer` wired in; `LeftPanel` delete uses web's `handleDeleteFrame`; the desktop "no frames" wrapper is replaced by web's in-canvas `EmptyCanvasHint`.
- `PagedLayersList.tsx`: web verbatim, with the desktop `AddFrameMenu` in place of the "Add page" button. Web dropped the document row, so `LeftPanel` no longer takes `onSelectDocument`/`onAddPage`.
- `use-studio-pages.ts`: desktop kept for `deletePage` (last frame can be deleted, empty state follows).
- `TopBar.tsx` (studio): desktop layout kept; web's capitalised titles and `Shirt` mockup icon taken. Web's `useExportShortcut` is **not** used: ⌘E is already the native menu accelerator and a window-level listener would double-fire and reach hidden tabs.
- `text/text-helpers.ts`: moved by web; the desktop's two text fixes (literal newlines as hard breaks, `em` relative to parent size) re-applied at the new path. The old `hooks/export/text-helpers.ts` is unused and should be deleted.
- `export-render.ts`: web's `worker-params`/`paint-worker-result` refactor, with deviation 7's banded branch kept on top. `parallel-check` still proves byte identity.
- `use-toolbar-state.ts`: union of desktop `isDitherActive`/`toggleDither` (deviation 10) and web `isGrainActive`/`toggleFilmGrain`.
- `useAuth.ts`, `index.css`: desktop kept (deviations 9 and 4).
- **Video (forked module):** `frame-capture.ts` is web's version plus the desktop transition fields (`transitionAlpha`, `wipe`, `wash`, per-slot decoders) and `isIdentityChain`, with web's sizing rule factored into `resolveLayerProcessing`. **The desktop preview now uses it too.** Pixel-texture modes run at the 540px reference width, and other modes scale their size params, so a project's look matches web at any resolution. Previously the desktop preview and export used full resolution with unscaled params, so dither and halftone came out finer than on web. The preview also takes web's shared `MotionEstimator`/`computeFrameSeeds` instead of its private copies (same algorithm). `frame-compose.ts` multiplies web's `layerFadeAlpha` by the transition alpha and paints `paintDipColor`. `webcodecs-exporter.ts` is web's (`dispatchCapture`, export range, motion), with `support/frame-dispatch.ts` skipping on `isIdentityChain`. `PreviewCanvas.tsx` and `TopBar.tsx` are desktop's. `ClipBlock.tsx` combines web lock styling with desktop tool cursors. `useKeyboardShortcuts.ts` is desktop's, plus web's Esc cascade (which never leaves the editor on desktop) and `,`/`.` frame step. `useVideoPlayback.ts` reads the in/out range from the project.

Superseded files left on disk (unreferenced, safe to delete): `components/studio/hooks/export/draw-text.ts`, `components/studio/hooks/export/text-helpers.ts`, `components/studio/panels/BackgroundProperties.tsx`, `components/studio/panels/PageProperties.tsx`, `studio-plugins/host/render-plugin-icon.tsx`, `modules/video/components/panels/Export{Panel,ProgressBar,SummaryCard,Toast}.tsx`, `components/studio/canvas/use-placement-tool.ts`.

## M7 slice (Feature modals), imported 2026-07-25

The web `ModalPortal` and its modal subtree were originally skipped, which silently disabled every modal-driven feature — in the darkroom: crop, selective effect, colour studio, riso export; in studio: resize, mockup (smart object), pattern, animate, present, changelog, batch; plus the shared confirm/prompt dialogs and the HEIC conversion toast. This slice restores them.

47 additional files, the transitive closure of that feature-modal set (excluding the payment/auth modals). No new third-party deps — the closure's externals (`fflate`, `heic2any`, `mp4-muxer`, `lucide-react`, router, react) were all already present, and `posthog-js` resolves through the already-stubbed analytics provider. A desktop-specific `components/portal/ModalPortal.tsx` was written (not copied): it subscribes to `onModal` and renders only the feature modals, and it is mounted in `App.tsx`. Deviations from the web portal:

- **Payment/auth modals dropped entirely**: `studio-payment`, `free-access`, `post-export-upgrade`, `paypal-checkout`, `settings`, `login`, `ticket`. Offline app, no accounts, no payments — these events are simply not rendered. The web portal's `login → navigate("/sign-in")` branch is gone too.
- **`add-image` is native, not a modal**: the web build opens an online asset-library picker (`AddImageModal`, not ported). The desktop portal handles the `add-image` event by opening the native file dialog (`window.bitgrain.openImage`) and returning a self-contained data URL to the caller's `onPick`. This covers all three entry points (the studio rail "Add image" button and the Image/Upload property panels' "Replace image").
- **Two dead buttons removed** now that their modals are gone: the "report a bug" (`ticket`) button in `components/studio/TopBar.tsx`, and the darkroom header's Studio-nav button, PNG/SVG credits pill (`settings`), and bug (`ticket`) buttons in `pages/home-page/HomeHeader.tsx`. Re-sync means re-removing these.

Re-sync procedure for the modal subtree: recompute the closure of the feature modals listed above, copy the delta, and re-derive `ModalPortal.tsx` (do not copy the web one — it wires payment/auth).

## M6 slice (Video editor), imported 2026-07-24

160 additional files, the transitive closure of `src/pages/VideoEditor.tsx` (229 total, the rest shared with earlier slices); the full `src/modules/video` tree was copied to catch a Vite `?worker` import the static resolver misses. Deps all already present (`mp4-muxer`, `heic2any`). Renders as a `video`-kind tab via `shell/surfaces/VideoSurface.tsx`, which creates and persists a per-tab blank project and gates the editor lifecycle on tab-active (video state is global, so the active tab owns the current project; autosave to IndexedDB makes switching lossless). Two deviations: `VideoEditor.tsx` Helmet SEO stripped (as elsewhere); `components/section-nav/SectionLogo.tsx` reduced to a plain logo (its web "switch workspace" menu used an `emitSectionMenu` that postdates the M1-era ported `event-bus.ts`, and tabs replace it on desktop).

## M5 slice (Studio), imported 2026-07-24

192 additional files, the delta of the transitive import closure of `src/pages/Studio.tsx` (290 files total, 98 already present from the M1 slice). Zero missing modules. New third-party deps declared: `fflate`, `jspdf`, `polygon-clipping`. Studio renders as a `studio`-kind tab via `shell/surfaces/StudioSurface.tsx`. One deviation: `StudioSeo.tsx` deleted and its `<StudioSeo>` usage removed from `Studio.tsx` (react-helmet-async, meaningless on desktop), exactly as HomeSeo in the M1 slice.

The desktop shell now has a tab/surface architecture (`store/document-tabs-store.ts`, `shell/SurfaceRouter.tsx`, `shell/HomeDashboard.tsx`, `shell/TitleBarTabs.tsx`): a Home dashboard (sidebar + work thumbnails) plus heterogeneous tabs (Home, Darkroom, Studio, Video) that coexist, stay mounted (switching never remounts), are renamable, and each hold their own document. This is desktop-only, no web-repo equivalent.

Persistence is the **workspace instance model** (M4 rework, 2026-07-24), desktop-only, no web-repo equivalent. Every open document — darkroom, studio, or video — is one *instance* backed by a single self-contained `<id>.bitgrain` file (a JSON document with its asset and thumbnail embedded as data URLs) in `userData/workspace/`, listed by a small `index.json`. Creating a new document mints a fresh id and a fresh file, so **a new tab never reopens or inherits an existing document**; previously worked-on documents live only in the Home Library and are reopened explicitly. Files autosave as you work (temporary workspace copies) and can be exported elsewhere via the native Save dialog.

Pieces: `src/main/workspace.ts` (file store, replaced the old per-project-folder `projects.ts`), `src/main/ipc.ts` workspace handlers incl. `workspace:export`, `src/renderer/store/workspace-store.ts` (renderer client), `src/renderer/store/projects-store.ts` (darkroom serialization), each tab's `instanceId` in `store/document-tabs-store.ts`, and the bridge `listInstances`/`readInstance`/`writeInstance`/`deleteInstance`/`exportInstance` over `workspace:*` channels. The old `/@asset` and `/@thumb` `app://` handlers were removed — instances are self-contained, so `protocol.ts` no longer serves per-project media. The three legacy per-surface stores (`utils/studio-persist.ts` singleton key, `utils/works-persist.ts`, `modules/video/**/project-persist.ts`) are bypassed on desktop; they remain for the web build.

This reworks four ported files (re-apply these hunks on re-sync):
- `pages/home-page/use-home-init.ts` — the startup `restoreImage` effect (last image from IndexedDB/localStorage) is deleted, so a darkroom tab starts blank.
- `pages/studio-page/use-studio-persist.ts` — an `instanceId` branch loads from and saves to the workspace file and drops the "restore last session" toast; the web `workId`/autosave-singleton path is untouched.
- `pages/Studio.tsx` — accepts an `instanceId` prop, threaded to `useStudioPersist`.
- `shell/surfaces/VideoSurface.tsx` (desktop-only shell) — binds to the tab's `instanceId` and autosaves to the workspace instead of the video IndexedDB.

## Auth gate + live prod backend (2026-07-25)

The desktop app now connects to the prod backend `https://api.bitgrain.app` and **requires sign-in** (strict online — every launch validates `/auth/me`; sign-up stays web-only). This reverses the app's offline-first stance for the shell (see CLAUDE.md); the engine stays offline (`render-check` is harness-only). The ported auth/api layer (`hooks/useAuth.ts`, `lib/api-client.ts`, `store/templates-store.ts`, `studio-plugins/host/api.ts`) was already present but dormant; this slice turns it on.

- **Enable backend**: new `.env` `VITE_API_BASE=https://api.bitgrain.app` flips `backendEnabled`. CSP (`main/security.ts`) gains the API host in `connect-src`/`img-src`.
- **Electron cross-origin shim** (`main/security.ts` `configureSession`, run dev+prod): rewrites outgoing `Origin`→`https://bitgrain.app` for API requests and injects `Access-Control-Allow-Origin: app://bundle` + credentials on the responses, so the ported cookie-session `fetch(..., credentials:"include")` code works from the `app://` origin unchanged. Dev additionally drops `webSecurity` (`main/window.ts`) since the renderer is on localhost there.
- **Gate** (`shell/AuthGate.tsx` wrapping `App.tsx`, `shell/auth/SignInScreen.tsx`): splash → `loadUser()` → app or sign-in. Email/password via the ported `loginWithEmail`; **Google** via system browser + `bitgrain://` deep link (`main/index.ts` `setAsDefaultProtocolClient` + `open-url`/`second-instance` → `auth:callback` IPC → `completeGoogleAuth`); "create account on the web" opens the site via the new `openExternal` bridge.
- **Templates + plugins**: `loadTemplates()` + `fetchPlugins()` fire on studio mount (`use-studio-init.ts`), skipped when `authBypassSignal` is set.
- **Harness bypass**: new `auth:bypass` IPC returns `false` in production; the four full-app checks' mock main returns `true` so they render past the gate. Never bypassed for real users.

Backend dependencies that can't be verified client-side (flagged): the API must accept the shimmed `https://bitgrain.app` origin with credentials; the session cookie must be `SameSite=None; Secure`; and Google needs backend support for the `bitgrain://` desktop redirect + token. Email/password is the reliable path if the Google/deeplink contract isn't ready.

## Chrome redesign (Figma-style, platform-aware, 2026-07-25)

The web-repo chrome was replaced with a native-app language, desktop-only. Shared: the title bar (`shell/TitleBar.tsx`) now hosts the tabs plus a right-aligned **contextual actions** slot fed by `store/titlebar-actions-store.ts` (keyed by tab id; the bar renders only the active tab's entry). A unified left-panel shell lives in `shell/panel/LeftPanel.tsx`. Platform split: **macOS** keeps inset traffic lights + the system menu bar; **Windows** keeps the native menu bar visible (`autoHideMenuBar: false` in `main/window.ts`) and the overlay caption buttons.

- **Darkroom** (`pages/Home.tsx`): the floating bottom toolbar (`FloatingToolbar`/`DesktopToolbar`) and floating `HomeHeader`/`HomeFooter` are removed from the render; controls now live in `pages/home-page/panel/DarkroomPanel.tsx` (bespoke Source/Basics/Adjust sections + the existing effect popovers rendered inline via their `static` mode). Export/share is published to the title bar. `HomeHeader.tsx`/`HomeFooter.tsx`/`components/FloatingToolbar.tsx` remain on disk but are unused.
- **Title bar full width; rail below it** (`shell/Shell.tsx` + `store/left-rail-store.ts` + `shell/panel/LeftRailPortal.tsx`): the tabs title bar spans the full width at the top; below it a shell-level rail runs full height on the left and the content column fills the rest. The active surface **portals** its options panel into the rail (`createPortal`) — the darkroom (`DarkroomPanel`) and the studio (its `LeftPanel`/`PanelRail`, moved out of `StudioWorkspace`'s inline row, gated on `railActive`). So the surface's secondary strip (studio `TopBar`) starts *after* the panel, in the content column. The studio strip centers the document name in a three-column layout.
- **App identity**: `main/index.ts` calls `app.setName("Bitgrain")` + `setAboutPanelOptions` so the macOS app menu/About/dock say Bitgrain, not Electron (packaged builds use `productName`).
- **Studio** (`components/studio/TopBar.tsx`): back button, Present, and Export removed; Export + Present published to the title bar by `pages/Studio.tsx`. The in-window **File/Edit/View/Help menus (`TopBarMenus`) were removed** — they duplicated the native menu bar. Their commands (Import/Export .btg, Export image, Export options, Fit to screen, Release notes, New project) are now driven by the native menu + rich right-click context menu (`main/menu.ts`) via a per-surface command registry (`store/surface-commands-store.ts`), routed to the active tab through `shell/use-app-actions.ts` (`cmd:*` actions).
- **Video** (`modules/video/components/TopBar.tsx`): back button, redundant `SectionLogo`, and the dead ticket button removed; Export published to the title bar by `shell/surfaces/VideoSurface.tsx`.
- Native right-click menu (`main/menu.ts`) gained New Darkroom/Studio/Video.

No `src/renderer/engine/` or effect-state changes — all new controls call the existing `use-toolbar-state.ts` setters, so render-check/parallel-check stay byte-identical. Re-sync means re-applying this desktop chrome over any refreshed web toolbar/topbar files.

Two onboarding overlays disabled because they portal into `document.body` and would leak from mounted-but-hidden surfaces onto the active one: `TutorialPortal` is omitted from `App.tsx`, and `components/onboarding/PrintFinishHint.tsx` is stubbed to a null component (its import in the ported Home stays valid). Onboarding is not part of the desktop experience.

---

## The video module is forked (2026-07-26)

`src/renderer/modules/video/` is **no longer a port**. It is desktop-owned source, forked deliberately, and re-syncing it from the web repo is no longer mechanical. Everything else in this document still applies; this section supersedes the M6 slice above.

The web module is a competent web NLE. It felt like one on desktop for three reasons, all now fixed:

1. **The preview was a 540px main-thread render.** `frame-pipeline.ts` capped processing at `PREVIEW_MAX_WIDTH = 540` and ran the engine synchronously in the paint loop, so the picture was soft and every effect stole time from React and the audio clock.
2. **The transport was a wall-clock rAF loop.** Time advanced by the raw frame delta, so the playhead sat between frames and nothing was frame-accurate.
3. **Nothing was cached and nothing ran ahead.** Every frame was rebuilt from scratch, every time, on a machine with idle cores.

### What replaced it

**`engine/preview/` (new).** The desktop render path.

- `preview-pool.ts` — a warm worker pool, sized to `hardwareConcurrency - 2`, dispatching to the least-loaded worker. It drives the exporter's own `frame-processor.worker`, so a previewed frame and an exported frame run identical engine code.
- `preview-renderer.ts` — captures each active layer, fans the layers out across the pool in parallel, and composites through the exporter's `composeProjectFrame`. Preview and export are now the same code path, so WYSIWYG holds by construction rather than by care. Processing resolution comes from the quality controller instead of a constant, so full quality means the project's real resolution, 4K included.
- `render-cache.ts` — an LRU of composed frames as `ImageBitmap`, budgeted at 1.5 GB and keyed on `(project revision, asset epoch, frame)`. A second pass over a stretch of timeline costs one `drawImage`.
- `prerender.ts` — the background renderer. While paused and idle it walks forward from the playhead at full quality filling the cache, using its own video decoders (`releaseVideoElements("prerender")`) so it can never disturb live playback. It yields to playback, scrubbing and export.
- `asset-epoch.ts` — bumped when an overlay image decodes or a font resolves. Frames composed before that are wrong in a way no project edit describes, so they are dropped and recomposed exactly once. This is what allows the paint loop to stop re-rendering an unchanged frame forever.

**Quality and instrumentation.** `store/preview-perf-store.ts` holds an auto controller that trades resolution for frame rate only while playing, and pins full resolution the moment you pause. `components/preview/PerfHud.tsx` and `components/StatusBar.tsx` publish what it is doing (fps against target, frame ms, workers busy, cache size, hit rate).

**Transport.** `hooks/useVideoPlayback.ts` quantises to the project's frame grid, carries sub-frame remainder so 30fps on a 60Hz display does not drift, counts genuinely dropped frames, clamps suspended-tab gaps, honours the in/out range as play bounds, and supports reverse and shuttle rates.

**Editing.** `utils/trim-ops.ts` adds ripple, roll, slip and slide as real operations with media and neighbour limits enforced. `store/tool-store.ts` plus `components/timeline/ToolBar.tsx` make the active tool decide what a drag means. `utils/edit-points.ts` backs edit-point navigation.

**Transitions.** `ClipTransition` on `VideoTrack` is a real transition, not a pair of fades. It is centred on a cut and, for its duration, `activeFrameAt` puts **both** clips on screen — the outgoing one played past its out point, the incoming one before its in point, off the media handles either side. `utils/transition-ops.ts` owns the handle arithmetic and refuses (or trims) a transition the media cannot supply; `utils/transition-prune.ts` runs inside `updateProject` so any edit that deletes a clip or separates the cut takes the transition with it. Five kinds: cross dissolve, dip to black, dip to white, wipe left/right. Video elements are acquired per `slot`, so a dissolve between two clips cut from the *same* source gets two decoders instead of them seeking each other away.

**Workspaces.** `store/workspace-layout-store.ts` plus `components/WorkspaceSwitcher.tsx` add four named layouts (Edit, Trim, Colour, Review) and independent collapse for the media browser, inspector and timeline, persisted across sessions. Panels collapse to a labelled stub (`components/PanelStub.tsx`) rather than undocking: a collapsed panel keeps its width and stays one click from returning. Not a full drag-to-dock system — deliberately, since the value is in switching arrangements instantly, not in inventing new ones.

**Chrome.** `components/CommandPalette.tsx` (⌘K) over `hooks/useVideoCommands.ts`, which is now the single inventory of what the editor can do. `components/timeline/CacheBar.tsx` shows cached ranges under the ruler. `components/timeline/TransitionLayer.tsx` puts a "+" on every cut that can take a transition and a draggable, to-scale block on every cut that has one.

### Bugs found in the web module while forking

Both are real upstream bugs, worth fixing there too:

- **A chain of only `transform` effects rendered black.** `runTransform([])` returns its zero-filled scratch buffer, because with no plugin in the chain nothing ever writes to it. Both `frame-pipeline.ts` and `frame-processor.worker.ts` shipped that buffer as the frame. Fixed by routing through the LUT plugin with no LUT selected, the engine's one identity pass — the same trick as darkroom deviation 10.
- **The exporter dropped colour adjustments.** `webcodecs-exporter.ts` skipped the worker whenever `modes.length === 0`, which also skipped chains of pure brightness/contrast/saturation/hue and wrote the ungraded frame. Now gated on `isIdentityChain`, which additionally lets a genuinely untouched layer skip the readback entirely and draw at source resolution (`ComposedLayer.directSource`).

### Verification

Two new stages, both in `npm run verify`:

- **`npm run video-check`** opens a video document and asserts the preview canvas paints at project resolution, the six tools respond to their shortcuts, the perf HUD toggles, the command palette opens and fuzzy-matches, the status bar reports the format, the workspace shortcuts collapse and restore the right panels, and the bottom chrome sits above the fold. `VideoEditor.tsx` moved from `h-screen` to `h-full` for that last reason, the same fix as deviation 6.
- **`npm run transition-check`** drives `src/renderer/video-harness.html`, a second harness page (kept separate from `harness.html`, which stays engine-only and network-free for the determinism checks). It asserts what a transition actually puts on screen: two live layers at the right opacities, each reading the right moment of its source media off the handles, dips going fully dark or fully white at the midpoint, wipes revealing rather than blending, and orphaned transitions being pruned when their cut is broken. None of that is visible in a screenshot, and it caught a real error in its own first draft.

---

## Deliberate deviations from source

Ten live (11 retired), all recorded, plus the forked video module described above and the 2026-10-01 re-sync resolutions. Nothing else was altered.

### 1. `src/renderer/engine/Exporter.ts`, `triggerBlobDownload`

The only edit inside `src/engine`. It is browser plumbing, not pixel math. Every file write in the app funnels through this one function, so it is the correct interception point for a native save dialog.

```
if (window.bitgrain) -> bridge.saveFile(filename, bytes)   // native dialog
else                 -> anchor + object URL                 // unchanged web path
```

The encoders, the quantizer, and all pixel math are untouched. Re-syncing this file from the web repo means reapplying this one hunk.

### 2. `src/renderer/lib/analytics/posthog-provider.ts`, stubbed

Replaced with a function returning `null`. This removes the `posthog-js` dependency entirely, which is correct for a privacy-first offline app. The surrounding analytics module keeps its exact shape, and `deferred-client.ts` already handles a null client, so no call site changed.

### 3. `src/renderer/pages/home-page/HomeSeo.tsx`, deleted

Its only purpose was `react-helmet-async` meta tags. Meaningless in a desktop app. The import and the `<HomeSeo />` element were removed from `Home.tsx`.

### 4. `src/renderer/index.css`, two lines removed

- The Google Fonts `@import` (Instrument Serif, Caveat). It was a startup network request, which contradicts the offline promise. Neither family is referenced anywhere in the ported code, so there is no visual change.
- `@plugin "@tailwindcss/typography"`. No ported file uses a `prose` class.

### 6. `src/renderer/pages/Home.tsx`, root height `h-screen` to `h-full`

The desktop shell (`src/renderer/shell/`) adds a 40px custom title bar above the routed content, so the editor must fill the shell body, not the whole viewport. One class changed on the Home root. No other Home markup touched. Re-sync means reapplying this one class.

### 7. `src/renderer/components/output-preview/export-render.ts`, banded export branch

`renderForExport` now branches: band-splittable chains (see `engine/parallel/band-splittable.ts`) run across all cores via the worker pool, everything else keeps the original single-worker path. The single-worker path is unchanged. The banded branch scales with `OffscreenCanvas` (identical to the worker) and feeds the *same* engine, so output is byte-identical, proven by `npm run parallel-check`. No pixel math touched. Re-sync means reapplying the branch and the three added imports.

### 8. `src/renderer/components/toolbar/slider.tsx`, mac haptics on drag

The effect-popover slider now fires a Force Touch haptic tick as the value steps and a stronger one at the min/max edge, via `shell/haptics.ts`. No-ops off macOS and when the native addon is absent. Two added lines plus a wrapped `onChange`; no behaviour change to the value itself. Re-sync means reapplying the wrapper.

### 9. `src/renderer/hooks/useAuth.ts`, `deleteAccount` removed

Account deletion is a destructive, irreversible action and is intentionally not exposed in the desktop app — users delete their account on the web (`bitgrain.app/account`), which the Account & settings panel links to. The `deleteAccount` function (a `DELETE /auth/me` call) was removed from this ported file, and the "Delete account" button was removed from the desktop-only `shell/account/AccountSettings.tsx`. Re-syncing `useAuth.ts` from the web repo means deleting the `deleteAccount` export again; do **not** reintroduce an in-app delete path.

### 10. `src/renderer/components/toolbar/use-toolbar-state.ts`, `toggleDither`

Added `isDitherActive` and a `toggleDither` alongside the existing `selectDither`; nothing existing was changed. On the web, `dither` is the base texture every other effect falls back to, so it never needed an off switch of its own, and the only way to *enable* it was to go turn off whichever effect currently owned the image. The desktop control panel (`pages/home-page/panel/DarkroomPanel.tsx`, desktop-only) gives every effect section its own toggle, so Dither needed one too.

```
on  -> modes = ["dither"]   // exclusive, same as toggleHalftone/togglePopart/…
off -> modes = ["lut"]      // with lutId null
```

The off state leans on `engine/plugins/lut.ts`: with no `lutId` it copies the source pixels through untouched, which is the engine's only identity pass. That is why no plugin had to be added and no pixel math was touched. Re-sync means reapplying the three added hunks.

### 11. `AdjustPopover.tsx` resolution slider max (retired 2026-10-01)

Web fixed the same bug its own way: presets now cap at 2 and `transform-store.ts` clamps every loaded snapshot to `RESOLUTION_MAX = 2`. `AdjustPopover.tsx` is web-verbatim again, and the desktop-only `DarkroomPanel.tsx` slider uses `RESOLUTION_MIN`/`RESOLUTION_MAX` so both apps clamp identically. No longer a deviation.

### 5. New files, not ported

`src/renderer/main.tsx`, `App.tsx`, `index.html`, `env.d.ts`, `harness.html`, `harness/index.ts`, the `src/renderer/shell/` tree (`Shell.tsx`, `TitleBar.tsx`, `TitleBarTabs.tsx`, `desktop-platform.ts`, `haptics.ts`), `src/renderer/store/document-tabs-store.ts` (desktop document tabs, built on the ported stores' snapshot API), and the `src/renderer/engine/parallel/` tree (`band-splittable.ts`, `band-runner.ts`, `band.worker.ts`, `band-pool.ts`, `export-grid.ts`). The `parallel/` tree is the multi-core accelerator; it wraps the engine but contains no pixel math of its own. The web repo's `main.tsx` and `App.tsx` carry service worker teardown, PostHog UTM handling, SEO, and 30-odd marketing routes, so they were rewritten rather than ported. `App.tsx` uses **HashRouter**, since `BrowserRouter` cannot resolve routes from `file://` in a packaged build. The `shell/` tree is desktop-only chrome with no web-repo equivalent.

---

## Undeclared dependency found during the port

`pako` is imported by three engine files (`png-encoder.ts`, `hdr-png-encoder.ts`, `truecolor-png-encoder.ts`) but is **not declared** in the web repo's `package.json`. It resolves there only as a transitive dependency, which is fragile. It is declared explicitly here.

Worth fixing upstream in the web repo too.

---

## Re-sync procedure

1. `cd /Users/diptanshumahish/personal/imgi && git log --oneline <recorded-sha>..HEAD -- src/engine`
2. For each changed file in the ported set, copy it over.
3. Reapply deviation 1 if `Exporter.ts` was among them.
4. `npm run verify` in this repo. If checksums in `test/output/checksums.json` move, the engine changed. Confirm that was intended.
