type RGB = [number, number, number];

const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
const luma = (r: number, g: number, b: number) => r * 0.2126 + g * 0.7152 + b * 0.0722;

const sCurve = (v: number, s = 1.5): number => {
  const n = Math.max(0, Math.min(1, v / 255));
  const o = n < 0.5 ? 0.5 * Math.pow(2 * n, s) : 1 - 0.5 * Math.pow(2 * (1 - n), s);
  return o * 255;
};

const lerpColor = (t: number, stops: number[][]): RGB => {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  const f = scaled - i;
  return [
    cl(stops[i][0] + (stops[i + 1][0] - stops[i][0]) * f),
    cl(stops[i][1] + (stops[i + 1][1] - stops[i][1]) * f),
    cl(stops[i][2] + (stops[i + 1][2] - stops[i][2]) * f),
  ];
};

export interface LUTDef {
  id: string;
  name: string;
  tag: string;
  apply: (r: number, g: number, b: number) => RGB;
}

export const LUTS: LUTDef[] = [
  {
    id: 'portra-400', name: 'Portra 400', tag: '🎞️✨',
    apply(r, g, b) {
      const nr = r * 1.04 + 6, ng = g * 0.99 + 2, nb = b * 0.96;
      return [cl(sCurve(nr, 1.15)), cl(sCurve(ng, 1.15)), cl(sCurve(nb, 1.15))];
    },
  },
  {
    id: 'fuji-400h', name: 'Fuji 400H', tag: '🍃❄️',
    apply(r, g, b) {
      const sh = Math.pow(1 - luma(r, g, b) / 255, 1.5);
      return [cl(sCurve(r * 0.96 - 4 * sh, 1.1)), cl(sCurve(g * 1.03 + 6 * sh, 1.1)), cl(sCurve(b * 1.06 + 12 * sh, 1.1))];
    },
  },
  {
    id: 'kodak-gold', name: 'Kodak Gold', tag: '☀️📀',
    apply(r, g, b) {
      return [cl(sCurve(r * 1.08 + 8, 1.35)), cl(sCurve(g * 1.01 + 4, 1.35)), cl(sCurve(b * 0.88 - 4, 1.35))];
    },
  },
  {
    id: 'ektar-100', name: 'Ektar 100', tag: '🌈📸',
    apply(r, g, b) {
      const l = luma(r, g, b);
      return [cl(sCurve(l + (r - l) * 1.4 + 8, 1.25)), cl(sCurve(l + (g - l) * 1.2, 1.25)), cl(sCurve(l + (b - l) * 1.5 + 4, 1.25))];
    },
  },
  {
    id: 'tri-x', name: 'Tri-X 400', tag: '🏁🎞️',
    apply(r, g, b) {
      const out = sCurve(luma(r, g, b) * 1.08 - 8, 1.9);
      return [cl(out), cl(out), cl(out)];
    },
  },
  {
    id: 'teal-orange', name: 'Blockbuster', tag: '🎬🍿',
    apply(r, g, b) {
      const l = luma(r, g, b) / 255, sh = Math.pow(1 - l, 1.5), hl = Math.pow(l, 1.5);
      return [cl(sCurve(r * 1.1 + 25 * hl - 15 * sh, 1.4)), cl(sCurve(g * 0.95 + 5 * hl + 5 * sh, 1.4)), cl(sCurve(b * 0.9 + 30 * sh - 10 * hl, 1.4))];
    },
  },
  {
    id: 'bleach-bypass', name: 'Bleach Bypass', tag: '▓▒░',
    apply(r, g, b) {
      const l = luma(r, g, b);
      return [cl(sCurve(r + (l - r) * 0.55, 2.1)), cl(sCurve(g + (l - g) * 0.55, 2.1)), cl(sCurve(b + (l - b) * 0.55, 2.1))];
    },
  },
  {
    id: 'xpro', name: 'Cross Process', tag: '╳╱╳',
    apply(r, g, b) {
      const l = luma(r, g, b) / 255, sh = Math.pow(1 - l, 2.0), hl = Math.pow(l, 2.0);
      return [cl(sCurve(r * 0.88 - 25 * sh + 30 * hl, 1.4)), cl(sCurve(g * 1.1 + 15 * sh - 5 * hl, 1.4)), cl(sCurve(b * 1.15 + 20 * sh - 40 * hl, 1.4))];
    },
  },
  {
    id: 'cinestill-800t', name: 'CineStill 800T', tag: '◌◉◌',
    apply(r, g, b) {
      const halation = Math.pow(luma(r, g, b) / 255, 3.5) * 55;
      return [cl(sCurve(r * 0.90 - 6 + halation, 1.4)), cl(sCurve(g * 0.94 + 4, 1.4)), cl(sCurve(b * 1.16 + 18, 1.4))];
    },
  },
  {
    id: 'nolan-steel', name: 'Nolan Steel', tag: '◧◨◧',
    apply(r, g, b) {
      const l = luma(r, g, b), n = l / 255, halo = Math.pow(n, 3.0) * 18;
      return [cl(sCurve((r + (l - r) * 0.68) * 0.86 - 4 + halo, 2.0)), cl(sCurve((g + (l - g) * 0.68) * 0.90 + 2, 2.0)), cl(sCurve((b + (l - b) * 0.68) * 1.10 + 14, 2.0))];
    },
  },
  {
    id: 'duotone-navy', name: 'Duotone', tag: '◼◑◻',
    apply(_r, _g, _b) {
      const t = Math.pow(luma(_r, _g, _b) / 255, 0.85);
      return [cl(14 + 231 * t), cl(26 + 206 * t), cl(80 + 120 * t)];
    },
  },
  {
    id: 'thermal', name: 'Thermal', tag: '▒░▓',
    apply(r, g, b) {
      return lerpColor(luma(r, g, b) / 255, [[0,0,0],[20,0,120],[0,80,200],[0,200,210],[0,210,60],[230,230,0],[255,120,0],[255,20,0],[255,255,255]]);
    },
  },
  {
    id: 'infrared', name: 'Infrared', tag: '░◈░',
    apply(r, g, b) {
      return [cl(sCurve(r * 0.40 + g * 0.65 - b * 0.05 + 5, 2.1)), cl(sCurve(r * 0.35 + g * 0.70 - b * 0.05, 2.1)), cl(sCurve(r * 0.15 + g * 0.10 + b * 0.25 - 5, 2.1))];
    },
  },
  {
    id: 'silver-gelatin', name: 'Silver Gelatin', tag: '◫◧◨',
    apply(r, g, b) {
      const l = luma(r, g, b), sw = Math.pow(1 - l / 255, 2.2), out = sCurve(l * 1.06 - 4, 1.8);
      return [cl(out + 10 * sw), cl(out + 5 * sw), cl(out - 8 * sw)];
    },
  },
  {
    id: 'moonfire', name: 'Moonfire', tag: '◑◐◑',
    apply(r, g, b) {
      const l = luma(r, g, b) / 255, sh = Math.pow(1 - l, 2.8), hl = Math.pow(l, 2.8);
      return [cl(sCurve(r + 48 * hl - 22 * sh, 1.8)), cl(sCurve(g + 2 * hl - 12 * sh, 1.8)), cl(sCurve(b - 22 * hl + 65 * sh, 1.8))];
    },
  },
  {
    id: 'velvia-50', name: 'Velvia 50', tag: '🌿🔴',
    apply(r, g, b) {
      const l = luma(r, g, b), hl = Math.pow(l / 255, 2.0);
      return [cl(sCurve(l + (r - l) * 1.35 + 5 * hl, 1.6)), cl(sCurve(l + (g - l) * 1.45, 1.6)), cl(sCurve(l + (b - l) * 1.35 - 4 * hl, 1.6))];
    },
  },
  {
    id: 'golden-hour', name: 'Golden Hour', tag: '🌅🔆',
    apply(r, g, b) {
      const l = luma(r, g, b) / 255, sh = Math.pow(1 - l, 2.5), hl = Math.pow(l, 2.0);
      return [cl(sCurve(r + 32 * hl + 8 * sh, 1.35)), cl(sCurve(g + 16 * hl - 10 * sh, 1.35)), cl(sCurve(b - 18 * hl + 24 * sh, 1.35))];
    },
  },
  {
    id: 'matte-fade', name: 'Matte Fade', tag: '⬜⬛⬜',
    apply(r, g, b) {
      const nr = r * 0.85 + 25, ng = g * 0.85 + 25, nb = b * 0.85 + 28;
      const l = luma(nr, ng, nb);
      return [cl(l + (nr - l) * 0.87), cl(l + (ng - l) * 0.87), cl(l + (nb - l) * 0.87)];
    },
  },
  {
    id: 'kodachrome-64', name: 'Kodachrome 64', tag: '🌺🔶',
    apply(r, g, b) {
      const sh = Math.pow(1 - luma(r, g, b) / 255, 1.8);
      return [cl(sCurve(r * 1.06 + 6, 1.3)), cl(sCurve(g * 0.97 + 3, 1.3)), cl(sCurve(b * 0.82 + 8 * sh, 1.3))];
    },
  },
  {
    id: 'dusk', name: 'Dusk', tag: '🌆🌙',
    apply(r, g, b) {
      const l = luma(r, g, b) / 255, sh = Math.pow(1 - l, 2.0), hl = Math.pow(l, 1.5);
      return [cl(sCurve(r * 0.92 - 5 * sh + 10 * hl, 1.4)), cl(sCurve(g * 0.94 - 5 * sh + 4 * hl, 1.35)), cl(sCurve(b * 1.08 + 28 * sh - 4 * hl, 1.35))];
    },
  },
  {
    id: 'amber', name: 'Amber', tag: '🟤🔸',
    apply(r, g, b) {
      const l = luma(r, g, b);
      return [cl(sCurve(l + (r - l) * 0.72 + 18, 1.45)), cl(sCurve(l + (g - l) * 0.62 + 8, 1.45)), cl(sCurve(l + (b - l) * 0.48 - 6, 1.5))];
    },
  },
  {
    id: 'anamorphic', name: 'Anamorphic', tag: '◈◉◈',
    apply(r, g, b) {
      const l = luma(r, g, b) / 255, sh = Math.pow(1 - l, 1.8), hl = Math.pow(l, 2.5);
      return [cl(sCurve(r + 8 * hl - 10 * sh, 1.45)), cl(sCurve(g - 4 * sh + 2 * hl, 1.35)), cl(sCurve(b + 32 * sh + 16 * hl, 1.35))];
    },
  },
  {
    id: 'hp5-push', name: 'HP5 Push', tag: '◼▪◼',
    apply(r, g, b) {
      const l = luma(r, g, b), n = l / 255, out = sCurve(l * 1.06 - 14, 2.4), tone = Math.pow(1 - n, 3.0) * 6;
      return [cl(out - tone * 0.4), cl(out + tone), cl(out - tone * 0.6)];
    },
  },
  {
    id: 'vintage-print', name: 'Vintage Print', tag: '🟨📷',
    apply(r, g, b) {
      const l = luma(r, g, b) / 255, sh = Math.pow(1 - l, 2.0), hl = Math.pow(l, 1.5);
      return [cl(sCurve(r * 0.80 + 30 + 10 * hl, 1.1)), cl(sCurve(g * 0.82 + 24 + 8 * sh, 1.1)), cl(sCurve(b * 0.72 + 20 - 4 * hl, 1.1))];
    },
  },
  {
    id: 'cyberpunk', name: 'Cyberpunk', tag: '⬡⬢⬡',
    apply(r, g, b) {
      const l = luma(r, g, b) / 255, sh = Math.pow(1 - l, 2.0), hl = Math.pow(l, 2.0);
      return [cl(sCurve(r * 1.08 - 12 * hl + 25 * sh, 1.55)), cl(sCurve(g * 0.90 + 18 * hl - 12 * sh, 1.5)), cl(sCurve(b * 1.12 + 16 * hl + 22 * sh, 1.5))];
    },
  },
  {
    id: 'duo-riso-pink', name: 'Duo Riso Pink', tag: '◐◑',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[26, 22, 64], [255, 95, 162]]); },
  },
  {
    id: 'duo-noir-gold', name: 'Duo Noir Gold', tag: '◼◆',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[14, 14, 18], [240, 200, 120]]); },
  },
  {
    id: 'duo-indigo-mint', name: 'Duo Indigo Mint', tag: '◣◢',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[20, 18, 55], [120, 255, 214]]); },
  },
  {
    id: 'duo-oxblood', name: 'Duo Oxblood', tag: '◗◖',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[38, 10, 20], [245, 236, 214]]); },
  },
  {
    id: 'duo-electric', name: 'Duo Electric', tag: '◇◆',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[6, 10, 38], [92, 200, 255]]); },
  },
  {
    id: 'duo-plum-peach', name: 'Duo Plum Peach', tag: '◐◓',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[42, 16, 46], [255, 202, 162]]); },
  },
  {
    id: 'duo-slate-ice', name: 'Duo Slate Ice', tag: '◫◪',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[20, 26, 36], [222, 236, 246]]); },
  },
  {
    id: 'duo-forest-lime', name: 'Duo Forest Lime', tag: '◢◣',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[10, 28, 18], [198, 255, 120]]); },
  },
  {
    id: 'map-sunset', name: 'Map Sunset', tag: '◔◑◕',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[30, 10, 50], [222, 60, 92], [255, 212, 120]]); },
  },
  {
    id: 'map-vaporwave', name: 'Map Vaporwave', tag: '◳◲◱',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[40, 10, 80], [255, 84, 182], [122, 240, 255]]); },
  },
  {
    id: 'map-ember', name: 'Map Ember', tag: '◔◓◒',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[10, 5, 5], [182, 42, 20], [255, 202, 82]]); },
  },
  {
    id: 'map-toxic', name: 'Map Toxic', tag: '◬◭◮',
    apply(r, g, b) { return lerpColor(luma(r, g, b) / 255, [[8, 20, 10], [58, 182, 92], [230, 255, 120]]); },
  },
];

export const getLUT = (id: string): LUTDef | undefined =>
  LUTS.find((l) => l.id === id);
