export type MaterialPreset = 'clay' | 'stone' | 'bronze' | 'ice' | 'obsidian';

export type ToolType = 'inflate' | 'deflate' | 'smooth' | 'flatten' | 'grab';

export interface MaterialConfig {
  color: string;
  roughness: number;
  metalness: number;
  transparent?: boolean;
  opacity?: number;
  label: string;
}

export const MATERIAL_CONFIGS: Record<MaterialPreset, MaterialConfig> = {
  clay:     { color: '#c8956c', roughness: 0.9, metalness: 0.0, label: 'Clay' },
  stone:    { color: '#8a8a8a', roughness: 1.0, metalness: 0.0, label: 'Stone' },
  bronze:   { color: '#cd7f32', roughness: 0.4, metalness: 0.8, label: 'Bronze' },
  ice:      { color: '#d0e8ff', roughness: 0.1, metalness: 0.0, transparent: true, opacity: 0.75, label: 'Ice' },
  obsidian: { color: '#1a1a1a', roughness: 0.1, metalness: 0.4, label: 'Obsidian' },
};

export const VALID_MATERIALS = Object.keys(MATERIAL_CONFIGS) as MaterialPreset[];

export interface SculptureRow {
  id: number;
  nickname: string;
  geometry_data: { positions: number[] };
  material: MaterialPreset;
  preview_image: string | null;
  created_at: string;
}

export interface SculptureListItem {
  id: number;
  nickname: string;
  material: MaterialPreset;
  preview_image: string | null;
  created_at: string;
}
