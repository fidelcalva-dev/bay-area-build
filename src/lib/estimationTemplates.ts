// ============================================================
// Project Estimation Templates
// Configurable volume estimation data for the AI estimator.
// Values are cubic-yard ranges per unit (sq ft, linear ft, room, etc.)
// These should eventually live in admin config / DB.
// ============================================================

export interface EstimationTemplate {
  id: string;
  label: string;
  labelEs: string;
  unit: 'sqft' | 'room' | 'fixed' | 'linear_ft';
  yardPerUnit: [number, number]; // [min, max] yd³ per unit
  typicalRange: [number, number]; // typical total yd³ for average job
  heavyMaterial: boolean;
  recyclableMaterials: string[];
  savingsTips: string[];
  savingsTipsEs: string[];
}

export const ESTIMATION_TEMPLATES: EstimationTemplate[] = [
  {
    id: 'full_house_demo',
    label: 'Full House Demolition',
    labelEs: 'Demolición de Casa Completa',
    unit: 'sqft',
    yardPerUnit: [0.05, 0.08],
    typicalRange: [60, 160],
    heavyMaterial: false,
    recyclableMaterials: ['wood', 'metal', 'concrete', 'drywall', 'roofing'],
    savingsTips: [
      'Separate concrete and metal before loading — they can go in dedicated containers at flat rates.',
      'Stage your demo in phases so clean loads stay clean.',
      'Upload photos or plans for a more accurate estimate.',
    ],
    savingsTipsEs: [
      'Separe concreto y metal antes de cargar — pueden ir en contenedores dedicados a tarifa fija.',
      'Organice la demolición en fases para mantener las cargas limpias.',
      'Suba fotos o planos para un estimado más preciso.',
    ],
  },
  {
    id: 'interior_demo',
    label: 'Interior Demolition',
    labelEs: 'Demolición Interior',
    unit: 'sqft',
    yardPerUnit: [0.02, 0.04],
    typicalRange: [20, 60],
    heavyMaterial: false,
    recyclableMaterials: ['drywall', 'wood', 'metal', 'carpet'],
    savingsTips: [
      'If you are removing tile over concrete, the concrete portion may qualify for flat-rate heavy pricing.',
      'Keep drywall separate from heavy materials to avoid reclassification.',
    ],
    savingsTipsEs: [
      'Si remueve azulejo sobre concreto, la porción de concreto puede calificar para tarifa fija de material pesado.',
      'Mantenga el drywall separado de materiales pesados para evitar reclasificación.',
    ],
  },
  {
    id: 'kitchen_remodel',
    label: 'Kitchen Remodel',
    labelEs: 'Remodelación de Cocina',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [10, 20],
    heavyMaterial: false,
    recyclableMaterials: ['wood', 'metal', 'appliances', 'drywall'],
    savingsTips: [
      'A 20-yard container usually covers a full kitchen demo and rebuild.',
      'Appliances without Freon can go in the dumpster at no extra charge.',
    ],
    savingsTipsEs: [
      'Un contenedor de 20 yardas normalmente cubre una cocina completa.',
      'Los electrodomésticos sin Freón pueden ir en el contenedor sin cargo extra.',
    ],
  },
  {
    id: 'bathroom_remodel',
    label: 'Bathroom Remodel',
    labelEs: 'Remodelación de Baño',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [5, 10],
    heavyMaterial: false,
    recyclableMaterials: ['tile', 'drywall', 'fixtures'],
    savingsTips: [
      'A 10-yard container is usually sufficient for a single bathroom.',
      'If removing a cast-iron tub, mention it — it counts toward weight.',
    ],
    savingsTipsEs: [
      'Un contenedor de 10 yardas normalmente es suficiente para un baño.',
      'Si remueve una tina de hierro fundido, menciónelo — cuenta hacia el peso.',
    ],
  },
  {
    id: 'garage_cleanout',
    label: 'Garage Cleanout',
    labelEs: 'Limpieza de Garaje',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [10, 20],
    heavyMaterial: false,
    recyclableMaterials: ['metal', 'cardboard', 'wood'],
    savingsTips: [
      'Most single-car garage cleanouts fit in a 10-yard. Double garages typically need a 20-yard.',
      'Separate recyclable metal — it reduces your load weight.',
    ],
    savingsTipsEs: [
      'La mayoría de garajes sencillos caben en 10 yardas. Garajes dobles típicamente necesitan 20 yardas.',
      'Separe el metal reciclable — reduce el peso de su carga.',
    ],
  },
  {
    id: 'roofing',
    label: 'Roofing Tear-Off',
    labelEs: 'Retiro de Techo',
    unit: 'sqft',
    yardPerUnit: [0.008, 0.015],
    typicalRange: [10, 30],
    heavyMaterial: false,
    recyclableMaterials: ['shingles'],
    savingsTips: [
      'Single-layer roofs produce less debris. Multi-layer tear-offs can double the volume.',
      'Roofing shingles are heavy — stay within included tonnage to avoid overage.',
    ],
    savingsTipsEs: [
      'Techos de una capa producen menos escombro. Retiros multicapa pueden duplicar el volumen.',
      'Las tejas son pesadas — manténgase dentro del tonelaje incluido para evitar excedentes.',
    ],
  },
  {
    id: 'construction_debris',
    label: 'Construction Debris',
    labelEs: 'Escombro de Construcción',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [20, 40],
    heavyMaterial: false,
    recyclableMaterials: ['wood', 'metal', 'cardboard', 'drywall'],
    savingsTips: [
      'If you generate debris continuously, ask about swap service — we pick up full containers and drop empty ones.',
      'Contractors should apply for volume pricing.',
    ],
    savingsTipsEs: [
      'Si genera escombro continuamente, pregunte por servicio de intercambio — recogemos contenedores llenos y dejamos vacíos.',
      'Los contratistas deben solicitar precios por volumen.',
    ],
  },
  {
    id: 'office_cleanout',
    label: 'Office Cleanout',
    labelEs: 'Limpieza de Oficina',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [10, 30],
    heavyMaterial: false,
    recyclableMaterials: ['cardboard', 'metal', 'electronics_note'],
    savingsTips: [
      'Electronics (monitors, TVs) cannot go in the dumpster — arrange separate e-waste pickup.',
      'Cardboard can be broken down flat to maximize space.',
    ],
    savingsTipsEs: [
      'Electrónicos (monitores, TVs) no pueden ir en el contenedor — coordine recolección de e-waste por separado.',
      'El cartón se puede aplanar para maximizar espacio.',
    ],
  },
  {
    id: 'yard_cleanup',
    label: 'Yard Cleanup',
    labelEs: 'Limpieza de Jardín',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [5, 20],
    heavyMaterial: false,
    recyclableMaterials: ['green_waste', 'wood'],
    savingsTips: [
      'Green waste is lighter — you can often fit more volume before hitting weight limits.',
      'Keep soil and dirt separate if present — those require heavy-material containers.',
    ],
    savingsTipsEs: [
      'Los desechos verdes son más livianos — puede cargar más volumen antes de alcanzar límites de peso.',
      'Mantenga tierra y suelo separados si los hay — requieren contenedores de material pesado.',
    ],
  },
  {
    id: 'concrete_removal',
    label: 'Concrete Removal',
    labelEs: 'Retiro de Concreto',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [5, 10],
    heavyMaterial: true,
    recyclableMaterials: ['concrete'],
    savingsTips: [
      'Clean concrete qualifies for flat-rate pricing — no weight overage charges.',
      'Keep the load clean. If trash is mixed in, it gets reclassified to general debris rates.',
      'Concrete with rebar is accepted but may have different pricing.',
    ],
    savingsTipsEs: [
      'El concreto limpio califica para tarifa fija — sin cargos por exceso de peso.',
      'Mantenga la carga limpia. Si se mezcla basura, se reclasifica a tarifas de escombro general.',
      'Concreto con varilla se acepta pero puede tener precios diferentes.',
    ],
  },
  {
    id: 'soil_excavation',
    label: 'Soil / Dirt Excavation',
    labelEs: 'Excavación de Tierra',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [5, 10],
    heavyMaterial: true,
    recyclableMaterials: ['soil'],
    savingsTips: [
      'Clean soil gets flat-rate pricing with no weight surprises.',
      'Do not mix trash, roots, or debris into a clean soil container.',
    ],
    savingsTipsEs: [
      'La tierra limpia tiene tarifa fija sin sorpresas de peso.',
      'No mezcle basura, raíces o escombro en un contenedor de tierra limpia.',
    ],
  },
  {
    id: 'deck_fence_demo',
    label: 'Deck / Fence Demolition',
    labelEs: 'Demolición de Deck / Cerca',
    unit: 'linear_ft',
    yardPerUnit: [0.05, 0.10],
    typicalRange: [10, 20],
    heavyMaterial: false,
    recyclableMaterials: ['wood', 'metal'],
    savingsTips: [
      'Break down lumber to maximize container space.',
      'Metal hardware and fencing can often be recycled separately.',
    ],
    savingsTipsEs: [
      'Corte la madera para maximizar el espacio del contenedor.',
      'La ferretería metálica y el cercado a menudo se pueden reciclar por separado.',
    ],
  },
  {
    id: 'estate_cleanout',
    label: 'Estate / Eviction Cleanout',
    labelEs: 'Limpieza de Propiedad / Desalojo',
    unit: 'fixed',
    yardPerUnit: [0, 0],
    typicalRange: [20, 40],
    heavyMaterial: false,
    recyclableMaterials: ['metal', 'cardboard', 'furniture'],
    savingsTips: [
      'For large estates, consider multiple containers or swap service.',
      'Mattresses carry a $50 recycling fee each — plan accordingly.',
    ],
    savingsTipsEs: [
      'Para propiedades grandes, considere múltiples contenedores o servicio de intercambio.',
      'Los colchones tienen un cargo de reciclaje de $50 cada uno — planifique en consecuencia.',
    ],
  },
];

