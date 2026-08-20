export const PALETTE_STORAGE_KEY = 'zarinpulse-palette-v3';

export const PALETTES = ['sand', 'pearl', 'aurum', 'ice'] as const;

export type PaletteId = (typeof PALETTES)[number];

export const DEFAULT_PALETTE: PaletteId = 'sand';

/** Same as the product default; /preview still locks it so localStorage cannot override. */
export const PREVIEW_PALETTE = 'sand';

export function isPaletteId(value: string | null | undefined): value is PaletteId {
  return value === 'sand' || value === 'pearl' || value === 'aurum' || value === 'ice';
}

export function coercePalette(value: string | null | undefined): PaletteId {
  if (isPaletteId(value)) return value;
  if (value === 'emerald') return 'pearl';
  if (value === 'steel') return 'ice';
  if (value === 'wealth') return 'sand';
  return DEFAULT_PALETTE;
}
