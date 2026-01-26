/**
 * Heavy Material Icon Mapping
 * 
 * Canonical Lucide icon mapping for heavy materials.
 * Replaces all emoji fallbacks (🧱, 🛣️, etc.) with consistent Lucide icons.
 * 
 * RULES:
 * - Every material MUST have a Lucide icon, no emojis
 * - Use this mapping in HeavyMaterialSelector and any material display components
 * - Falls back to HardHat icon if material code not found
 */

import {
  Hammer,
  Mountain,
  Layers,
  CircleDot,
  Square,
  Leaf,
  Package,
  Box,
  HardHat,
  type LucideIcon,
} from 'lucide-react';

/**
 * Canonical heavy material icon mapping
 * Maps material_code from heavy_material_profiles to Lucide icons
 */
export const HEAVY_MATERIAL_ICONS: Record<string, LucideIcon> = {
  // Clean recyclable materials
  CONCRETE_CLEAN: Hammer,
  ASPHALT_CLEAN: Layers,
  SOIL_CLEAN: Mountain,
  ROCK_CLEAN: Mountain,
  GRAVEL_CLEAN: CircleDot,
  GRANITE_CLEAN: Square,
  BRICK_TILE_CLEAN: Layers,
  
  // Organic materials
  GRASS_YARD_WASTE: Leaf,
  GRASS_CLEAN: Leaf,
  WOOD_CLEAN: Package,
  WOOD_CHIPS_CLEAN: Package,
  
  // Mixed materials
  MIXED_HEAVY: Box,
  HEAVY_MIXED: Box,
  
  // Legacy/fallback mappings
  concrete: Hammer,
  asphalt: Layers,
  soil: Mountain,
  rock: Mountain,
  gravel: CircleDot,
  granite: Square,
  brick: Layers,
  grass: Leaf,
  wood: Package,
  mixed: Box,
};

/**
 * Get the Lucide icon for a heavy material code
 * Falls back to HardHat if material code is not found
 */
export function getHeavyMaterialIcon(materialCode: string): LucideIcon {
  return HEAVY_MATERIAL_ICONS[materialCode] || HardHat;
}

/**
 * Check if a material has a valid icon mapping
 */
export function hasValidIcon(materialCode: string): boolean {
  return materialCode in HEAVY_MATERIAL_ICONS;
}

/**
 * Get all material codes that have icon mappings
 */
export function getMaterialCodesWithIcons(): string[] {
  return Object.keys(HEAVY_MATERIAL_ICONS);
}
