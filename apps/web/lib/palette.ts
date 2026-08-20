export const PALETTE_STORAGE_KEY = 'zarinpulse-palette-v4';

/** Light = sand atelier, dark = noir atelier. */
export const PALETTES = ['sand', 'noir'] as const;

export type PaletteId = (typeof PALETTES)[number];

export const DEFAULT_PALETTE: PaletteId = 'sand';
export const LIGHT_PALETTE: PaletteId = 'sand';
export const DARK_PALETTE: PaletteId = 'noir';

/** Preview route stays locked to light. */
export const PREVIEW_PALETTE = LIGHT_PALETTE;

export function isPaletteId(value: string | null | undefined): value is PaletteId {
  return value === 'sand' || value === 'noir';
}

export function coercePalette(value: string | null | undefined): PaletteId {
  if (value === 'noir' || value === 'dark') return DARK_PALETTE;
  return LIGHT_PALETTE;
}

export function togglePalette(current: PaletteId): PaletteId {
  return current === DARK_PALETTE ? LIGHT_PALETTE : DARK_PALETTE;
}
