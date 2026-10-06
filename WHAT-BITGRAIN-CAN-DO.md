# What Bitgrain Can Actually Do
updated[23rd July,2026]
> A code-grounded, exhaustive inventory of every real-world thing you can make and do with Bitgrain today.
>
> This document exists to fix a positioning problem. In the market, Bitgrain reads as "another dithering tool" or "an album-cover maker." That is a tiny slice of the truth. Bitgrain is three connected products sharing one deterministic effects engine: a **single-image editor**, a **full multi-page design studio**, and a **browser-native video editor**. Together they cover photo processing, print production, brand systems, social content, motion graphics, and short-form video, all client-side, all repeatable, all with no AI and no upload.
>
> Everything below is verified against the actual source code (`src/engine/`, `src/components/studio/`, `src/modules/video/`, `src/data/`), not old marketing copy.

---

## The one-line reframe

Bitgrain is not a dither toy. It is a **deterministic creative suite** that turns any photo into finished, printable, shippable work: posters, covers, zines, brand kits, product mockups, resumes, pitch decks, wallpapers, HDR stills, risograph print separations, animated loops, and full short-form videos. Same input, same settings, same output, every time. Nothing you make is uploaded to a model or used as training data.

Three surfaces, one engine:

| Surface | Route | What it is |
|---|---|---|
| **Editor** | `/editor` | Fast single-image effect tool. No signup. Drop a photo, stack effects, export. |
| **Studio** | `/studio` | Multi-page, multi-layer design canvas with vector pen, text, shapes, patterns, design tokens, and keyframe animation. |
| **Video** | `/video` | Timeline video editor. Applies the same effects per frame, exports frame-perfect MP4 in the browser. |

---

# Part 1. Things you can MAKE (output artifacts)

## Music and audio

- Album covers (3000x3000 square, streaming-ready)
- Single and EP cover art
- Mixtape and bootleg covers
- Spotify Canvas loops (1080x1920 animated, exported as MP4/WebM/GIF)
- Vinyl sleeve and gatefold artwork (A4 and larger print resolution)
- Cassette J-card art
- Music video visuals (full video editor, beat-synced cuts, per-frame effects)
- Lyric videos (animated text overlays, 16 text animations)
- Beat-synced reels for a track (detect beats, cut and pulse to them)
- Tour and gig posters
- Artist press photos with film-grade LUT color
- Waveform-driven visualiser-style clips
- Merch graphics (streetwear preset, halftone print looks)

## Print and production

- Risograph print separations (per-ink layer PNGs plus composite preview, exported as a ZIP, up to 4 inks from a 9-ink set)
- CMYK halftone separations (proper 4-channel angle separation)
- Newsprint and zine spreads (print-finish tone treatment: ink-on-paper mottle, misregistration, shadow grain)
- Screen-print-ready flats (posterized, high-contrast, limited palette)
- Punk flyers and street xerox / photocopy looks
- Mezzotint, etching, and woodcut style plates
- Pen-plotter files (ASCII exported as true crisp SVG `<text>` glyphs, vector paths for plotting)
- Duotone posters (8 built-in duotone ramps plus custom two-color maps)
- Cyanotype and blueprint prints
- A4 print layouts (2480x3508 at 300-equivalent working resolution)
- Business-card and ID-card layouts
- Certificates and award documents
- Grade cards and report layouts
- Multi-page PDF documents (Studio exports multi-page PDF)
- Stickers and label art (torn-edge, deckle, perforation paper treatments)

## Social and content

- Instagram / social square posts (1080x1080)
- Stories and Reels frames (1080x1920)
- Wide banners and headers (1920x1080, 1500x500)
- Twitter/X headers and cards
- YouTube thumbnails and channel art
- Phone lockscreen and desktop wallpapers (preview on a phone frame before export)
- Podcast cover art
- Newsletter and blog header images
- Quote cards and typographic posts
- Carousel graphics (multi-page Studio project, export each page)
- Meme and lo-fi edit content
- Profile pictures with consistent effect treatment

