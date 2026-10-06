# Bitgrain Desktop

Electron desktop app for Bitgrain, the deterministic creative suite. Local-first, offline-capable, no AI, no upload.

Planning documents:

- `WHAT-BITGRAIN-CAN-DO.md`, the capability inventory
- `DESKTOP_APP_PLAN.md`, the architecture and feature map
- `BUILD_PLAN.md`, the sequenced work order and milestone acceptance tests
- `PORTED.md`, provenance of every file ported from the web repo

## Requirements

Node 22 or newer, npm.

## Commands

```
npm run dev            # electron-vite dev, HMR on the renderer
npm run build          # typecheck, then build main, preload, renderer
npm run typecheck      # tsc project references, both targets
npm run build:native   # build the macOS haptics addon (native/haptics)
npm run smoke          # boot the built app, screenshot, fail on any renderer error
npm run render-check   # render effects offline, verify PNG output and determinism
npm run parallel-check # assert banded multi-core output == single-pass, byte for byte
npm run verify         # build + smoke + render-check + parallel-check
npm run compute-bench  # measure multi-core headroom, assert byte-identical output
```

`npm run verify` is the gate. Run it before every commit.

## Layout

```
src/
  main/         Electron main process, window, IPC, CSP
  preload/      contextBridge surface, exposes window.bitgrain
  shared/       types shared by main, preload, and renderer
  renderer/     the app itself
    engine/     ported effects engine, do not edit pixel math
    harness/    headless render entry, seeds the parity harness
scripts/        smoke and render-check runners
test/output/    generated, gitignored
```

## Current state

M0 and M1 complete, M3 started.

- Electron shell boots, packaging config pending
- Effects engine ported and rendering inside Electron
- Home editor UI renders natively
- Home dashboard (launcher) plus Figma-style tabs in the title bar
- Heterogeneous tabs: Home, Darkroom, Studio, and Video coexist and switch,
  each an independent document. Surfaces stay mounted, so switching never reloads.
- Tabs are renamable (double-click), reorderable (drag), and the + is a create menu
- Studio ported and rendering natively (layers, pages, canvas, tools, export)
- Video editor ported and rendering natively (media, timeline, tracks, transport, export)
- Project persistence: darkroom documents save to disk (Cmd+S) with a thumbnail,
  show in the Home Library, and survive a restart (file-based store + IPC).
  Saved documents autosave on edit; the source asset is written once, not per save.
- Loads over an `app://` origin so absolute assets (logo, samples, fonts) resolve
- Native application menu + right-click context menu
- macOS Force Touch haptics on the effect sliders (native addon)
- Export routes through a native save dialog
- Offline render verified: 6 effects, deterministic repeat render, zero network requests
- Multi-core compute is live (C1): band-splittable effects (grayscale, invert, LUT,
  colorgrade, duotone, posterize, colorwash) run across all cores on export,
  byte-identical to single-pass, verified by `npm run parallel-check`. 1.6–3.7x on M3 Pro.

Next: M2, the parity harness that pixel-diffs desktop output against the web app; C2, route the batch path through the pool; then the rest of M3.
