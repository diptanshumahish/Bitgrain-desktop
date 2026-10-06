export const hexToHsv = (hex: string): [number, number, number] => {
  const safe = hex.replace('#', '').slice(0, 6).padEnd(6, '0')
  const r = parseInt(safe.slice(0, 2), 16) / 255
  const g = parseInt(safe.slice(2, 4), 16) / 255
  const b = parseInt(safe.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  let h = 0
  if (d > 0) {
    if (max === r) h = ((g - b) / d + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }

  return [h, max > 0 ? d / max : 0, max]
}

export const hsvToHex = (h: number, s: number, v: number): string => {
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  const channels = [
    [v, q, p, p, t, v][i],
    [t, v, v, q, p, p][i],
    [p, p, t, v, v, q][i],
  ].map(c => Math.round(c * 255).toString(16).padStart(2, '0'))

  return `#${channels.join('')}`
}

export const isValidHex = (hex: string) => /^#[0-9a-fA-F]{6}$/.test(hex)