## Brand and design systems

- Brand boards and identity sheets (Color Studio with color wheel, harmony rows, brand board generator)
- Color palettes extracted from a source image
- Design-token kits (color variables, text-style variables, number tokens for radius/spacing/stroke/font-size) reusable across a whole project
- Logo lockups and wordmarks (vector pen tool with bezier editing)
- Font-pairing systems (Editorial, Modern, Display, Elegant, Tech built-in pairings, ~62 fonts plus custom uploads)
- Repeatable brand textures and patterns (generative checkerboard, grid, stripes, hex, mandala, kaleidoscope)
- Mockups: place a design onto a real product photo via perspective warp (WebGL2 smart-object engine with automatic surface detection)
- Style guides as multi-page documents
- Seamless tiling patterns and backgrounds

## Photography

- Camera-RAW development entirely in-browser (~30 RAW formats including medium-format: Hasselblad 3fr/fff, Phase One iiq, Mamiya mef, Leaf mos, plus Canon, Nikon, Sony, Fuji, Panasonic, Olympus, Pentax, Sigma, Kodak, Leica, Epson)
- HEIC/HEIF conversion and editing (iPhone photos)
- TIFF and DNG processing
- Film-look color grading (38 LUTs: Portra 400, Fuji 400H, Kodak Gold, Ektar 100, Tri-X, CineStill 800T, Velvia 50, Kodachrome 64, HP5 Push, Bleach Bypass, Cross Process, and cinematic looks like Blockbuster, Nolan Steel, Anamorphic, Cyberpunk)
- Black-and-white conversions (silver gelatin, HP5, Tri-X emulation)
- HDR still exports (genuine BT.2020 + PQ / SMPTE 2084, cICP PNG, configurable peak nits)
- Grain, haze, and bloom for analog atmosphere
- Chromatic aberration and lens-chroma looks
- Selective / brush-applied local edits (blur, brighten, darken, saturate, sepia, pixelate, grayscale, invert on a painted mask)
- Vignettes and film borders
- Batch processing of an entire shoot (one effect chain across up to 50 images, ZIP export)

## Motion and video

- Short-form vertical video (Reels, Shorts, TikTok) with reel templates
- Frame-perfect MP4 exports (WebCodecs, H.264 High profile, up to 4K on Pro)
- Animated stills: turn one photo into a seamless looping animation (14 animators, exported as MP4, WebM, GIF, animated SVG, or Lottie JSON)
- Lottie animations for web and app use
- Animated logos and title cards (vector stroke draw-on, keyframe animation in Studio)
- Lower thirds, tickers, and name/role overlays
- End cards and subscribe prompts
- Countdown intros
- Photo-essay and montage videos
- Beat-synced music edits (auto-cut, pulse text, blink effects on detected beats)
- Motion-tracking overlay graphics (tracking-node HUD style with coordinates, thumbnails, arrows)
- Ken-Burns pan/zoom photo videos
- Glitch, RGB-split, scanline, and wave overlay effects on video
- Cross-dissolve, dip-to-black/white, and soft-fade transitions
- Audio-mixed videos with per-clip 3-band EQ and fades

## Documents and utility layouts

- Resumes (clean professional templates)
- Portfolios (single and multi-page)
- Pitch decks and slide layouts
- Presentation mode with animated slides (present directly from Studio)
- Invitations (events, parties, weddings, house shows)
- Grand-opening and launch announcements
- Frames, borders, and photo mats
- Report and grade cards
- ID cards, badges, and passes

---

# Part 2. Things you can DO (capabilities and workflows)

## Effect and texture operations (29 core effects, stackable in any order)

Every effect below can be chained: the output of one feeds the next, so any combination is possible. All are deterministic and seeded.

**Textures:** ASCII art, Braille art, Dithering, Blocky quantization, Grunge ASCII, Dot Matrix, Halftone (mono/color/CMYK), Scanlines (CRT with curvature and RGB shift), Photocopy, Misprint, Paper Fold, Dust & Scratches, Voronoi cell mosaic.

