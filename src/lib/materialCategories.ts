// ============================================================
// CANONICAL MATERIAL CATEGORIES - SINGLE SOURCE OF TRUTH
// ============================================================
// This file defines ALL material categories used across the website,
// quote calculator, portal, and admin. Any changes should be made here only.

import type { LucideIcon } from 'lucide-react';
import { 
  Layers, Home, Archive, Hammer, TreePine, Leaf, Wrench, 
  Package, Cylinder, Square, LayoutGrid, HardHat, Mountain,
  Cuboid, CircleDot, Boxes
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

/**
 * Classification determines pricing logic:
 * - HEAVY_CLEAN_BASE: $638 base × size factor (concrete, soil, sand, gravel)
 * - HEAVY_PLUS_200: ($638 + $200) × size factor (brick, asphalt, tile, roofing)
 * - HEAVY_MIXED: ($638 + $300) × size factor (mixed heavy materials)
 * - MIXED_GENERAL: Standard debris pricing (yard/ton overage model)
 */
export type MaterialClassification = 
  | 'HEAVY_CLEAN_BASE' 
  | 'HEAVY_PLUS_200' 
  | 'HEAVY_MIXED' 
  | 'MIXED_GENERAL';

/**
 * Pricing mode determines how overage is calculated:
 * - HEAVY_FLAT_FEE: No weight charges, disposal included
 * - MIXED_YARD_OVERAGE: $30/yd extra for 6-10 yd containers
 * - MIXED_TON_OVERAGE: $165/ton for 20+ yd containers
 */
export type PricingMode = 
  | 'HEAVY_FLAT_FEE' 
  | 'MIXED_YARD_OVERAGE' 
  | 'MIXED_TON_OVERAGE';

/**
 * Warning types for UI display
 */
export interface MaterialWarning {
  type: 'contamination' | 'weight' | 'size_restriction' | 'reclassification';
  message: string;
  messageEs: string;
}

/**
 * Canonical Material Category Definition
 */
export interface CanonicalMaterialCategory {
  id: string;
  displayName: string;
  displayNameEs: string;
  description: string;
  descriptionEs: string;
  classification: MaterialClassification;
  allowedSizes: number[];
  /** Function to determine pricing mode based on size */
  getPricingMode: (size: number) => PricingMode;
  greenHaloEligible: boolean;
  /** Green Halo note (informational only, no guaranteed diversion) */
  greenHaloNote?: string;
  greenHaloNoteEs?: string;
  icon: LucideIcon;
  examples: string[];
  examplesEs: string[];
  densityHint: 'Very Light' | 'Light' | 'Light-Medium' | 'Medium' | 'Medium-Heavy' | 'Heavy';
  warnings: MaterialWarning[];
  /** Requires contamination check (trash/clean toggles) */
  requiresContaminationCheck: boolean;
  /** If true, this category routes to heavy material pricing */
  isHeavyMaterial: boolean;
  /** Increment applied to heavy base ($0, $200, or $300) */
  heavyIncrement?: number;
}

// ============================================================
// PRICING MODE HELPER
// ============================================================

/**
 * Standard mixed debris pricing mode based on size
 */
function getMixedPricingMode(size: number): PricingMode {
  return size <= 10 ? 'MIXED_YARD_OVERAGE' : 'MIXED_TON_OVERAGE';
}

/**
 * Heavy materials always use flat fee
 */
function getHeavyPricingMode(_size: number): PricingMode {
  return 'HEAVY_FLAT_FEE';
}

// ============================================================
// CANONICAL MATERIAL CATEGORIES
// ============================================================

export const CANONICAL_MATERIAL_CATEGORIES: CanonicalMaterialCategory[] = [
  // --------------------------------------------------------
  // MIXED/GENERAL DEBRIS (all sizes allowed)
  // --------------------------------------------------------
  {
    id: 'construction_remodel',
    displayName: 'Construction/Remodel',
    displayNameEs: 'Construcción/Remodelación',
    description: 'Drywall, lumber, flooring, cabinets, mixed demo',
    descriptionEs: 'Paneles de yeso, madera, pisos, gabinetes, demolición',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'C&D diversion support available upon request',
    greenHaloNoteEs: 'Apoyo de desvío C&D disponible bajo solicitud',
    icon: Hammer,
    examples: ['Drywall', 'Lumber', 'Carpet', 'Cabinets', 'Fixtures', 'Tile mix'],
    examplesEs: ['Paneles de yeso', 'Madera', 'Alfombra', 'Gabinetes', 'Accesorios'],
    densityHint: 'Medium-Heavy',
    warnings: [
      {
        type: 'weight',
        message: 'Heavy materials inside will increase weight and may cause overage',
        messageEs: 'Los materiales pesados aumentarán el peso y pueden causar sobrecargo',
      },
    ],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  {
    id: 'mixed_cd',
    displayName: 'Mixed C&D Debris',
    displayNameEs: 'Escombros C&D Mixtos',
    description: 'Construction & demolition mix of materials',
    descriptionEs: 'Mezcla de materiales de construcción y demolición',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'All C&D loads go to licensed transfer stations with state-mandated diversion rates',
    greenHaloNoteEs: 'Todos los escombros C&D van a estaciones de transferencia con tasas de desvío estatales',
    icon: Layers,
    examples: ['Drywall + Lumber', 'Flooring mix', 'Demo debris', 'Remodel waste'],
    examplesEs: ['Yeso + Madera', 'Mezcla de pisos', 'Escombros de demolición'],
    densityHint: 'Medium-Heavy',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  {
    id: 'household',
    displayName: 'Household/Junk',
    displayNameEs: 'Hogar/Basura',
    description: 'Furniture, boxes, clothes, general clutter',
    descriptionEs: 'Muebles, cajas, ropa, desorden general',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: false,
    icon: Home,
    examples: ['Furniture', 'Appliances', 'Boxes', 'Toys', 'Clothes'],
    examplesEs: ['Muebles', 'Electrodomésticos', 'Cajas', 'Juguetes', 'Ropa'],
    densityHint: 'Light-Medium',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  {
    id: 'cleanout',
    displayName: 'Estate/Garage Cleanout',
    displayNameEs: 'Limpieza de Propiedad/Garaje',
    description: 'Mixed items from storage or cleanouts',
    descriptionEs: 'Artículos mixtos de almacenamiento o limpiezas',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: false,
    icon: Archive,
    examples: ['Storage items', 'Old furniture', 'Misc. junk', 'Decor'],
    examplesEs: ['Artículos de almacenamiento', 'Muebles viejos', 'Basura miscelánea'],
    densityHint: 'Light-Medium',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  {
    id: 'yard_waste',
    displayName: 'Yard/Green Waste',
    displayNameEs: 'Residuos de Jardín',
    description: 'Grass, shrubs, leaves, landscaping debris',
    descriptionEs: 'Césped, arbustos, hojas, escombros de jardinería',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Green waste diverted to composting facilities',
    greenHaloNoteEs: 'Residuos verdes desviados a instalaciones de compostaje',
    icon: Leaf,
    examples: ['Grass clippings', 'Shrubs', 'Leaves', 'Sod', 'Small branches'],
    examplesEs: ['Recortes de césped', 'Arbustos', 'Hojas', 'Césped', 'Ramas pequeñas'],
    densityHint: 'Light',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  {
    id: 'clean_wood',
    displayName: 'Clean Wood Only',
    displayNameEs: 'Solo Madera Limpia',
    description: 'Untreated lumber, pallets, plywood (100% clean)',
    descriptionEs: 'Madera sin tratar, paletas, madera contrachapada (100% limpia)',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Clean wood recycled or diverted upon request',
    greenHaloNoteEs: 'Madera limpia reciclada o desviada bajo solicitud',
    icon: TreePine,
    examples: ['Lumber', 'Pallets', 'Plywood', 'Wood scraps', 'Branches'],
    examplesEs: ['Madera', 'Paletas', 'Contrachapado', 'Restos de madera', 'Ramas'],
    densityHint: 'Light-Medium',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  {
    id: 'mixed_other',
    displayName: 'Mixed/Other Debris',
    displayNameEs: 'Escombros Mixtos/Otros',
    description: 'Combination of multiple categories',
    descriptionEs: 'Combinación de múltiples categorías',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: false,
    icon: LayoutGrid,
    examples: ['Multiple types', 'Demo + Junk', 'Various materials'],
    examplesEs: ['Múltiples tipos', 'Demolición + Basura', 'Varios materiales'],
    densityHint: 'Medium',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  
  // --------------------------------------------------------
  // HEAVY MATERIALS - REQUIRE CONTAMINATION CHECK
  // Clean loads get flat-fee; trash contamination reclassifies to mixed
  // --------------------------------------------------------
  {
    id: 'roofing_clean',
    displayName: 'Roofing Only (100% Clean)',
    displayNameEs: 'Solo Techos (100% Limpio)',
    description: 'Asphalt shingles, felt paper, flashing only',
    descriptionEs: 'Solo tejas asfálticas, papel de fieltro, tapajuntas',
    classification: 'HEAVY_PLUS_200',
    allowedSizes: [6, 8, 10],
    getPricingMode: getHeavyPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Shingle recycling available at select facilities',
    greenHaloNoteEs: 'Reciclaje de tejas disponible en instalaciones selectas',
    icon: HardHat,
    examples: ['Asphalt shingles', 'Felt paper', 'Flashing', 'Roofing nails'],
    examplesEs: ['Tejas asfálticas', 'Papel de fieltro', 'Tapajuntas'],
    densityHint: 'Heavy',
    warnings: [
      {
        type: 'contamination',
        message: 'Must be clean and separated. Mixed loads with trash reclassify to mixed debris pricing.',
        messageEs: 'Debe estar limpio y separado. Cargas mixtas con basura se reclasifican a precio de escombros.',
      },
      {
        type: 'size_restriction',
        message: 'Heavy materials limited to 6-10 yd containers only',
        messageEs: 'Materiales pesados limitados a contenedores de 6-10 yardas',
      },
    ],
    requiresContaminationCheck: true,
    isHeavyMaterial: true,
    heavyIncrement: 200,
  },
  {
    id: 'concrete_clean',
    displayName: 'Concrete Only (100% Clean)',
    displayNameEs: 'Solo Concreto (100% Limpio)',
    description: 'Clean broken concrete, no rebar or trash',
    descriptionEs: 'Concreto roto limpio, sin rebar ni basura',
    classification: 'HEAVY_CLEAN_BASE',
    allowedSizes: [6, 8, 10],
    getPricingMode: getHeavyPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Concrete recycled as aggregate',
    greenHaloNoteEs: 'Concreto reciclado como agregado',
    icon: Cuboid,
    examples: ['Broken concrete', 'Sidewalk slabs', 'Patio concrete', 'Foundation pieces'],
    examplesEs: ['Concreto roto', 'Losas de acera', 'Concreto de patio'],
    densityHint: 'Heavy',
    warnings: [
      {
        type: 'contamination',
        message: 'Must be clean concrete only. Rebar okay if cut flush. Trash contaminates the load.',
        messageEs: 'Solo concreto limpio. Rebar aceptable si está cortado. La basura contamina la carga.',
      },
      {
        type: 'size_restriction',
        message: 'Heavy materials limited to 6-10 yd containers only',
        messageEs: 'Materiales pesados limitados a contenedores de 6-10 yardas',
      },
    ],
    requiresContaminationCheck: true,
    isHeavyMaterial: true,
    heavyIncrement: 0,
  },
  {
    id: 'dirt_soil',
    displayName: 'Dirt/Soil Only (100% Clean)',
    displayNameEs: 'Solo Tierra (100% Limpia)',
    description: 'Clean dirt, soil, or sand only',
    descriptionEs: 'Solo tierra limpia o arena',
    classification: 'HEAVY_CLEAN_BASE',
    allowedSizes: [6, 8, 10],
    getPricingMode: getHeavyPricingMode,
    greenHaloEligible: false,
    icon: Mountain,
    examples: ['Clean dirt', 'Topsoil', 'Fill dirt', 'Clean sand'],
    examplesEs: ['Tierra limpia', 'Tierra vegetal', 'Tierra de relleno', 'Arena limpia'],
    densityHint: 'Heavy',
    warnings: [
      {
        type: 'contamination',
        message: 'Must be clean with no trash, rocks, or debris mixed in.',
        messageEs: 'Debe estar limpia sin basura, rocas o escombros mezclados.',
      },
      {
        type: 'size_restriction',
        message: 'Heavy materials limited to 6-10 yd containers only',
        messageEs: 'Materiales pesados limitados a contenedores de 6-10 yardas',
      },
    ],
    requiresContaminationCheck: true,
    isHeavyMaterial: true,
    heavyIncrement: 0,
  },
  {
    id: 'brick_block',
    displayName: 'Brick/Block Only (100% Clean)',
    displayNameEs: 'Solo Ladrillo/Bloque (100% Limpio)',
    description: 'Brick, cinder block, masonry only',
    descriptionEs: 'Solo ladrillo, bloque de cemento, mampostería',
    classification: 'HEAVY_PLUS_200',
    allowedSizes: [6, 8, 10],
    getPricingMode: getHeavyPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Masonry materials recycled as aggregate',
    greenHaloNoteEs: 'Materiales de mampostería reciclados como agregado',
    icon: Boxes,
    examples: ['Brick', 'Cinder block', 'Concrete block', 'Stone veneer'],
    examplesEs: ['Ladrillo', 'Bloque de cemento', 'Bloque de concreto'],
    densityHint: 'Heavy',
    warnings: [
      {
        type: 'contamination',
        message: 'Must be clean and separated. Mortar is okay.',
        messageEs: 'Debe estar limpio y separado. El mortero está bien.',
      },
      {
        type: 'size_restriction',
        message: 'Heavy materials limited to 6-10 yd containers only',
        messageEs: 'Materiales pesados limitados a contenedores de 6-10 yardas',
      },
    ],
    requiresContaminationCheck: true,
    isHeavyMaterial: true,
    heavyIncrement: 200,
  },
  {
    id: 'asphalt_clean',
    displayName: 'Asphalt Only (100% Clean)',
    displayNameEs: 'Solo Asfalto (100% Limpio)',
    description: 'Broken asphalt, driveway, parking lot',
    descriptionEs: 'Asfalto roto, entrada, estacionamiento',
    classification: 'HEAVY_PLUS_200',
    allowedSizes: [6, 8, 10],
    getPricingMode: getHeavyPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Asphalt recycled into new pavement',
    greenHaloNoteEs: 'Asfalto reciclado en nuevo pavimento',
    icon: CircleDot,
    examples: ['Broken asphalt', 'Driveway asphalt', 'Parking lot'],
    examplesEs: ['Asfalto roto', 'Asfalto de entrada', 'Estacionamiento'],
    densityHint: 'Heavy',
    warnings: [
      {
        type: 'contamination',
        message: 'Must be clean asphalt only. No concrete, dirt, or trash.',
        messageEs: 'Solo asfalto limpio. Sin concreto, tierra ni basura.',
      },
      {
        type: 'size_restriction',
        message: 'Heavy materials limited to 6-10 yd containers only',
        messageEs: 'Materiales pesados limitados a contenedores de 6-10 yardas',
      },
    ],
    requiresContaminationCheck: true,
    isHeavyMaterial: true,
    heavyIncrement: 200,
  },
  {
    id: 'tile_clean',
    displayName: 'Tile Only (100% Clean)',
    displayNameEs: 'Solo Azulejo (100% Limpio)',
    description: 'Ceramic, porcelain, or stone tile only',
    descriptionEs: 'Solo azulejo cerámico, porcelana o piedra',
    classification: 'HEAVY_PLUS_200',
    allowedSizes: [6, 8, 10],
    getPricingMode: getHeavyPricingMode,
    greenHaloEligible: true,
    icon: Square,
    examples: ['Ceramic tile', 'Porcelain tile', 'Stone tile', 'Marble'],
    examplesEs: ['Azulejo cerámico', 'Azulejo de porcelana', 'Azulejo de piedra'],
    densityHint: 'Heavy',
    warnings: [
      {
        type: 'contamination',
        message: 'Must be clean tile only. No drywall, wood, or trash.',
        messageEs: 'Solo azulejo limpio. Sin paneles de yeso, madera ni basura.',
      },
      {
        type: 'size_restriction',
        message: 'Heavy materials limited to 6-10 yd containers only',
        messageEs: 'Materiales pesados limitados a contenedores de 6-10 yardas',
      },
    ],
    requiresContaminationCheck: true,
    isHeavyMaterial: true,
    heavyIncrement: 200,
  },
  {
    id: 'rock_gravel',
    displayName: 'Rock/Gravel Only (100% Clean)',
    displayNameEs: 'Solo Roca/Grava (100% Limpia)',
    description: 'Rock, stone, gravel, granite',
    descriptionEs: 'Roca, piedra, grava, granito',
    classification: 'HEAVY_PLUS_200',
    allowedSizes: [6, 8, 10],
    getPricingMode: getHeavyPricingMode,
    greenHaloEligible: false,
    icon: Mountain,
    examples: ['Rock', 'Gravel', 'Granite', 'Landscape stone', 'Flagstone'],
    examplesEs: ['Roca', 'Grava', 'Granito', 'Piedra de paisaje'],
    densityHint: 'Heavy',
    warnings: [
      {
        type: 'contamination',
        message: 'Must be clean rock/gravel only. No dirt, plants, or trash.',
        messageEs: 'Solo roca/grava limpia. Sin tierra, plantas ni basura.',
      },
      {
        type: 'size_restriction',
        message: 'Heavy materials limited to 6-10 yd containers only',
        messageEs: 'Materiales pesados limitados a contenedores de 6-10 yardas',
      },
    ],
    requiresContaminationCheck: true,
    isHeavyMaterial: true,
    heavyIncrement: 200,
  },
  {
    id: 'metal_clean',
    displayName: 'Metal Only (100% Clean)',
    displayNameEs: 'Solo Metal (100% Limpio)',
    description: 'Scrap metal, pipes, fixtures',
    descriptionEs: 'Chatarra de metal, tuberías, accesorios',
    classification: 'HEAVY_PLUS_200',
    allowedSizes: [6, 8, 10],
    getPricingMode: getHeavyPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Metal recycled at certified facilities',
    greenHaloNoteEs: 'Metal reciclado en instalaciones certificadas',
    icon: Wrench,
    examples: ['Steel', 'Aluminum', 'Copper', 'Pipes', 'Fixtures'],
    examplesEs: ['Acero', 'Aluminio', 'Cobre', 'Tuberías', 'Accesorios'],
    densityHint: 'Heavy',
    warnings: [
      {
        type: 'contamination',
        message: 'Must be clean metal only. No trash or hazardous materials.',
        messageEs: 'Solo metal limpio. Sin basura ni materiales peligrosos.',
      },
      {
        type: 'size_restriction',
        message: 'Heavy materials limited to 6-10 yd containers only',
        messageEs: 'Materiales pesados limitados a contenedores de 6-10 yardas',
      },
    ],
    requiresContaminationCheck: true,
    isHeavyMaterial: true,
    heavyIncrement: 200,
  },
  {
    id: 'drywall_clean',
    displayName: 'Drywall Only (100% Clean)',
    displayNameEs: 'Solo Paneles de Yeso (100% Limpios)',
    description: 'Sheetrock, gypsum board only',
    descriptionEs: 'Solo paneles de yeso, cartón yeso',
    classification: 'MIXED_GENERAL', // Drywall is not heavy, standard mixed pricing
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Drywall recycled at specialized facilities',
    greenHaloNoteEs: 'Paneles de yeso reciclados en instalaciones especializadas',
    icon: Square,
    examples: ['Sheetrock', 'Gypsum board', 'Drywall scraps'],
    examplesEs: ['Cartón yeso', 'Paneles de yeso', 'Restos de drywall'],
    densityHint: 'Medium',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  {
    id: 'cardboard_paper',
    displayName: 'Cardboard/Paper',
    displayNameEs: 'Cartón/Papel',
    description: 'Boxes, packaging, paper products',
    descriptionEs: 'Cajas, empaques, productos de papel',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Cardboard recycled at municipal facilities',
    greenHaloNoteEs: 'Cartón reciclado en instalaciones municipales',
    icon: Package,
    examples: ['Cardboard boxes', 'Packaging', 'Office paper', 'Magazines'],
    examplesEs: ['Cajas de cartón', 'Empaques', 'Papel de oficina', 'Revistas'],
    densityHint: 'Very Light',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
  {
    id: 'plastic_clean',
    displayName: 'Plastic Only (100% Clean)',
    displayNameEs: 'Solo Plástico (100% Limpio)',
    description: 'Plastic containers, packaging, materials',
    descriptionEs: 'Contenedores de plástico, empaques, materiales',
    classification: 'MIXED_GENERAL',
    allowedSizes: [6, 8, 10, 20, 30, 40, 50],
    getPricingMode: getMixedPricingMode,
    greenHaloEligible: true,
    greenHaloNote: 'Plastic recycled where facilities accept',
    greenHaloNoteEs: 'Plástico reciclado donde las instalaciones aceptan',
    icon: Cylinder,
    examples: ['Plastic bins', 'Packaging', 'PVC', 'Containers'],
    examplesEs: ['Contenedores de plástico', 'Empaques', 'PVC', 'Recipientes'],
    densityHint: 'Very Light',
    warnings: [],
    requiresContaminationCheck: false,
    isHeavyMaterial: false,
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get a category by ID
 */
export function getCategoryById(id: string): CanonicalMaterialCategory | undefined {
  return CANONICAL_MATERIAL_CATEGORIES.find(c => c.id === id);
}

/**
 * Get all categories that allow a given size
 */
export function getCategoriesForSize(size: number): CanonicalMaterialCategory[] {
  return CANONICAL_MATERIAL_CATEGORIES.filter(c => c.allowedSizes.includes(size));
}

/**
 * Get only heavy material categories
 */
export function getHeavyCategories(): CanonicalMaterialCategory[] {
  return CANONICAL_MATERIAL_CATEGORIES.filter(c => c.isHeavyMaterial);
}

/**
 * Get only general/mixed material categories
 */
export function getGeneralCategories(): CanonicalMaterialCategory[] {
  return CANONICAL_MATERIAL_CATEGORIES.filter(c => !c.isHeavyMaterial);
}

/**
 * Get categories eligible for Green Halo
 */
export function getGreenHaloCategories(): CanonicalMaterialCategory[] {
  return CANONICAL_MATERIAL_CATEGORIES.filter(c => c.greenHaloEligible);
}

/**
 * Map classification to legacy HeavyMaterialClass
 */
export function getHeavyMaterialClass(classification: MaterialClassification): 'base' | 'plus_200' | 'mixed_heavy' | null {
  switch (classification) {
    case 'HEAVY_CLEAN_BASE': return 'base';
    case 'HEAVY_PLUS_200': return 'plus_200';
    case 'HEAVY_MIXED': return 'mixed_heavy';
    default: return null;
  }
}

/**
 * Determine if a load should be reclassified to mixed debris
 * When trash is present with heavy material, it becomes mixed debris
 */
export interface ReclassificationCheck {
  categoryId: string;
  hasTrash: boolean;
  isCleanSingleType: boolean;
}

export interface ReclassificationResult {
  reclassified: boolean;
  newClassification: MaterialClassification;
  newAllowedSizes: number[];
  message: string;
  messageEs: string;
}

export function checkReclassification(check: ReclassificationCheck): ReclassificationResult {
  const category = getCategoryById(check.categoryId);
  
  if (!category) {
    return {
      reclassified: false,
      newClassification: 'MIXED_GENERAL',
      newAllowedSizes: [6, 8, 10, 20, 30, 40, 50],
      message: 'Category not found, defaulting to mixed debris',
      messageEs: 'Categoría no encontrada, por defecto escombros mixtos',
    };
  }
  
  // If category requires contamination check and has trash
  if (category.requiresContaminationCheck && check.hasTrash) {
    return {
      reclassified: true,
      newClassification: 'MIXED_GENERAL',
      newAllowedSizes: [6, 8, 10, 20, 30, 40, 50],
      message: 'Reclassified to mixed debris due to trash contamination. Per-ton billing applies for 20+ yd.',
      messageEs: 'Reclasificado a escombros mixtos por contaminación. Se aplica facturación por tonelada para 20+ yd.',
    };
  }
  
  // If heavy material but not clean single type, it becomes mixed heavy
  if (category.isHeavyMaterial && !check.isCleanSingleType && !check.hasTrash) {
    return {
      reclassified: true,
      newClassification: 'HEAVY_MIXED',
      newAllowedSizes: [6, 8, 10],
      message: 'Mixed heavy materials (+$300). Flat fee applies.',
      messageEs: 'Materiales pesados mixtos (+$300). Se aplica tarifa plana.',
    };
  }
  
  // No reclassification needed
  return {
    reclassified: false,
    newClassification: category.classification,
    newAllowedSizes: category.allowedSizes,
    message: category.isHeavyMaterial 
      ? 'Clean heavy material qualifies for flat-fee pricing.'
      : '',
    messageEs: category.isHeavyMaterial 
      ? 'Material pesado limpio califica para tarifa plana.'
      : '',
  };
}

// ============================================================
// QUOTE RECORD DATA STRUCTURE
// ============================================================

/**
 * Data structure to save to quote record
 */
export interface MaterialSelectionData {
  categoryId: string;
  classification: MaterialClassification;
  pricingMode: PricingMode;
  greenHaloEligible: boolean;
  isHeavyMaterial: boolean;
  heavyIncrement: number | null;
  reclassified: boolean;
  reclassificationReason: string | null;
  hasTrash: boolean | null;
  isCleanSingleType: boolean | null;
}

/**
 * Build material selection data for saving to quote
 */
export function buildMaterialSelectionData(
  categoryId: string,
  selectedSize: number,
  hasTrash?: boolean,
  isCleanSingleType?: boolean
): MaterialSelectionData | null {
  const category = getCategoryById(categoryId);
  if (!category) return null;
  
  // Check for reclassification
  const reclass = category.requiresContaminationCheck && hasTrash !== undefined && isCleanSingleType !== undefined
    ? checkReclassification({ categoryId, hasTrash, isCleanSingleType })
    : null;
  
  const finalClassification = reclass?.reclassified 
    ? reclass.newClassification 
    : category.classification;
  
  const pricingMode = reclass?.reclassified && finalClassification === 'MIXED_GENERAL'
    ? (selectedSize <= 10 ? 'MIXED_YARD_OVERAGE' : 'MIXED_TON_OVERAGE')
    : category.getPricingMode(selectedSize);
  
  return {
    categoryId,
    classification: finalClassification,
    pricingMode,
    greenHaloEligible: category.greenHaloEligible,
    isHeavyMaterial: !reclass?.reclassified && category.isHeavyMaterial,
    heavyIncrement: category.isHeavyMaterial && !reclass?.reclassified ? (category.heavyIncrement || 0) : null,
    reclassified: reclass?.reclassified || false,
    reclassificationReason: reclass?.message || null,
    hasTrash: hasTrash ?? null,
    isCleanSingleType: isCleanSingleType ?? null,
  };
}
