export const DEFAULT_ACCENT = "#ff5c38";

export const ACCENT_PRESETS = [
  { label: "Coral", value: "#ff5c38" },
  { label: "Blue", value: "#2F6BFF" },
  { label: "Teal", value: "#0fb5a6" },
  { label: "Navy", value: "#1e3a5f" },
  { label: "Plum", value: "#6b4c9a" },
  { label: "Forest", value: "#2d6a4f" },
  { label: "Burgundy", value: "#8b2942" },
  { label: "Slate", value: "#475569" },
] as const;

export type AccentPalette = {
  accent: string;
  accentLight: string;
  accentMuted: string;
  accentTint: string;
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseHex(hex: string): [number, number, number] | null {
  const match = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function mixHex(a: string, b: string, amount: number): string {
  const c1 = parseHex(a);
  const c2 = parseHex(b);
  if (!c1 || !c2) return a;
  const t = clamp(amount, 0, 1);
  return toHex(
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t
  );
}

export function normalizeAccent(color?: string): string {
  if (!color) return DEFAULT_ACCENT;
  const parsed = parseHex(color);
  if (!parsed) return DEFAULT_ACCENT;
  return toHex(parsed[0], parsed[1], parsed[2]);
}

export function resolveAccentPalette(color?: string): AccentPalette {
  const accent = normalizeAccent(color);
  return {
    accent,
    accentLight: mixHex(accent, "#ffffff", 0.28),
    accentMuted: mixHex(accent, "#ffffff", 0.42),
    accentTint: mixHex(accent, "#ffffff", 0.9),
  };
}
