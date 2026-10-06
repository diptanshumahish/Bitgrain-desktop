import type { ChangeLogEntry } from "./types";

export const MARCH_2026_ENTRIES: ChangeLogEntry[] = [
  {
    version: '0.1.0',
    date: '2026-03-30',
    commit: '9ada9f0',
    title: 'Hello, world',
    description: 'The very first build. A browser-based image processing playground with dithering, texture plugins, and a starter set of effects you could chain together on any image.',
    items: [
      'Classic dithering algorithms ready to apply on any uploaded image',
      'A simple plugin system that lets new textures and effects slot in cleanly',
      'Real-time preview so you can see each tweak the moment you make it',
    ],
    type: 'announcement',
  },
];
