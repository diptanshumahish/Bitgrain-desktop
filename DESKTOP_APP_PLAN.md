# Bitgrain Desktop App, Build Plan

Status: planning. Owner: solo. Target: Electron desktop app for Windows first, then macOS and Linux. Later phase: fully native apps (see the web repo memory `project-macos-native-app`).

## How to use this document

This is the reference for building the **from-scratch Electron desktop app** in a separate folder. Every feature below lists **where its code lives today in the web repo** so you can port or reference it from the new folder.

- Web repo (source of truth to port from): `/Users/diptanshumahish/personal/imgi`
- All `src/...` and `server/...` paths in this doc are relative to that web repo.
- New desktop app lives in its own folder, its own git repo, its own codebase. It is NOT a wrap of the live web app.

The one hard rule: **port the effects engine as-is, do not rewrite the pixel math.** It is the deterministic, anti-AI core and the brand promise. Re-deriving it risks output drift that is brutal to debug. Everything else (UI shell, backend, auth) is a fresh build.

---

## Table of contents

1. Goals and non-goals
2. High-level architecture
3. New desktop project structure
4. Build order (Windows first)
5. Feature inventory with source references
6. Licensing and auth (Model A: perpetual license + paid updates)
7. Local backend (SQLite)
8. Cloud backend changes (desktop-auth API)
9. Packaging, signing, auto-update
10. Effects engine port and parity testing
11. Reuse vs rewrite vs drop
12. Open decisions
13. Milestone checklist

---

## 1. Goals and non-goals

**Goals**

- One cross-platform Electron app (Windows first) that runs the full Bitgrain tool.
- Works offline. Network is an optional enhancement, never a hard dependency for creating and exporting.
- Model A licensing: pay once, own that version forever, updates included for a fixed window (1 year), renew for newer versions. Never a subscription.
- Deterministic output parity with the web app.
- Local-first storage: projects and assets live on the user's disk.

**Non-goals (for this phase)**

- Native Swift/Metal rewrite (that is a later phase).
- Real-time collaboration or multiplayer.
- Rewriting the effects engine.
- Rewriting the cloud backend. It gains a small desktop-auth surface, nothing more.

---

## 2. High-level architecture

Three parts:

1. **Renderer (the app UI)**: the ported React + effects engine, running in Electron's Chromium renderer. This is the bulk of the reuse.
2. **Local backend**: runs inside the Electron **main process** as a small local HTTP server on `127.0.0.1:<port>`, backed by **SQLite** and the local filesystem. Handles projects, assets, and license/plan checks offline. Recommended stack: `fastify` + `better-sqlite3` in TypeScript. This lets the ported `api-client.ts` keep working by just pointing `VITE_API_BASE` at the local server.
3. **Cloud backend (existing Go)**: unchanged except for a new **desktop-auth API** used only when online, for login, license issuance, license refresh, and (optionally) sync.

```
Electron app
  Renderer (Chromium)          Main process (Node/TS)          Cloud (existing Go, online only)
  ┌────────────────────┐       ┌──────────────────────┐        ┌───────────────────────────┐
  │ React UI + engine  │  IPC  │ Local HTTP server     │  HTTPS │ /desktop/login            │
  │ api-client.ts ─────┼──────▶│ fastify + SQLite      │───────▶│ /desktop/token /refresh   │
  │ (VITE_API_BASE =   │       │ file storage          │        │ /desktop/revoke /devices  │
  │  127.0.0.1:PORT)   │       │ license verify (Ed25519)│      │ (reuses accounts/Postgres)│
  └────────────────────┘       └──────────────────────┘        └───────────────────────────┘
```

Why local backend in the main process (not a Go sidecar): the from-scratch rewrite does not reuse the Go backend, the local needs are small (SQLite + files + signature verify), and Node in the main process shares types with the frontend and avoids shipping a second binary. Go sidecar remains an option if you prefer writing that logic in Go; if so, spawn it from the main process and keep the same localhost HTTP contract.

---

## 3. New desktop project structure

Proposed layout for the new folder (suggested name `bitgrain-desktop`):

```
bitgrain-desktop/
  package.json
  electron.vite.config.ts        # electron-vite: renderer + main + preload
  electron-builder.yml           # packaging config (win/mac/linux)
  src/
    main/                        # Electron main process
      index.ts                   # app lifecycle, window creation
      local-server/              # fastify local backend
        server.ts                # boots fastify on 127.0.0.1:PORT
        db.ts                    # better-sqlite3 connection + migrations
        routes/                  # local API routes (projects, assets, credits)
      license/                   # offline license verification (Ed25519)
        verify.ts
        store.ts                 # safeStorage keychain read/write
      auth/                      # loopback login flow
        loopback.ts              # temporary 127.0.0.1 callback server + PKCE
      updater/                   # electron-updater wiring
      ipc.ts                     # IPC handlers exposed to renderer
      file-associations.ts       # .btg open handling
    preload/
      index.ts                   # contextBridge: safe window.bitgrain API
    renderer/                    # the ported web app
      engine/                    # PORTED from web repo src/engine (as-is)
      components/ pages/ hooks/ lib/ store/ utils/ data/ modules/
      ...                        # ported UI, minus web-only pieces (see §11)
  resources/
    templates/                   # bundled baseline templates/assets (offline)
    license-public-key.pem       # baked-in Ed25519 public key
```