**Filters:** Contour (topographic line tracing), Invert, Grayscale, Pixelate, LUT color grade (38 film/cinematic grades), Color Grade (temperature/tint/vibrance), Duotone, Vignette, Posterize (2-32 levels), Sharpen, Color Wash (screen/overlay/multiply).

**Creative:** Film Grain (shadow-weighted), Haze & Bloom (Orton diffusion), Crosshatch (hand-drawn pen hatching), Ink Wash, Manga screentone, Pop Grunge (comic-book dot art).

**Dithering, done properly:** 14 algorithms, not one. Floyd-Steinberg, Atkinson, three Sierra variants, Stucki, Burkes, JJN (error diffusion); Bayer 2x2/4x4/8x8 (ordered); blue-noise, random (stochastic), and threshold. Each supports palette quantization and a 0-1 blend factor.

## Color and palette operations

- Snap any image to 24 hardware/aesthetic palettes (Gameboy DMG, NES, C64, Apple II, CGA, PICO-8, ZX Spectrum, MSX, Risograph, Sepia, Cyanotype, Vaporwave, Neon, Noir, Amber CRT, Green CRT, and more)
- Apply 38 LUT film and cinematic grades
- Extract a palette from a source image
- Build custom duotone and gradient maps
- Reduce to a fixed color count on export (2-256 colors, median-cut quantization)
- Global brightness/contrast/saturation/hue pre-adjustment before any effect

## Preset and recipe operations

- Apply goal-oriented presets in one tap: Album Cover, Risograph, Zine Print, Streetwear, Retro Game, Vaporwave, Darkroom, Golden Hour
- Apply aesthetic presets: Newsprint, CMYK Pop, Cyanotype, Noir, Etching, Synthwave, Bleach Bypass, Blueprint, Posterize Max, plus ASCII/Braille/Contour packs
- Use ~27 built-in "mosh" databending recipes across Dither, ASCII, Braille, Halftone, Pop art, Contour
- Randomize with jitter to discover new looks
- Save your own presets (synced server-side)
- Publish a look as a Community Recipe (shareable, remixable, deterministic, with trending sort)
- Load any community recipe in one tap and get the exact same result

## Design and layout operations (Studio)

- Build multi-page, multi-layer documents
- Work with 7 layer types: image, text, shape, upload, group, vector, ink
- Draw with a true vector pen tool (bezier anchors, in/out handles, corner/smooth/asymmetric nodes, dashed strokes, line caps/joins)
- Fill vector shapes with images
- Draw freehand with a pressure-sensitive ink brush (Apple Pencil / stylus)
- Place 13 shape types (rect, circle, triangle, diamond, star, pentagon, hexagon, line, arrow, and four frame styles)
- Blend layers with 16 blend modes
- Apply per-layer Bitgrain effects (13 kinds per image/upload layer)
- Add paper treatments to uploads: torn/deckle/perforation edges, polaroid frame, tape strips
- Generate patterns as group fills (checkerboard, grid, stripes, hex, mandala, kaleidoscope)
- Use group auto-layout (flex-row, flex-col, grid, with gap/padding/alignment)
- Align, distribute, snap, and multi-select
- Bind layers to design-kit tokens so a color or type change updates everywhere
- Rich text with per-range styling, gradient text, and text effects (shadow, outline, lift, glitch)
- Full undo/redo history
- Preview designs as a social feed, story, or phone lockscreen before export
- Resize a whole design between formats deterministically (no AI reflow)

## Motion operations (Studio and Video)

- Keyframe any numeric property in Studio (position, size, rotation, opacity, radius, font size, stroke width, letter spacing, line height, gap, padding, vector draw progress)
- Animate colors, vector paths, and effect parameters
- Choose easings: linear, ease-in, ease-out, ease-in-out, spring, hold
- Page-level animation with loop and FPS control
- Export animation as MP4, WebM, GIF, animated SVG, or Lottie

