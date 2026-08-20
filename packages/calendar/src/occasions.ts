export interface Occasion {
  id: string;
  titleFa: string;
  kind: string;
  startIso: string;
  endIso: string;
  approximate: boolean;
  inDataWindow: boolean;
  noteFa: string;
}

export function occasionCovers(occ: Occasion, iso: string): boolean {
  return iso >= occ.startIso && iso <= occ.endIso;
}

export function occasionLabel(occ: Occasion): 'in_window' | 'out_of_window' {
  return occ.inDataWindow ? 'in_window' : 'out_of_window';
}

export function matchOccasions(occasions: readonly Occasion[], iso: string): Occasion[] {
  return occasions.filter((occ) => occasionCovers(occ, iso));
}
