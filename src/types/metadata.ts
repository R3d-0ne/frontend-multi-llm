export type MetadataCategory = 
  | 'entité'
  | 'date'
  | 'lieu'
  | 'organisation'
  | 'personne'
  | 'tag'
  | 'type'
  | 'autre';

export interface MetadataTag {
  text: string;
  category: MetadataCategory;
  score?: number;  // Score de confiance optionnel
}

export const METADATA_COLORS: Record<MetadataCategory, string> = {
  'entité': '#2196F3',      // Bleu
  'date': '#4CAF50',        // Vert
  'lieu': '#9C27B0',        // Violet
  'organisation': '#FF9800', // Orange
  'personne': '#E91E63',    // Rose
  'tag': '#607D8B',         // Bleu-gris
  'type': '#795548',        // Marron
  'autre': '#9E9E9E'        // Gris
}; 