## Video editing operations

- Multi-track timeline: video, audio, text, effect, image, and tracking tracks
- Trim, split at playhead, ripple delete, duplicate, copy/cut/paste, speed change (0.25x-4x)
- Fade in/out on any clip (up to 5s)
- Link and detach audio from video clips
- Per-clip 3-band EQ (low/mid/high), volume, mute
- Waveform display and beat detection
- Beat-sync auto-editing (slice at beats, pulse text, blink effects)
- 16 text animations, 10 text templates, 6 overlay templates, 4 project templates, 6 reel templates
- Motion-tracking overlay generator
- Ken-Burns pan/zoom on clips
- Real-time overlay effects (glitch, RGB-split, scanlines, pixelate, wave)
- Transitions (crossfade, dip-to-black, dip-to-white, soft fade)
- Markers, range in/out, snap, autosave, full undo/redo
- Export frame-perfect MP4 (WebCodecs) or realtime WebM (MediaRecorder), 720p/1080p/4K, 24/25/30/60 fps, four bitrate presets

## Input and format operations

- Load JPEG, PNG, WebP, GIF, BMP, AVIF, SVG, ICO
- Load HEIC/HEIF (iPhone) with automatic conversion
- Load TIFF and DNG
- Load ~30 camera RAW formats, developed in-browser with camera white balance, never uploaded
- Everything normalized to a safe working resolution (up to 8192px long edge on ingest)

## Export and output operations

- Export PNG (truecolor or 2-256 color quantized)
- Export WebP (including lossless)
- Export JPEG
- Export HDR PNG (BT.2020, PQ transfer, cICP, up to 800+ nits)
- Export SVG vector (run-length color paths, ASCII as real text glyphs, plotter-ready)
- Export to exact platform dimensions (center-cropped cover-fit)
- Export multi-page PDF (Studio)
- Export risograph ZIP of print-ready ink-separation layers
- Batch export up to 50 images through one effect chain as a ZIP (PNG or SVG)
- Export video as MP4 or WebM up to 4K
- Export animation as MP4/WebM/GIF/SVG/Lottie
- Save and reopen native `.btg` project files with embedded custom fonts
- Apply an optional print-finish pass on export for authentic ink-on-paper output

## Privacy and determinism operations (the differentiators)

- Process everything client-side, in the browser, with no upload of your image for processing
- Get identical output from identical settings, every time (frame-perfect, seeded, repeatable)
- Keep your work out of any training set, always
- Work anonymously in the Editor with no signup
- Optionally sync projects to the cloud (Pro, opt-in, for storage only)

---

# Part 3. Who it is for (audiences the tool already serves)

- **Musicians and labels:** covers, canvases, tour posters, music videos, lyric videos, beat-synced reels
- **Designers and art directors:** posters, brand kits, design tokens, mockups, multi-page layouts, pitch decks
- **Photographers:** in-browser RAW development, film grading, HDR stills, batch processing, no cloud upload
- **Print makers and risograph studios:** ink separations, CMYK halftone, newsprint finish, screen-print flats, plotter SVG
- **Social and content creators:** feed posts, stories, wallpapers, thumbnails, short-form video, animated loops
- **Zinesters and illustrators:** ASCII, halftone, crosshatch, ink wash, manga screentone, torn-paper collage
- **Video and motion creators:** reels, montages, title cards, lower thirds, motion-tracking overlays, Lottie
- **Small businesses and solo professionals:** resumes, portfolios, certificates, ID cards, invitations, grand-opening posters
- **Retro / pixel-art and game communities:** hardware palettes, dithering, dot-matrix, blocky, scanline CRT looks
- **Privacy-conscious and anti-AI creators:** everyone who wants a tool, not a model, and who refuses to feed a generator

---

# Part 4. Capability inventory (the receipts)