/** Compute estimated volume for a project */
export function estimateVolume(
  templateId: string,
  sqft?: number,
  linearFt?: number,
): { minYards: number; maxYards: number } | null {
  const t = ESTIMATION_TEMPLATES.find(t => t.id === templateId);
  if (!t) return null;

  if (t.unit === 'sqft' && sqft && sqft > 0) {
    return {
      minYards: Math.round(sqft * t.yardPerUnit[0]),
      maxYards: Math.round(sqft * t.yardPerUnit[1]),
    };
  }
  if (t.unit === 'linear_ft' && linearFt && linearFt > 0) {
    return {
      minYards: Math.round(linearFt * t.yardPerUnit[0]),
      maxYards: Math.round(linearFt * t.yardPerUnit[1]),
    };
  }
  // Fixed or no dimension given — use typical range
  return { minYards: t.typicalRange[0], maxYards: t.typicalRange[1] };
}

/** Get recommended dumpster plan */
export function recommendDumpsterPlan(
  minYards: number,
  maxYards: number,
  isHeavy: boolean,
): { sizes: number[]; description: string } {
  const avgYards = Math.round((minYards + maxYards) / 2);

  if (isHeavy) {
    // Heavy: only 5, 8, 10
    if (avgYards <= 5) return { sizes: [5], description: '1x 5-yard container' };
    if (avgYards <= 8) return { sizes: [8], description: '1x 8-yard container' };
    if (avgYards <= 10) return { sizes: [10], description: '1x 10-yard container' };
    // Multiple containers needed
    const count10 = Math.ceil(avgYards / 10);
    return {
      sizes: Array(count10).fill(10),
      description: `${count10}x 10-yard containers (swap service recommended)`,
    };
  }

  // General debris
  const SIZES = [5, 8, 10, 20, 30, 40, 50];
  // Single container
  if (avgYards <= 50) {
    const best = SIZES.find(s => s >= avgYards) || 50;
    return { sizes: [best], description: `1x ${best}-yard container` };
  }
  // Multiple containers
  const plans: { sizes: number[]; description: string }[] = [];
  // Try combinations
  if (avgYards <= 80) {
    plans.push({ sizes: [40, 40], description: '2x 40-yard containers' });
    plans.push({ sizes: [50, 30], description: '1x 50-yard + 1x 30-yard' });
  } else if (avgYards <= 100) {
    plans.push({ sizes: [50, 50], description: '2x 50-yard containers' });
    plans.push({ sizes: [40, 40, 30], description: '2x 40-yard + 1x 30-yard' });
  } else if (avgYards <= 150) {
    const n50 = Math.floor(avgYards / 50);
    const rem = avgYards - n50 * 50;
    const remSize = SIZES.find(s => s >= rem) || 50;
    const sizes = [...Array(n50).fill(50), remSize];
    plans.push({ sizes, description: sizes.map((s, i) => `${i > 0 ? ' + ' : ''}1x ${s}-yard`).join('') });
  } else {
    const n50 = Math.ceil(avgYards / 50);
    plans.push({
      sizes: Array(n50).fill(50),
      description: `${n50}x 50-yard containers (swap service recommended)`,
    });
  }
  return plans[0];
}
