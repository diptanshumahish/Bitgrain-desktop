const CURSOR_SIZE = 24;
const HOTSPOT = 2;

const NIB =
  "<path d='M2 2 L12.9 6.6 L15.8 9.4 L9.4 15.8 L6.6 12.9 Z' fill='white' stroke='black' stroke-width='1.3' stroke-linejoin='round'/>" +
  "<path d='M2 2 L7.4 7.4' stroke='black' stroke-width='1.1' stroke-linecap='round'/>" +
  "<circle cx='8.4' cy='8.4' r='1.3' fill='black'/>" +
  "<path d='M15.4 10.6 L19.9 15.1 L15.1 19.9 L10.6 15.4 Z' fill='black' stroke='white' stroke-width='1' stroke-linejoin='round'/>";

const ADD_BADGE =
  "<circle cx='19' cy='5' r='4.2' fill='white' stroke='black' stroke-width='1'/>" +
  "<path d='M19 3 V7 M17 5 H21' stroke='black' stroke-width='1.2' stroke-linecap='round'/>";

const CLOSE_BADGE = "<circle cx='19' cy='5' r='3.4' fill='white' stroke='%233b82f6' stroke-width='1.8'/>";

const NODE_BADGE = "<rect x='15.5' y='1.5' width='7' height='7' rx='1' fill='%233b82f6' stroke='white' stroke-width='1'/>";

const buildCursor = (content: string, fallback: string): string => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${CURSOR_SIZE}' height='${CURSOR_SIZE}' viewBox='0 0 24 24'>${content}</svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E")}") ${HOTSPOT} ${HOTSPOT}, ${fallback}`;
};

export const PEN_CURSOR = buildCursor(NIB, "crosshair");

export const PEN_ADD_CURSOR = buildCursor(NIB + ADD_BADGE, "crosshair");

export const PEN_CLOSE_CURSOR = buildCursor(NIB + CLOSE_BADGE, "crosshair");

export const DRAG_NODE_CURSOR = buildCursor(NIB + NODE_BADGE, "grab");
