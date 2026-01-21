// Material Volume & Weight Estimator Constants

import type { MaterialCategoryConfig, InputMethodConfig, MaterialCategory } from './types';

// Material categories with density ranges (tons per cubic yard)
export const MATERIAL_CATEGORIES: MaterialCategoryConfig[] = [
  {
    id: 'mixed_cd',
    label: 'Mixed / C&D Debris',
    labelEs: 'Escombro Mixto / C&D',
    icon: 'package',
    description: 'Construction debris, junk, mixed materials',
    descriptionEs: 'Escombro de construcción, basura, materiales mixtos',
    isHeavy: false,
    allowedInputMethods: ['sqft', 'cuyd', 'dimensions'],
    densityLow: 0.15,
    densityHigh: 0.35,
  },
  {
    id: 'roofing',
    label: 'Roofing Shingles',
    labelEs: 'Tejas de Techo',
    icon: 'home',
    description: 'Asphalt shingles, roofing materials',
    descriptionEs: 'Tejas asfálticas, materiales de techo',
    isHeavy: false,
    allowedInputMethods: ['sqft'],
    densityLow: 0.35,
    densityHigh: 0.60,
    askLayers: true,
  },
  {
    id: 'drywall',
    label: 'Drywall',
    labelEs: 'Tablaroca',
    icon: 'square',
    description: 'Sheetrock, gypsum board',
    descriptionEs: 'Sheetrock, paneles de yeso',
    isHeavy: false,
    allowedInputMethods: ['sqft', 'count'],
    densityLow: 0.25,
    densityHigh: 0.50,
    askSheets: true,
  },
  {
    id: 'lumber',
    label: 'Lumber / Wood',
    labelEs: 'Madera',
    icon: 'tree-pine',
    description: 'Framing, boards, plywood',
    descriptionEs: 'Estructura, tablas, contrachapado',
    isHeavy: false,
    allowedInputMethods: ['sqft', 'cuyd', 'dimensions'],
    densityLow: 0.10,
    densityHigh: 0.25,
  },
  {
    id: 'concrete',
    label: 'Concrete Slab',
    labelEs: 'Losa de Concreto',
    icon: 'hard-hat',
    description: 'Driveways, patios, foundations',
    descriptionEs: 'Entradas, patios, cimientos',
    isHeavy: true,
    allowedInputMethods: ['sqft'],
    densityLow: 1.2,
    densityHigh: 1.6,
    askThickness: true,
  },
  {
    id: 'dirt_soil',
    label: 'Dirt / Soil',
    labelEs: 'Tierra',
    icon: 'mountain',
    description: 'Clean fill dirt, topsoil',
    descriptionEs: 'Tierra de relleno, tierra vegetal',
    isHeavy: true,
    allowedInputMethods: ['cuyd', 'dimensions'],
    densityLow: 1.0,
    densityHigh: 1.5,
  },
  {
    id: 'green_waste',
    label: 'Green Waste',
    labelEs: 'Desechos de Jardín',
    icon: 'leaf',
    description: 'Branches, trees, yard waste',
    descriptionEs: 'Ramas, árboles, desechos de jardín',
    isHeavy: false,
    allowedInputMethods: ['cuyd', 'dimensions'],
    densityLow: 0.10,
    densityHigh: 0.30,
  },
  {
    id: 'metal',
    label: 'Metal',
    labelEs: 'Metal',
    icon: 'wrench',
    description: 'Scrap metal, pipes, fixtures',
    descriptionEs: 'Chatarra, tuberías, accesorios',
    isHeavy: false,
    allowedInputMethods: ['cuyd', 'dimensions'],
    densityLow: 0.50,
    densityHigh: 1.50,
  },
  {
    id: 'appliances',
    label: 'Appliances / Bulky Items',
    labelEs: 'Electrodomésticos / Artículos Grandes',
    icon: 'refrigerator',
    description: 'Fridges, washers, furniture',
    descriptionEs: 'Refrigeradores, lavadoras, muebles',
    isHeavy: false,
    allowedInputMethods: ['count'],
    densityLow: 0.15,
    densityHigh: 0.40,
  },
];

