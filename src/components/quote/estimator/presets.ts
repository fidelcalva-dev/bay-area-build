// One-Tap Presets Configuration

import type { MaterialCategory, ConfidenceLevel } from './types';

export type PresetTab = 'homeowner' | 'contractor' | 'business';

export interface Preset {
  id: string;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  category: MaterialCategory;
  isHeavy: boolean;
  volumeLow: number; // cubic yards
  volumeHigh: number;
  weightLow: number; // tons
  weightHigh: number;
  recommendedSize: number;
  alternateSize?: number;
  icon: string;
}

export interface PresetTabConfig {
  id: PresetTab;
  label: string;
  labelEs: string;
  icon: string;
}

export const PRESET_TABS: PresetTabConfig[] = [
  { id: 'homeowner', label: 'Homeowner', labelEs: 'Propietario', icon: 'home' },
  { id: 'contractor', label: 'Contractor', labelEs: 'Contratista', icon: 'hard-hat' },
  { id: 'business', label: 'Business', labelEs: 'Negocio', icon: 'building' },
];

export const PRESETS: Record<PresetTab, Preset[]> = {
  homeowner: [
    // Garage Cleanout
    {
      id: 'garage_cleanout',
      label: 'Garage Cleanout (1–2 car)',
      labelEs: 'Limpieza de Garaje (1–2 autos)',
      description: 'Typical household items, boxes, old furniture',
      descriptionEs: 'Artículos del hogar, cajas, muebles viejos',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 8,
      volumeHigh: 12,
      weightLow: 1,
      weightHigh: 3,
      recommendedSize: 10,
      alternateSize: 20,
      icon: 'home',
    },
    // Bathroom Remodel
    {
      id: 'bathroom_remodel',
      label: 'Bathroom Remodel',
      labelEs: 'Remodelación de Baño',
      description: 'Tile, drywall, fixtures, vanity',
      descriptionEs: 'Azulejos, paneles de yeso, accesorios',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 6,
      volumeHigh: 10,
      weightLow: 1,
      weightHigh: 3,
      recommendedSize: 10,
      alternateSize: 20,
      icon: 'square',
    },
    // Kitchen Remodel
    {
      id: 'kitchen_remodel',
      label: 'Kitchen Remodel',
      labelEs: 'Remodelación de Cocina',
      description: 'Cabinets, countertops, flooring, appliances',
      descriptionEs: 'Gabinetes, encimeras, pisos, electrodomésticos',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 12,
      volumeHigh: 20,
      weightLow: 2,
      weightHigh: 5,
      recommendedSize: 20,
      icon: 'package',
    },
    // Small Deck Removal
    {
      id: 'deck_removal',
      label: 'Small Deck Removal',
      labelEs: 'Remoción de Deck Pequeño',
      description: 'Wood deck, railing, stairs',
      descriptionEs: 'Deck de madera, barandas, escaleras',
      category: 'lumber',
      isHeavy: false,
      volumeLow: 8,
      volumeHigh: 15,
      weightLow: 1,
      weightHigh: 3,
      recommendedSize: 10,
      alternateSize: 20,
      icon: 'tree-pine',
    },
    // Yard Cleanup
    {
      id: 'yard_cleanup',
      label: 'Yard Cleanup (Green Waste)',
      labelEs: 'Limpieza de Jardín',
      description: 'Branches, leaves, brush, small trees',
      descriptionEs: 'Ramas, hojas, arbustos, árboles pequeños',
      category: 'green_waste',
      isHeavy: false,
      volumeLow: 8,
      volumeHigh: 20,
      weightLow: 1,
      weightHigh: 4,
      recommendedSize: 20,
      alternateSize: 10,
      icon: 'leaf',
    },
    // Roofing Small
    {
      id: 'roofing_small',
      label: 'Roofing (Single layer, small)',
      labelEs: 'Techo (Una capa, pequeño)',
      description: 'Up to 1,500 sq ft, single layer shingles',
      descriptionEs: 'Hasta 140m², una capa de tejas',
      category: 'roofing',
      isHeavy: false,
      volumeLow: 8,
      volumeHigh: 12,
      weightLow: 2,
      weightHigh: 4,
      recommendedSize: 10,
      alternateSize: 20,
      icon: 'home',
    },
    // Roofing Medium/Large
    {
      id: 'roofing_large',
      label: 'Roofing (Single layer, large)',
      labelEs: 'Techo (Una capa, grande)',
      description: '1,500–3,000 sq ft, single layer shingles',
      descriptionEs: '140–280m², una capa de tejas',
      category: 'roofing',
      isHeavy: false,
      volumeLow: 12,
      volumeHigh: 20,
      weightLow: 4,
      weightHigh: 8,
      recommendedSize: 20,
      alternateSize: 30,
      icon: 'home',
    },
  ],
  contractor: [
    // One-room Demo
    {
      id: 'oneroom_demo',
      label: 'One-Room Demo',
      labelEs: 'Demolición de Habitación',
      description: 'Single room gut, walls, flooring, ceiling',
      descriptionEs: 'Demolición completa: paredes, piso, techo',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 10,
      volumeHigh: 20,
      weightLow: 2,
      weightHigh: 5,
      recommendedSize: 20,
      icon: 'wrench',
    },
    // Full Remodel Debris
    {
      id: 'full_remodel',
      label: 'Full Remodel Debris',
      labelEs: 'Remodelación Completa',
      description: 'Multi-room remodel, mixed materials',
      descriptionEs: 'Remodelación multi-habitación, materiales mixtos',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 20,
      volumeHigh: 35,
      weightLow: 5,
      weightHigh: 12,
      recommendedSize: 30,
      alternateSize: 40,
      icon: 'wrench',
    },
    // Small Demolition
    {
      id: 'small_demolition',
      label: 'Small Demolition (Light Demo)',
      labelEs: 'Demolición Pequeña',
      description: 'Interior demo, non-structural',
      descriptionEs: 'Demo interior, no estructural',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 30,
      volumeHigh: 45,
      weightLow: 8,
      weightHigh: 15,
      recommendedSize: 40,
      icon: 'package',
    },
    // Heavy: Concrete/Soil Small
    {
      id: 'concrete_small',
      label: 'Concrete / Soil (Small)',
      labelEs: 'Concreto / Tierra (Pequeño)',
      description: 'Small slab, patio, or dirt removal',
      descriptionEs: 'Losa pequeña, patio, o tierra',
      category: 'concrete',
      isHeavy: true,
      volumeLow: 4,
      volumeHigh: 6,
      weightLow: 5,
      weightHigh: 9,
      recommendedSize: 6,
      icon: 'mountain',
    },
    // Heavy: Concrete/Soil Medium
    {
      id: 'concrete_medium',
      label: 'Concrete / Soil (Medium)',
      labelEs: 'Concreto / Tierra (Mediano)',
      description: 'Driveway section, foundation work',
      descriptionEs: 'Sección de entrada, trabajo de cimientos',
      category: 'concrete',
      isHeavy: true,
      volumeLow: 6,
      volumeHigh: 8,
      weightLow: 8,
      weightHigh: 12,
      recommendedSize: 8,
      icon: 'mountain',
    },
    // Heavy: Concrete/Soil Large
    {
      id: 'concrete_large',
      label: 'Concrete / Soil (Large)',
      labelEs: 'Concreto / Tierra (Grande)',
      description: 'Full driveway, large slab removal',
      descriptionEs: 'Entrada completa, losa grande',
      category: 'concrete',
      isHeavy: true,
      volumeLow: 8,
      volumeHigh: 10,
      weightLow: 10,
      weightHigh: 15,
      recommendedSize: 10,
      icon: 'mountain',
    },
  ],
  business: [
    // Office/Retail Cleanout
    {
      id: 'office_cleanout',
      label: 'Office / Retail Cleanout',
      labelEs: 'Limpieza de Oficina / Tienda',
      description: 'Furniture, fixtures, office equipment',
      descriptionEs: 'Muebles, accesorios, equipo de oficina',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 15,
      volumeHigh: 30,
      weightLow: 3,
      weightHigh: 8,
      recommendedSize: 20,
      alternateSize: 30,
      icon: 'building',
    },
    // Tenant Turnover
    {
      id: 'tenant_turnover',
      label: 'Tenant Turnover (Property Mgmt)',
      labelEs: 'Cambio de Inquilino',
      description: 'Left-behind items, renovation debris',
      descriptionEs: 'Artículos abandonados, escombros de renovación',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 15,
      volumeHigh: 30,
      weightLow: 3,
      weightHigh: 8,
      recommendedSize: 20,
      alternateSize: 30,
      icon: 'home',
    },
    // Commercial TI / Ongoing
    {
      id: 'commercial_ti',
      label: 'Commercial TI / Ongoing',
      labelEs: 'Mejoras Comerciales',
      description: 'Large-scale tenant improvements',
      descriptionEs: 'Mejoras de inquilinos a gran escala',
      category: 'mixed_cd',
      isHeavy: false,
      volumeLow: 40,
      volumeHigh: 60,
      weightLow: 10,
      weightHigh: 20,
      recommendedSize: 40,
      alternateSize: 50,
      icon: 'building',
    },
  ],
};

