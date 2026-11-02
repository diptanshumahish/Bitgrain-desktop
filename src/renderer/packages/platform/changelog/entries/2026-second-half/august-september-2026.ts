import type { ChangeLogEntry } from "../types";

export const AUGUST_SEPTEMBER_2026_ENTRIES: ChangeLogEntry[] = [
  {
    version: '0.129.0',
    date: '2026-09-04',
    commit: '81bf75f',
    title: 'Faster pages, plus about and contact',
    description: 'Bitgrain opens quicker now. Dialogs and the help chat load only when you need them, the landing images are much lighter, and our public pages arrive with their content already in place instead of filling in after a blank moment. There are also proper about and contact pages, and each style page has a short guide to the look it makes.',
    items: [
      'Dialogs and the help chat load on demand, so the first screen shows up sooner',
      'Public pages arrive with their content already rendered',
      'New about and contact pages',
      'Style pages for halftone, dither, ascii, risograph, and more now explain the look',
    ],
    type: 'perf',
  },
  {
    version: '0.128.0',
    date: '2026-08-11',
    commit: '1ab2f07',
    title: 'Use Bitgrain from your AI assistant',
    description: 'You can now connect Bitgrain to an AI assistant like Claude or ChatGPT and ask it to make things for you. It can run a photo through the darkroom with any preset or effect, or build a layered design in Studio, starting from a template, editing the layers, and rendering the pages. You sign in with your own Bitgrain account, and you can see and disconnect every assistant from your account page.',
    items: [
      'Darkroom tools for halftone, dither, ascii, riso, print texture, and color grades',
      'Studio tools to open templates, edit layers and pages, and render them',
      'Design briefs for posters, album covers, social posts, print pieces, and photo treatments',
      'Sign in with your Bitgrain account, or with a short code if your assistant asks for one',
      'Connected assistants are listed on your account page, each with a disconnect button',
    ],
    type: 'feature',
  },
];