| Category | Count | Highlights |
|---|---:|---|
| Core stackable effects | 29 | ASCII, Braille, Dither, Halftone, Contour, Manga, Ink Wash, Crosshatch, Photocopy, Misprint, Fold, Dust, Scanlines, Pop Grunge, more |
| Dither algorithms | 14 | Floyd-Steinberg, Atkinson, Sierra x3, Stucki, Burkes, JJN, Bayer x3, blue-noise, random, threshold |
| LUT film/cinematic grades | 38 | Portra, Fuji 400H, Kodak Gold, Tri-X, CineStill 800T, Velvia, Kodachrome, plus cinematic and duotone/map ramps |
| Color palettes | 24 | Gameboy, NES, C64, PICO-8, ZX Spectrum, Risograph, Vaporwave, CRT sets, and more |
| Risograph inks | 9 (up to 4 per print) | Black, Fluoro Pink, Blue, Yellow, Red, Green, Purple, Teal, Orange |
| Still animators | 14 | Posterize cycle, threshold sweep, solarize, glitch, echo, ripple, RGB split, lens chroma, more |
| Selective brush effects | 8 | Blur, grayscale, invert, brighten, darken, saturate, sepia, pixelate |
| Studio layer types | 7 | image, text, shape, upload, group, vector, ink |
| Studio shape types | 13 | rect, circle, triangle, diamond, star, pentagon, hexagon, line, arrow, 4 frames |
| Blend modes | 16 | full Photoshop-style set |
| Fonts (built-in) | ~62 | plus custom font upload, plus curated pairings |
| Generative patterns | 6 | checkerboard, grid, stripes, hex, mandala, kaleidoscope |
| Template categories | 13 | poster, social, album, wallpaper, invitation, certificate, resume, portfolio, pitch-deck, frame, id-card, grade-card, grand-opening |
| Video track types | 6 | video, audio, text, effect, image, tracking |
| Video text animations | 16 | fade, typewriter, slides, bounce, pop, gravity, elastic, swing, whoosh, more |
| Video templates | 26 | 10 text, 6 overlay, 4 project, 6 reel |
| Input formats | 40+ | standard raster/vector, HEIC, TIFF, DNG, ~30 camera RAW |
| Export formats | 10+ | PNG, HDR-PNG, WebP, JPEG, SVG, PDF, MP4, WebM, GIF, Lottie, riso ZIP, .btg |

---

# Summary: what Bitgrain can be used for

Bitgrain is a deterministic, privacy-first creative suite, not a single-effect novelty. In one browser tab, with no AI and no upload, a person can:

1. **Develop and grade photographs**, including ~30 camera-RAW formats and HEIC, entirely client-side, and export genuine HDR stills.
2. **Turn any photo into print-texture artwork** using 29 stackable effects, 14 dither algorithms, 38 film grades, and 24 palettes.
3. **Produce real print output**: risograph ink separations, CMYK halftone, newsprint finish, screen-print flats, and plotter-ready SVG.
4. **Design complete multi-page documents** in a full layout studio with vector pen, text, shapes, patterns, design tokens, blend modes, and 13 template categories from album covers to resumes to pitch decks.
5. **Build brand systems**: palettes, brand boards, design-token kits, mockups, and reusable patterns.
6. **Create motion**: animate a still into a seamless loop (MP4/WebM/GIF/SVG/Lottie), keyframe layers in Studio, or edit a full multi-track video with beat-sync, motion-tracking overlays, transitions, audio EQ, and frame-perfect 4K MP4 export.
7. **Batch-process an entire shoot** through one effect chain and export a ZIP.
8. **Share and remix looks** as deterministic community recipes.
9. **Keep everything private and repeatable**: same input and settings always give the same output, and nothing is uploaded to a model or used as training data.

The market sees a dithering tool. The code says otherwise: Bitgrain is a photo lab, a print shop, a design studio, a brand toolkit, a motion studio, and a video editor, unified by one deterministic engine and a refusal to be a generator. That is the story worth telling.