// Helper to get confidence level based on volume vs recommended size
export function getPresetConfidence(
  volumeHigh: number, 
  weightHigh: number, 
  recommendedSize: number,
  isHeavy: boolean
): { confidence: ConfidenceLevel; label: string; labelEs: string; note: string; noteEs: string } {
  // For heavy materials, check if volume exceeds size
  if (isHeavy) {
    if (volumeHigh > recommendedSize * 0.95) {
      return {
        confidence: 'tight',
        label: 'Might Be Tight',
        labelEs: 'Puede Estar Justo',
        note: 'Volume is near capacity. Consider next size if unsure.',
        noteEs: 'Volumen cerca del límite. Considera el siguiente tamaño.',
      };
    }
    return {
      confidence: 'safe',
      label: 'Safe Choice',
      labelEs: 'Elección Segura',
      note: 'Flat-fee pricing — no weight charges for heavy materials.',
      noteEs: 'Precio fijo — sin cargos por peso para materiales pesados.',
    };
  }
  
  // For general debris, check included tons
  const includedTons: Record<number, number> = {
    6: 0.5, 8: 0.5, 10: 1, 20: 2, 30: 3, 40: 4, 50: 5,
  };
  const included = includedTons[recommendedSize] || 2;
  
  if (weightHigh > included * 1.5) {
    return {
      confidence: 'overweight',
      label: 'Risk of Overweight',
      labelEs: 'Riesgo de Sobrepeso',
      note: `May exceed ${included}T included. Overage charged at $165/ton.`,
      noteEs: `Puede exceder ${included}T incluidas. Exceso a $165/ton.`,
    };
  }
  
  if (weightHigh > included) {
    return {
      confidence: 'tight',
      label: 'Might Be Tight',
      labelEs: 'Puede Estar Justo',
      note: `Weight near ${included}T included. Consider adding buffer.`,
      noteEs: `Peso cerca de ${included}T incluidas. Considera agregar margen.`,
    };
  }
  
  if (volumeHigh > recommendedSize * 0.9) {
    return {
      confidence: 'tight',
      label: 'Volume Near Limit',
      labelEs: 'Volumen Cerca del Límite',
      note: 'May fill up quickly. Consider next size up.',
      noteEs: 'Puede llenarse rápido. Considera el tamaño siguiente.',
    };
  }
  
  return {
    confidence: 'safe',
    label: 'Safe Choice',
    labelEs: 'Elección Segura',
    note: `Comfortable fit with ${included}T included tonnage.`,
    noteEs: `Ajuste cómodo con ${included}T de tonelaje incluido.`,
  };
}