// Input methods
export const INPUT_METHODS: InputMethodConfig[] = [
  {
    id: 'sqft',
    label: 'Square Feet',
    labelEs: 'Pies Cuadrados',
    description: 'Area measurement (sq ft)',
    descriptionEs: 'Medida de área (pies²)',
    icon: 'ruler',
  },
  {
    id: 'cuyd',
    label: 'Cubic Yards',
    labelEs: 'Yardas Cúbicas',
    description: 'Volume if you know it',
    descriptionEs: 'Volumen si lo conoce',
    icon: 'box',
  },
  {
    id: 'dimensions',
    label: 'L × W × H',
    labelEs: 'L × A × Alto',
    description: 'Length, Width, Height in feet',
    descriptionEs: 'Largo, Ancho, Alto en pies',
    icon: 'move-3d',
  },
  {
    id: 'count',
    label: 'Count Items',
    labelEs: 'Contar Artículos',
    description: 'Number of items',
    descriptionEs: 'Número de artículos',
    icon: 'hash',
  },
];

// Included tons by size (for general debris only)
export const INCLUDED_TONS: Record<number, number> = {
  6: 0.5,
  8: 0.5,
  10: 1,
  20: 2,
  30: 3,
  40: 4,
  50: 5,
};

// Volume to size recommendations (cubic yards)
export const SIZE_THRESHOLDS = [
  { maxVolume: 6, size: 6, nextSize: 8 },
  { maxVolume: 8, size: 8, nextSize: 10 },
  { maxVolume: 10, size: 10, nextSize: 20 },
  { maxVolume: 20, size: 20, nextSize: 30 },
  { maxVolume: 30, size: 30, nextSize: 40 },
  { maxVolume: 40, size: 40, nextSize: 50 },
  { maxVolume: 50, size: 50, nextSize: 50 },
];

// Heavy material max size
export const HEAVY_MAX_SIZE = 10;

// Roofing factor: square feet per layer to cubic yards (conservative)
export const ROOFING_FACTOR = 0.015; // cy per 100 sqft per layer

// Drywall: 4x8 sheet volume in cubic yards (approx 0.03 cy per sheet)
export const DRYWALL_SHEET_VOLUME = 0.03;

// Appliance/bulky item volume estimates
export const BULKY_ITEM_VOLUMES: Record<string, { label: string; volumeCy: number }> = {
  mattress: { label: 'Mattress', volumeCy: 0.8 },
  appliance_large: { label: 'Large Appliance', volumeCy: 1.5 },
  appliance_small: { label: 'Small Appliance', volumeCy: 0.5 },
  furniture_large: { label: 'Large Furniture', volumeCy: 1.2 },
  furniture_small: { label: 'Small Furniture', volumeCy: 0.4 },
};

// Average volume per bulky item (for simplified count input)
export const AVG_BULKY_ITEM_VOLUME = 1.0; // cy per item

// Concrete: thickness to feet conversion
export const CONCRETE_THICKNESSES = [
  { inches: 4, label: '4" (Standard patio)', labelEs: '4" (Patio estándar)' },
  { inches: 6, label: '6" (Driveway)', labelEs: '6" (Entrada)' },
  { inches: 8, label: '8" (Heavy duty)', labelEs: '8" (Trabajo pesado)' },
];

// Helper to get category config
export function getCategoryConfig(id: MaterialCategory): MaterialCategoryConfig | undefined {
  return MATERIAL_CATEGORIES.find(c => c.id === id);
}

// Helper to get input method config
export function getInputMethodConfig(id: string): InputMethodConfig | undefined {
  return INPUT_METHODS.find(m => m.id === id);
}