Tooling choice: **electron-vite** for dev and build (fast HMR, three-target config), **electron-builder** for packaging and auto-update. Both are mature and Windows-friendly.

---

## 4. Build order (Windows first)

Ship in thin vertical slices. Each slice should run on Windows before moving on.

1. **Shell boots**: electron-vite app, one window, loads a placeholder React page. Package a `.exe` with electron-builder. Confirm it runs on Windows.
2. **Engine renders offline**: port `src/engine` and the Home editor pipeline, load an image, apply one effect (halftone), export a PNG to disk. No network, no login. This is the proof the core works.
3. **Local backend**: fastify + SQLite in the main process; port `api-client.ts` pointed at `127.0.0.1:PORT`; wire local project save/load (`.btg`) to SQLite + disk.
4. **Full editor**: port Studio and the rest of the export pipeline. Bundle baseline templates.
5. **Licensing and auth**: loopback login, `/desktop/token`, offline Ed25519 verification, Model A update-window gating, hard reconnect wall.
6. **Packaging polish**: Authenticode signing, auto-update, `.btg` file association, installer.
7. **Then** macOS and Linux targets.

---

## 5. Feature inventory with source references

Each row: the feature, where it lives now (port from here), and desktop notes.

### 5.1 Effects engine (port as-is)

Web repo: `src/engine` (~9,554 LOC). This entire directory ports over with minimal changes.

