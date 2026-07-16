// Some brand marks (e.g. Next.js, Rust) are pure black/near-black by design,
// meant for light backgrounds. Swap those for parchment so they stay visible
// on our dark tiles.
export function iconFill(hex: string) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.15 ? "#cdbe91" : `#${hex}`;
}
