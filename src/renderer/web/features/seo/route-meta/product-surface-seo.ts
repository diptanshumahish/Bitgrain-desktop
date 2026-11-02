import type { PageSeoMeta } from "../page-seo-meta";

export const EDITOR_SEO: PageSeoMeta = {
  path: "/editor",
  title: "Photo effects, develop photos and stack print effects | Bitgrain",
  description:
    "Bitgrain Photo effects develops RAW, HEIC, TIFF and DNG files in your browser, grades them with film LUTs, and stacks deterministic effects including the classic dither algorithms, halftone, ASCII and riso. Nothing is uploaded.",
  keywords:
    "browser photo editor, raw editor online, heic converter, film lut grading, dither tool, halftone tool, no ai photo editor",
};

export const STUDIO_SEO: PageSeoMeta = {
  path: "/studio",
  title: "Bitgrain Studio, a layered design canvas without AI | Bitgrain",
  description:
    "A multi-page, multi-layer design studio for album covers, posters, zines, brand boards and documents. Vector pen, shapes, blend modes, custom typography, design tokens and PNG, SVG and PDF export.",
  keywords:
    "browser design studio, poster maker, album cover maker, zine design tool, layered editor, design tokens, no ai design tool",
};

export const VIDEO_SEO: PageSeoMeta = {
  path: "/video",
  title: "Bitgrain video editor, deterministic MP4 in the browser | Bitgrain",
  description:
    "A browser-native multi-track video editor running on the same deterministic engine as the stills. Trim, split, speed, beat detection and beat-sync editing, motion tracking, transitions, per-clip EQ, and MP4 export up to 4K.",
  keywords:
    "browser video editor, music video editor, beat sync editing, deterministic video effects, 4k mp4 export, no ai video editor",
};

export const TEMPLATES_SEO: PageSeoMeta = {
  path: "/templates",
  title: "Bitgrain templates, covers, posters, zines and decks | Bitgrain",
  description:
    "Editable multi-layer templates for album covers, posters, zines, resumes, pitch decks, social posts and brand boards. Open one in the studio and change everything, from type to effect chain.",
  keywords:
    "design templates, album cover template, poster template, zine template, resume template, pitch deck template, editable templates",
};

export const SHOWCASE_SEO: PageSeoMeta = {
  path: "/showcase",
  title: "Showcase, made with Bitgrain templates and effects | Bitgrain",
  description:
    "Posters, covers, social posts and print pieces built from Bitgrain's own templates and effects. Open any of them in the studio and make it yours.",
  keywords:
    "design showcase, poster templates, album cover templates, riso design examples, dithered art examples",
};

export const RECIPES_SEO: PageSeoMeta = {
  path: "/recipes",
  title: "Bitgrain recipes, effect chains you can copy | Bitgrain",
  description:
    "Saved effect chains with the settings visible: newsprint halftone, Atkinson one-bit, two-ink riso, photocopy grunge, CRT glitch and more. Open one, see every value, change what you want.",
  keywords:
    "effect presets, dither settings, halftone settings, riso preset, photocopy effect, glitch preset, image effect recipes",
  noindex: true,
};

export const MCP_SEO: PageSeoMeta = {
  path: "/mcp",
  title: "Bitgrain MCP server, drive the studio from an AI agent | Bitgrain",
  description:
    "Bitgrain exposes an MCP server so an agent can open templates, build layered documents, apply deterministic effects and render pages. The product itself contains no generative AI, the agent is on your side of the wire.",
  keywords:
    "mcp server, model context protocol, design mcp, claude mcp design tool, agent design automation",
};