| Feature | Source path | Notes |
|---|---|---|
| Render pipeline + plugin registry | `src/engine/engine.ts` | `runTransform(mode\|modes, ctx)`, registers 28 plugins |
| Core types | `src/engine/types.ts` | `ImagePlugin`, `TransformContext`, etc. |
| Off-thread transform | `src/engine/transform.worker.ts`, `src/utils/bitgrain-worker-client.ts`, `src/utils/bitgrain-effect.worker.ts` | Web Workers; keep in renderer |
| ASCII | `src/engine/plugins/ascii.ts` | |
| Braille | `src/engine/plugins/braille.ts` | |
| Contour | `src/engine/plugins/contour.ts` | |
| Dither | `src/engine/plugins/dither.ts` | Bayer/Floyd-Steinberg/blue-noise |
| Dot matrix / blocky / grunge | `src/engine/plugins/extra.ts` | |
| Invert / grayscale / pixelate | `src/engine/plugins/filters.ts` | |
| Film grain | `src/engine/plugins/creative.ts` | |
| LUT color grade | `src/engine/plugins/lut.ts`, `src/engine/luts.ts` | |
| Haze and bloom | `src/engine/plugins/haze-bloom.ts` | |
| Halftone | `src/engine/plugins/halftone.ts` | mono/color/CMYK |
| Scanlines | `src/engine/plugins/scanlines.ts` | |
| Crosshatch | `src/engine/plugins/crosshatch.ts` | |
| Ink wash | `src/engine/plugins/inkwash.ts` | |
| Manga screentone | `src/engine/plugins/manga.ts` | |
| Pop grunge | `src/engine/plugins/popart.ts` | |
| Photocopy / misprint | `src/engine/plugins/print.ts` | |
| Fold / dust paper aging | `src/engine/plugins/paper.ts` | |
| Duotone / vignette / posterize / sharpen / colorwash | `src/engine/plugins/grade.ts` | |
| Selective (masked) effects | `src/engine/selective/selective-effects.ts` | |
| Riso separation | `src/engine/riso-client.ts`, `src/engine/riso.worker.ts`, `src/engine/riso-inks.ts` | |
| Print-finish ("ugly print" toning) | `src/engine/print-finish.ts`, `src/utils/bitgrain-effect.ts` | |
| Watermark | `src/engine/watermark.ts` | Only applied on free/unlicensed exports |
| Export-scale parity | `src/components/output-preview/export-render.ts`, `src/utils/render-scale.ts`, `src/utils/bitgrain-effect-core.ts` | Preview-res render then scale; keep identical for parity |
| Presets | `src/engine/presets.ts`, `src/engine/presets/*` | |
| Palettes / blue noise / color analysis | `src/engine/palettes.ts`, `src/engine/BlueNoise.ts`, `src/engine/ColorAnalysis.ts`, `src/engine/utils/color.ts` | |
| Batch renderer | `src/engine/BatchRenderer.ts` | |
| Mockup warp engine | `src/engine/mockup/*` (compose, warp-renderer, warp-shaders, homography, detect/*) | Smart-object mockups |

### 5.2 Home (single-image) editor

| Feature | Source path |
|---|---|
| Home page | `src/pages/Home.tsx` |
| Preview pipeline | `src/components/output-preview/use-output-pipeline.ts`, `use-preview-worker.ts`, `main-thread-process.ts`, `render-helpers.ts`, `preview-cache.ts` |
| Toolbar + per-effect popovers | `src/components/toolbar/*` |
| Effect state store | `src/store/transform-store.ts`, `src/store/image-store.ts`, `src/store/history-store.ts` |

### 5.3 Studio (multi-layer editor)

Web repo: `src/components/studio` (~17,112 LOC) + `src/pages/studio-page`.

| Feature | Source path |
|---|---|
| Studio route + shell | `src/pages/Studio.tsx`, `src/pages/studio-page/StudioWorkspace.tsx` |
| Mobile shell (optional on desktop) | `src/pages/studio-page/mobile/*` |
| Top bar / left panel / right panel / rail | `src/components/studio/TopBar.tsx` (+ `topbar/*`), `LeftPanel.tsx`, `RightPanel.tsx`, `PanelRail.tsx` |
| Canvas viewport | `src/components/studio/canvas-area.tsx`, `src/components/studio/canvas/*` |
| Layer model (all types) | `src/data/studioTypes.ts` (`ImageLayer`, `TextLayer`, `ShapeLayer`, `UploadLayer`, `GroupLayer`, `VectorLayer`, `InkLayer`) |
| Layer factories | `src/utils/studio-layers.ts` |
| Layer views | `src/components/studio/layers/*` (Image, Text, Shape, Upload, Group, Ink, Vector, SelectionHandles) |
| Property panels | `src/components/studio/panels/*Properties.tsx` (Image, Text, Shape, Upload, Group, Ink, Vector, Pattern, MultiSelect, Background/Page) |
| Bitgrain effect controls per layer | `src/components/studio/panels/BitgrainEffectControls.tsx` |
| Edge/tape decorations | `src/components/studio/panels/EdgeFrameControls.tsx`, `TapeControls.tsx` |
| Layers list | `src/components/studio/panels/LayersList.tsx`, `PagedLayersList.tsx`, `LayerRow.tsx` |
| Shared UI primitives | `src/components/studio/ui/*` (slider, panel-group, ColorPicker, dropdown, menus, inputs, align-row) |
| Pattern generator | `src/utils/pattern-engine.ts`, `src/data/pattern-meta.ts` |
| Studio hooks / glue | `src/pages/studio-page/use-studio-*.ts`, `useStudioShortcuts.ts` |
| Studio export | `src/components/studio/hooks/useStudioExport.ts`, `hooks/export/*` |

### 5.4 Video editor

Web repo: `src/modules/video` (~16,736 LOC).

| Feature | Source path |
|---|---|
| Editor shell | `src/pages/VideoEditor.tsx`, `src/modules/video/components/VideoEditor.tsx` |
| Data model | `src/modules/video/types.ts` |
| Stores | `src/modules/video/store/*` |
| Frame pipeline / compositing | `src/modules/video/engine/frame-pipeline.ts`, `frame-source.ts`, `image-painter.ts` (animate-still), `text-painter.ts`, `tracking-*.ts` |
| Overlay effects | `src/modules/video/engine/overlay-effects/*` |
| Audio | `src/modules/video/engine/audio-*.ts`, `extract-waveform.ts` |
| MP4 export (WebCodecs + mp4-muxer) | `src/modules/video/engine/exporter/webcodecs-exporter.ts` |
| WebM fallback | `src/modules/video/engine/exporter/recorder-exporter.ts` |
| Plan gate (resolution) | `src/modules/video/engine/exporter/export-plan-gate.ts` |
| Timeline UI | `src/modules/video/components/timeline/*` |
| Inspectors | `src/modules/video/components/panels/*` |

Note: WebCodecs and MediaRecorder are Chromium APIs, so they work in the Electron renderer unchanged.

### 5.5 Export pipeline

| Format | Source path |
|---|---|
| Encoder dispatcher | `src/engine/export/encode-image.ts` |
| Indexed PNG | `src/engine/export/png-encoder.ts` |
| Truecolor PNG | `src/engine/export/truecolor-png-encoder.ts` |
| HDR PNG | `src/engine/export/hdr-png-encoder.ts` |
| Quantize / CRC | `src/engine/export/quantize.ts`, `crc32.ts` |
| Encode worker + client | `src/engine/export/encode.worker.ts`, `export-client.ts` |
| High-level single-image exporter | `src/engine/Exporter.ts` |
| PNG/WebP/JPEG/HDR (studio pages) | `src/components/studio/hooks/export/export-pages.ts`, `src/utils/image-utils.ts` |
| SVG | `src/engine/animate/export-svg.ts`, `src/components/studio/hooks/export/shape-svg.ts` |
| PDF (jspdf) | `src/components/studio/hooks/export/export-pages.ts` |
| GIF | `src/engine/animate/export-gif.ts` |
| WebM/MP4 (animation) | `src/engine/animate/export-frames.ts`, `encode-animation.ts` |
| Lottie | `src/engine/animate/lottie/build-lottie.ts` |
| Page animation orchestration | `src/engine/animate/export-page-animation.ts` |
| Riso ZIP (fflate) | `src/components/modals/RisoExportModal.tsx` |
| Batch export | `src/engine/BatchRenderer.ts`, `src/hooks/useBatchProcessor.ts`, `src/components/modals/batch/*` |
| Export entry UIs | `src/components/studio/topbar/use-export-handlers.ts`, `src/components/studio/panels/ExportPopup.tsx`, `src/components/toolbar/ExportPopover.tsx` |

Desktop opportunity: replace browser "download" with a native save dialog via IPC (Electron `dialog.showSaveDialog`). Keep the encoders identical; only the final write changes.

### 5.6 Import / decode

| Feature | Source path | Library |
|---|---|---|
| Upload intake | `src/pages/home-page/handle-image-upload.ts` | |
| Accepted formats | `src/pages/home-page/accept-formats.ts` | |
| RAW | `src/pages/home-page/raw-converter.ts` | `libraw-wasm` |
| TIFF | `src/pages/home-page/tiff-converter.ts` | `utif` |
| HEIC | `src/utils/image-utils.ts` | `heic2any` |
| Type shims | `src/types/external-modules.d.ts` | |

These WASM/JS libs run in the renderer unchanged. Later native phase can swap them for OS codecs.

### 5.7 Templates, assets, design kits

| Feature | Source path |
|---|---|
| Template model | `src/data/studioTypes.ts` (`TemplateDef`, `TemplatePage`) |
| Template data | `src/data/templates/*`, `src/data/templateHelpers.ts` |
| Template API client | `src/lib/templates-api.ts` |
| Asset-store client | `src/lib/template-assets.ts` |
| Template search | `src/lib/template-search.ts`, `src/store/templates-store.ts` |
| Gallery UI | `src/pages/TemplateGallery.tsx`, `Templates.tsx`, `src/components/templates/browse/*`, `src/components/studio/panels/TemplateGrid.tsx` |
| Design kits | `src/data/design-kit-types.ts`, `src/store/design-kits-store.ts`, `src/lib/design-kits-api.ts`, `src/components/studio/design-kit/*` |

Desktop change: **bundle a baseline set of templates/assets** under `resources/templates/` so the app is complete offline. The online catalog becomes an optional "download more" via the cloud when online.

### 5.8 Fonts

| Feature | Source path |
|---|---|
| Studio font loading | `src/lib/load-studio-fonts.ts`, `src/lib/system-fonts.ts`, `src/lib/admin-fonts.ts` |
| Custom fonts per project | `src/pages/studio-page/load-custom-fonts.ts` |
| Typography types | `src/data/studioTypes.ts` (`CustomFontEntry`, `GradientTextConfig`, `TextEffect`) |
| Video fonts | `src/modules/video/utils/font-loader.ts`, `device-fonts.ts` |

Desktop opportunity: enumerate installed system fonts natively; bundle the core web font set in `resources/`.

### 5.9 .btg project format

| Feature | Source path |
|---|---|
| Serialize (home + studio) | `src/utils/btg-export.ts` (`BTGImageEditorProject`, `BTGStudioProject`) |
| Load studio project | `src/pages/studio-page/load-btg.ts` |
| Import entry | `src/components/studio-home/import-btg.ts` |
| Save/export-as UI | `src/components/studio/topbar/TopBarMenus.tsx` |
| Local persistence | `src/utils/studio-persist.ts`, `src/store/studio-projects-store.ts` |

Desktop change: `.btg` becomes a real file type. Register the file association (open `.btg` from Explorer), and route project save/load through the local backend (SQLite index + `.btg` on disk) instead of browser localStorage/cloud.

### 5.10 State / reactivity (port as-is)

| Feature | Source path |
|---|---|
| Signal primitive | `src/lib/signal.ts` |
| Global stores | `src/store/*` (workspace-appearance, transform, image, history, design-kits, templates, studio-projects, trial, user-credits, etc.) |
| Event buses | `src/lib/event-bus.ts`, `src/lib/tutorial-event-bus.ts` |

Note the popover/toast convention: events + custom portal, not `useState`. Keep that pattern in the desktop UI.

---

## 6. Licensing and auth (Model A)

**Model A: perpetual license + time-boxed updates.** Pay once, own that version forever (the app never stops working), updates included for a fixed window (default 1 year), renew (priced below initial) for access to newer versions.

### 6.1 Three separate clocks (never conflate)

Core principle (launch model): **the desktop app is Pro-only. There is no free desktop mode.** The app does nothing until the user logs in with an email that owns a valid Pro plan. Without one, they see only the login screen with a "you haven't purchased a plan" message and a button to buy on the website. Payments never happen in the app. (A future free/degraded tier can be added later; deferred for now.)

| Clock | Length | Purpose | Effect at end |
|---|---|---|---|
| Lease (`exp`) | ~30 days | Offline validity window; online re-check cadence | **Logout to the login screen** (app locked until re-login) |
| Updates window (`updatesUntil`) | 1 year | Gates access to newer builds only | Blocks running builds newer than the window |
| Use / entitlement | Perpetual | The Pro version you own | Never expires (but Pro must be periodically re-verified per the lease) |

Within the lease the app runs fully offline (local signature verify, no server). Only at lease expiry *while offline* does it fall back to the login screen.

### 6.2 Login flow (email OTP, in-app, no browser)

Primary desktop auth is a passwordless email code entered in the app. It works for every account regardless of how they signed up (Google or email/password), because it only proves control of the purchase email.

1. User enters their email in the app.
2. App → `POST /desktop/auth/request-code {email, deviceId}`. Server checks that the email owns a license and emails a 6-digit code (reuse `server/internal/notif/email.go`).
3. User types the code → `POST /desktop/auth/verify-code {email, code, deviceId}`. Server verifies the code, then checks the account owns a **valid Pro plan** and enforces the device cap:
   - Has Pro → returns a **session JWT** (existing HS256, from `auth.IssueToken`, Bearer for cloud calls) + a **signed license token** (new, Ed25519, for offline gating). App enters.
   - No Pro plan → returns a `no_plan` result. App stays on the login screen showing "you haven't purchased a plan" and a button that opens `https://bitgrain.app/pricing` in the system browser.

There is no free entry. No valid Pro plan means no access to the app.

Optional secondary path: Google-via-browser-loopback (PKCE, temporary `127.0.0.1/callback` server, `GET /desktop/login` on the cloud) for users who prefer it. Loopback is preferred over a custom `bitgrain://` protocol (custom-protocol registration is flaky cross-platform).

### 6.3 The signed license token (offline-verifiable)

Minted by the cloud, signed with an **Ed25519 private key** the server holds. The app embeds only the **public key** (`resources/license-public-key.pem`) and verifies fully offline.

```
{
  "sub":        "<userId>",
  "email":      "user@example.com",
  "deviceId":   "<uuid>",
  "plan":       "pro",
  "sku":        "pro-desktop",
  "iat":        1710000000,
  "exp":        1712592000,     // LEASE, iat + 30d, drives re-check
  "updatesUntil":    1741536000,// purchase/renewal date + 1yr (display + renewal math)
  "entitledVersion": "3.2",     // highest FEATURE LINE (MAJOR.MINOR) the window covers
  "ver":        1
  // no perpetual use-expiry: an owned build runs forever
}
```

### 6.4 Update model: maintenance vs feature (gate by version, not date)

Updates split into two lanes:

- **Maintenance** = `PATCH` bumps (bug fixes, crash fixes, security). Free to everyone who owns that feature line, forever, regardless of the updates window.
- **Feature** = `MAJOR.MINOR` bumps (new capabilities). Gated by the updates window.

Versioning: semver `MAJOR.MINOR.PATCH`; **feature line = `MAJOR.MINOR`**; a `PATCH` bump is maintenance on an existing line.

**Run-gate (local backstop):** on launch, verify the signature, then allow the build if `featureLine(build) <= entitledVersion`.
- `3.2.9` (a late patch on line `3.2`) → `3.2 <= 3.2` → runs, even if released long after `updatesUntil`. This is the "bug fix caught months later still reaches that version" case.
- `3.3.0` / `4.0.0` (a new feature line) → `3.3 > 3.2` → blocked with a "renew updates to upgrade" screen. The user can keep running any build on their entitled line.

Do NOT gate by `BUILD_RELEASE_DATE` (it would wrongly block late maintenance patches). `entitledVersion` is derived server-side from `updatesUntil` at token issue/refresh.

### 6.4a Update delivery (electron-updater, per-line feeds)

Host builds + `latest.yml` manifests per feature line (generic provider, static-hostable):

```
updates/3.2/latest.yml   -> newest PATCH of the 3.2 line (maintenance)
updates/3.3/latest.yml   -> newest patch of the 3.3 line
updates/latest.yml       -> newest feature release overall
```

- The app's auto-update feed = the maintenance feed for its entitled line: `updates/<entitledVersion>/latest.yml`. So it always auto-updates to the newest patch of the line it owns. To push a fix months later: cut a `PATCH` on that line, publish to the feed, every owner gets it automatically and free.
- Separately, when online, the app queries a metadata endpoint (e.g. `GET /desktop/latest-version`) for the newest feature line. If newer and the plan covers it, `entitledVersion` bumps on next `POST /desktop/refresh` and the app switches feeds. If newer but not covered, show a non-blocking "renew to upgrade" note. Never auto-install a build the run-gate would refuse.
- Maintain only the latest entitled line (do not backport to old lines; the updater moves in-window users forward to `latest` for free). Security patches are always delivered, optionally force-installed.

### 6.5 Lease enforcement (logout to login screen)

No login chrome while valid; the session just quietly ends and returns to the login screen.

- **While valid: completely silent.** No account badge, no nag, no login UI. The app just runs as Pro, fully offline within the lease.
- **While online: silent background refresh** at ~half the lease life via `POST /desktop/refresh`. Anyone who opens the app even occasionally online never sees login again.
- **At lease (`exp`) end while offline (or on revocation): logout to the login screen.** Not a "killed/expired" alarm, just the neutral login page. Saved local projects are never touched. Re-login (needs the server) re-runs the checks (license valid, not refunded, device within cap, updates window ok) and lets them back in.

**Open: exit insurance (deferred by the Pro-only launch model).** Because there is no free fallback, a locked-out user needs the server to re-activate, so permanent server death makes re-activation impossible. Bounded by the ~30-day offline lease (day-to-day offline use is fine), but the extreme case still needs a decision later: a **kill-switch-to-perpetual** final update, or adding the free/degraded fallback tier. Revisit when the "later we can change this model" free tier is introduced.

### 6.6 Local storage of tokens and tamper guards

- Store the session JWT + license token in the OS keychain via Electron `safeStorage` (Windows Credential Manager, macOS Keychain, libsecret on Linux).
- `deviceId` is generated on first run and persisted; it feeds the device/seat cap.
- **Clock-tamper guard**: persist the last server-seen timestamp; reject the license if the local clock has rolled backward past it. Do not over-engineer beyond this; accept that any local-only license is ultimately crackable. Aim for "honest people pay easily," not unbreakable DRM.

---

## 7. Local backend (SQLite)

Runs in the Electron main process as a fastify server on `127.0.0.1:<port>`. The ported `api-client.ts` points `VITE_API_BASE` at it, so most of the frontend's `callApi(...)` usage works unchanged.

### 7.1 Endpoints the frontend already expects (serve locally)

From the web route table, the offline-relevant ones to reimplement against SQLite/disk:

- `GET /api/credits` — return the resolved plan from the local license token (plan, updatesUntil, no cloud call). Replaces the cloud `credits.go` `GetCredits` for offline.
- `GET/POST /api/projects` — list/save projects (SQLite index + `.btg` on disk). Cloud equivalent: `server/internal/handlers/projects.go`.
- `GET/POST /api/presets`, `/api/design-kits` — local CRUD. Cloud equivalents: `presets.go`, `design_kits.go`.
- `GET /api/templates`, `/api/assets`, `/api/fonts` — serve bundled `resources/` content; fall through to cloud when online. Cloud equivalents: `templates.go`, `assets.go`, `fonts.go`.
- `GET /auth/me` — return the locally cached account identity from the license token.

Anything purely online (payments, chat, newsletter, feedback) stays pointed at the cloud and simply no-ops offline (the ported `api-client` already returns `null` and flips `backendOnlineSignal` when unreachable).

### 7.2 Suggested SQLite schema (local)

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,            -- 'studio' | 'image' | 'video'
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,       -- path to the .btg on disk
  thumbnail_path TEXT,
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE design_kits (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER);
CREATE TABLE presets    (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER);
CREATE TABLE settings   (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE license    (           -- single row cache of the verified token
  device_id TEXT, email TEXT, plan TEXT, sku TEXT,
  lease_exp INTEGER, updates_until INTEGER,
  token TEXT, last_server_time INTEGER
);
```

Stack: `better-sqlite3` (synchronous, fast, ideal for the main process). Project files (`.btg`), thumbnails, and imported assets live under the app's user-data dir on disk; SQLite holds only the index and small records.

### 7.3 api-client changes for desktop

Port `src/lib/api-client.ts` with two edits:

- `resolveApiBase()` returns the local server URL by default (`http://127.0.0.1:PORT`).
- Replace `credentials: "include"` (cookie) with an `Authorization: Bearer <sessionJwt>` header read from the keychain, for calls that go to the **cloud**. Local calls need no auth (loopback, same machine).

Keep the single choke-point discipline: consolidate the ~4 stray direct `fetch()` calls (`useAuth.ts`, `Feedback.tsx`, `chat-logic.ts`, `studio-plugins/host/api.ts`) through the ported client.

---

## 8. Cloud backend changes (desktop-auth API)

The existing Go backend is **not rewritten**. Add a small desktop-auth surface. Reuse existing accounts, Postgres, and JWT.

### 8.1 New endpoints (new handler file, e.g. `server/internal/handlers/desktop_auth.go`)

Primary path (email OTP, in-app):
- `POST /desktop/auth/request-code` — body `{email, deviceId}`. Look up the account, check it owns a license, generate a short-lived 6-digit code (store hashed with a few-minute TTL), email it via `server/internal/notif/email.go`. Always respond 200 regardless of whether the email exists (avoid account enumeration).
- `POST /desktop/auth/verify-code` — body `{email, code, deviceId}`. Verify the code, then require a **valid Pro plan** on the account (via `credits.go` `resolvePlan`) and enforce the **device cap** (register/reject `deviceId` in `desktop_devices`). If Pro: return `{sessionJwt, licenseToken}` (session JWT via `auth.IssueToken` in `server/internal/auth/jwt.go`; license token via the new Ed25519 signer). If no Pro plan: return `{status: "no_plan"}` and issue no tokens, so the app keeps the user on the login screen with a buy link.

Shared:
- `POST /desktop/refresh` — body `{deviceId}` with `Authorization: Bearer <sessionJwt>`. Re-read plan via `credits.go` `resolvePlan` + the user's `updates_until`, return a fresh `{sessionJwt, licenseToken}` with a new lease. On failure the app silently logs out to free (§6.5).
- `POST /desktop/revoke` — revoke a device (refunds/abuse/"log out this device").
- `GET  /desktop/devices` — list devices for the account (seat management / deauthorize).

Optional secondary path (Google browser loopback):
- `GET  /desktop/login` — browser login page. Reuse `auth.go` login. On success, mint a one-time code bound to `{userId, deviceId, code_challenge}` and redirect to the loopback `redirect` with `?code=...`.
- `POST /desktop/token` — body `{code, code_verifier, deviceId}`. Verify PKCE, return `{sessionJwt, licenseToken}`.

Wire these in `server/router_public.go` (`registerCoreRoutes`). The auth middleware (`server/internal/auth/middleware.go`) already accepts `Authorization: Bearer <jwt>` before the cookie, so Bearer works with no middleware change.

### 8.2 New Ed25519 license signer

- New env var `DESKTOP_LICENSE_SIGN_KEY` (Ed25519 private key) on the server. App embeds the matching public key.
- New helper (e.g. `server/internal/license/sign.go`) that signs the token payload in §6.3.

### 8.3 New DB migrations (`server/internal/db/migrations/`, next numbers)

- `053_desktop_devices.sql` — `desktop_devices(device_id, user_id, created_at, last_seen, revoked)`.
- `054_desktop_updates_until.sql` — add `users.updates_until TIMESTAMPTZ` (or a `licenses` table if you want history).

### 8.4 Model A grant logic (new SKU)

Add SKU `pro-desktop` alongside the existing `pro-license-10yr`. On purchase (extend `payments.go` `grantCreditsForOrder` and `paypal.go` `grantCreditsForPayPalOrder`):

- Set `plan = 'pro'` with **no expiry** (perpetual use), and set `updates_until = now() + interval '1 year'`.
- Renewal extends `updates_until` by another year (does not change perpetual use).

Contrast with the web `pro-license-10yr` which sets `plan_expires_at = now() + '10 years'` via `models.TermLicense` (`server/internal/models/credit.go`). Do not reuse that path for desktop; desktop use is perpetual and only updates expire.

Decide separately whether to eventually migrate the web app to this same perpetual+paid-updates model.

---

## 9. Packaging, signing, auto-update

### 9.1 Windows (first target)

- Package with **electron-builder** to `.exe` (NSIS installer) and optionally `.msi`.
- **Code signing (Authenticode)**: required to avoid SmartScreen "unknown publisher" warnings. Note the modern requirement: standard OV certs now need a hardware token or cloud HSM; EV certs give instant SmartScreen reputation.
- **Auto-update**: `electron-updater` (pairs with electron-builder). Per-feature-line maintenance feeds so bug fixes always reach owners; feature releases gated by `entitledVersion` (see §6.4 and §6.4a).
- Registers `.btg` file association in the NSIS config.

### 9.2 macOS and Linux (later)

- macOS: `.dmg`, Developer ID signing + notarization (requires the $99/year Apple Developer Program, only needed at distribution time).
- Linux: `.AppImage` (portable, no signing needed) plus optional `.deb`.

### 9.3 Build metadata

- Inject `BUILD_RELEASE_DATE` at build time (electron-builder `extraMetadata` or a generated constant) for update-window enforcement.
- Embed the Ed25519 public key from `resources/`.

---

## 10. Effects engine port and parity testing

The engine is CPU/Canvas-2D pixel math on `Float32Array` (no WebGL/shaders), so output is deterministic and not GPU-driver dependent. It ports to the Electron renderer as-is.

**Parity harness (build this early):** render a fixed set of source images through each effect at fixed params, in both the web app and the desktop app, and pixel-diff the exports. Any nonzero diff is a regression in the port. This protects the anti-AI brand promise. Reference the existing export-scale logic (`src/components/output-preview/export-render.ts`, `src/utils/render-scale.ts`) and keep it byte-identical.

---

## 11. Reuse vs rewrite vs drop

**Reuse as-is (port directly)**

- `src/engine/*` (effects, export encoders, riso, print-finish, watermark, mockup)
- `src/modules/video/*` (WebCodecs/MediaRecorder work in Electron)
- `src/lib/signal.ts` and `src/store/*`
- Studio and Home UI components, layer model (`src/data/studioTypes.ts`)
- Import libs (`libraw-wasm`, `heic2any`, `utif`)

**Rewrite for desktop**

- `src/lib/api-client.ts` (point at local server, Bearer instead of cookie)
- Auth/user/plan layer: `src/hooks/useAuth.ts`, `useUser.ts`, `use-credit-actions.ts` (loopback login, offline license, drop the "offline = unlimited" fallback in `useUser.ts` since a real license now governs offline state)
- Project persistence: route `.btg` save/load through the local backend instead of localStorage/cloud
- Download handlers: use native save dialogs via IPC
- New: local backend (fastify + SQLite), license verify, loopback auth, updater, IPC, preload

**Drop (web-only, not needed in the app)**

- Marketing/SEO: `src/pages/landing*`, `comparisons`, `tools`, `Landing`, `Pricing`, blog pages, `api/*-seo.ts`, `api/og-image.ts`, `api/sitemap.ts`, `vercel.json`
- Web payment modals inside the app (purchases happen online via the browser/website): `StudioPaymentModal.tsx`, `PayPalCheckoutModal.tsx`, Razorpay loaders. The app links out to the website to buy/renew.
- The Vercel serverless `api/` directory
- Service worker / PWA bits (`src/main.tsx` SW teardown, vite PWA plugin)

**Keep pointed at cloud (online only)**

- Sync of projects/kits/presets (optional), template/asset catalog "download more", chat, feedback, account management. All degrade gracefully offline.

---

## 12. Open decisions

- Lease length `X` (suggested 30 days).
- Updates window (suggested 1 year) and renewal price (suggested ~50-60% of initial purchase).
- Device/seat count per license.
- Local backend language: Node/TS in main process (recommended) vs Go sidecar.
- Hard-lock vs soft-nag on lease expiry, and the kill-switch-to-perpetual commitment for exit insurance (see §6.5).
- Desktop price point (independent of the web `$69` / `₹2,999`).
- Whether to eventually align the web app to the same perpetual+paid-updates model.

---

## 13. Milestone checklist

- [ ] M1: electron-vite shell boots on Windows, packages to `.exe`.
- [ ] M2: engine ported, Home editor renders + exports PNG fully offline.
- [ ] M3: parity harness green (desktop exports match web pixel-for-pixel).
- [ ] M4: local backend (fastify + SQLite), `.btg` save/load, `api-client` on localhost.
- [ ] M5: Studio ported and functional offline; baseline templates bundled.
- [ ] M6: video editor ported, MP4/WebM export working.
- [ ] M7: loopback login + `/desktop/token` + Ed25519 offline verification.
- [ ] M8: Model A update-window gating + lease reconnect wall.
- [ ] M9: Authenticode signing + auto-update + `.btg` association + installer.
- [ ] M10: macOS and Linux targets.

---

## Appendix: native OS capabilities (Electron, Windows + Mac)

**Out of the box (no native code):** native open/save dialogs (replace browser download), `.btg` file associations + double-click open + recent files, drag-and-drop files, native print + print-to-PDF (`webContents.print()`/`printToPDF()`, relevant for the print-media brand), clipboard (paste image in / copy result out), secure token storage (`safeStorage` = Keychain / Credential Manager), OS notifications (export finished), export progress in dock (Mac) / taskbar (Windows), native menus + context menus + global shortcuts + tray, multi-monitor/DPI/display info, frameless/vibrancy windows, deep links (`bitgrain://`), auto-update, shell integration (reveal in folder, trash, open-with-default), camera/mic/screen capture via web APIs, GPU-accelerated canvas/WebGL/WebGPU in the renderer.

**Needs a native addon (N-API / FFI / bundled Swift/ObjC/C++ helper):** system font enumeration for the studio (`font-list` or CoreText/DirectWrite), Quick Look thumbnails / Finder previews (Mac) or Explorer thumbnail handlers (Windows) for `.btg`, Touch Bar (Mac), jump lists / thumbnail toolbars (Windows), any direct platform-SDK call.

**macOS haptics (Force Touch trackpad only):** `NSHapticFeedbackManager.defaultPerformer.perform(...)` via a tiny ObjC N-API addon (Electron does not expose it). Patterns: `.alignment` (great for snap-to-guide in the Studio canvas, `src/components/studio/canvas/*`), `.levelChange`, `.generic`. Fires only on MacBook trackpads / Magic Trackpad 2 (no actuator on the Mac itself); feature-detect and no-op otherwise. No practical Windows equivalent. Phase-2 polish, not core.

**The one ceiling:** Electron does NOT expose raw Metal (Mac) or DirectX/Vulkan (Windows) compute from JS. You get Chromium's GPU-accelerated canvas/WebGL/WebGPU, not GPU compute kernels. The CPU Canvas-2D engine is fine in Electron today; Metal-speed effect processing is exactly the reason for the phase-2 native apps (or a native addon). Everything else above is covered by Electron.

---

## Reference: current auth facts (from the web repo)

- Auth today = HttpOnly cookie `imgi_token` carrying a 30-day HS256 JWT (`server/internal/auth/jwt.go` `IssueToken`). JS never sees the token.
- Middleware accepts `Authorization: Bearer <jwt>` before the cookie (`server/internal/auth/middleware.go` `claimsFromRequest`). This is the desktop hook.
- There is no token-returning endpoint today; login only sets the cookie. The new `/desktop/token` fills that gap.
- Plan is stored on `users.plan` + `users.plan_expires_at`, resolved (and auto-downgraded when expired) by `resolvePlan` in `server/internal/handlers/credits.go`, surfaced via `GET /api/credits`.
- License is granted on payment by `grantCreditsForOrder` (`payments.go`) / `grantCreditsForPayPalOrder` (`paypal.go`) using `models.TermLicense` (`server/internal/models/credit.go`).
