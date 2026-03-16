// ══════════════════════════════════════════════════════════════
// CANONICAL HEAVY MATERIAL POLICY ENGINE
// Single source of truth for classification, reclassification,
// surcharges, and enforcement rules.
// All UI, CRM, billing, dispatch, and legal docs import from here.
// ══════════════════════════════════════════════════════════════

import { PRICING_POLICIES } from './shared-data';

// ── Policy Constants ─────────────────────────────────────────
export const HEAVY_POLICY = {
  allowed_sizes: [5, 8, 10] as const,
  contamination_threshold_pct: 5,
  debris_to_general_threshold_pct: 20,
  no_notice_surcharge_standard: 150,
  no_notice_surcharge_severe: 300,
  fill_to_line_required: true,
  overage_per_ton_general: PRICING_POLICIES.overagePerTonGeneral,
  green_halo_surcharge_per_ton: PRICING_POLICIES.greenHaloSurchargePerTon,
} as const;

// ── Material Classes ─────────────────────────────────────────
export type HeavyMaterialClassCode =
  | 'CLEAN_BASE_HEAVY'
  | 'PREMIUM_HEAVY'
  | 'MIXED_HEAVY'
  | 'GENERAL_DEBRIS'
  | 'CONCRETE_WITH_REBAR'
  | 'GREEN_HALO_DEBRIS';

export interface HeavyMaterialClassDef {
  code: HeavyMaterialClassCode;
  label: string;
  labelEs: string;
  description: string;
  pricingMode: 'flat_fee' | 'per_ton' | 'facility_override';
  increment: number;
  allowedSizes: readonly number[];
  requiresFillLine: boolean;
}

export const MATERIAL_CLASS_DEFS: Record<HeavyMaterialClassCode, HeavyMaterialClassDef> = {
  CLEAN_BASE_HEAVY: {
    code: 'CLEAN_BASE_HEAVY',
    label: 'Base Heavy Materials',
    labelEs: 'Materiales Pesados Base',
    description: 'Clean concrete, soil/dirt, sand, gravel',
    pricingMode: 'flat_fee',
    increment: 0,
    allowedSizes: HEAVY_POLICY.allowed_sizes,
    requiresFillLine: true,
  },
  PREMIUM_HEAVY: {
    code: 'PREMIUM_HEAVY',
    label: 'Specialty Heavy (+$200)',
    labelEs: 'Pesado Especial (+$200)',
    description: 'Brick, asphalt, tile, roofing gravel, rock/stone',
    pricingMode: 'flat_fee',
    increment: 200,
    allowedSizes: HEAVY_POLICY.allowed_sizes,
    requiresFillLine: true,
  },
  MIXED_HEAVY: {
    code: 'MIXED_HEAVY',
    label: 'Mixed Heavy (+$300)',
    labelEs: 'Pesado Mezclado (+$300)',
    description: 'Any mix of two or more heavy materials',
    pricingMode: 'flat_fee',
    increment: 300,
    allowedSizes: HEAVY_POLICY.allowed_sizes,
    requiresFillLine: true,
  },
  GENERAL_DEBRIS: {
    code: 'GENERAL_DEBRIS',
    label: 'General Debris',
    labelEs: 'Escombros Generales',
    description: 'Mixed construction/demolition, household, renovation waste',
    pricingMode: 'per_ton',
    increment: 0,
    allowedSizes: [5, 8, 10, 20, 30, 40, 50],
    requiresFillLine: false,
  },
  CONCRETE_WITH_REBAR: {
    code: 'CONCRETE_WITH_REBAR',
    label: 'Concrete with Rebar',
    labelEs: 'Concreto con Varilla',
    description: 'Concrete containing rebar — facility surcharge may apply',
    pricingMode: 'facility_override',
    increment: 0,
    allowedSizes: HEAVY_POLICY.allowed_sizes,
    requiresFillLine: true,
  },
  GREEN_HALO_DEBRIS: {
    code: 'GREEN_HALO_DEBRIS',
    label: 'Green Halo Premium',
    labelEs: 'Green Halo Premium',
    description: '100% clean recyclable material routed to certified recycling facility',
    pricingMode: 'flat_fee',
    increment: 0,
    allowedSizes: HEAVY_POLICY.allowed_sizes,
    requiresFillLine: true,
  },
};

// ── Reclassification Engine ──────────────────────────────────

export interface ReclassificationInput {
  declared_class: HeavyMaterialClassCode;
  contamination_pct: number; // 0-100
  debris_pct: number;        // 0-100
  has_rebar: boolean;
  customer_notified_advance: boolean;
}

export interface ReclassificationResult {
  resulting_class: HeavyMaterialClassCode;
  reclassified: boolean;
  reason: string;
  reasonEs: string;
  no_notice_flag: boolean;
  reroute_required: boolean;
  reroute_severity: 'none' | 'standard' | 'severe';
  penalty_surcharge: number;
  facility_surcharge_applies: boolean;
}

export function reclassifyMaterial(input: ReclassificationInput): ReclassificationResult {
  const {
    declared_class,
    contamination_pct,
    debris_pct,
    has_rebar,
    customer_notified_advance,
  } = input;

  // Rule 1: >20% debris/trash → General Debris
  if (debris_pct > HEAVY_POLICY.debris_to_general_threshold_pct) {
    const noNotice = !customer_notified_advance;
    return {
      resulting_class: 'GENERAL_DEBRIS',
      reclassified: true,
      reason: `Load contains ${debris_pct}% trash/debris (>${HEAVY_POLICY.debris_to_general_threshold_pct}% threshold). Reclassified as General Debris — billed by weight.`,
      reasonEs: `La carga contiene ${debris_pct}% basura/escombros (>${HEAVY_POLICY.debris_to_general_threshold_pct}% umbral). Reclasificado como Escombros Generales — facturado por peso.`,
      no_notice_flag: noNotice,
      reroute_required: true,
      reroute_severity: noNotice ? 'severe' : 'none',
      penalty_surcharge: noNotice ? HEAVY_POLICY.no_notice_surcharge_severe : 0,
      facility_surcharge_applies: false,
    };
  }

  // Rule 2: >5% contamination (another heavy material) → Mixed Heavy
  if (contamination_pct > HEAVY_POLICY.contamination_threshold_pct && declared_class !== 'MIXED_HEAVY' && declared_class !== 'GENERAL_DEBRIS') {
    const noNotice = !customer_notified_advance;
    return {
      resulting_class: 'MIXED_HEAVY',
      reclassified: true,
      reason: `Load contains ${contamination_pct}% of another heavy material (>${HEAVY_POLICY.contamination_threshold_pct}% threshold). Reclassified as Mixed Heavy.`,
      reasonEs: `La carga contiene ${contamination_pct}% de otro material pesado (>${HEAVY_POLICY.contamination_threshold_pct}% umbral). Reclasificado como Pesado Mezclado.`,
      no_notice_flag: noNotice,
      reroute_required: noNotice,
      reroute_severity: noNotice ? 'standard' : 'none',
      penalty_surcharge: noNotice ? HEAVY_POLICY.no_notice_surcharge_standard : 0,
      facility_surcharge_applies: false,
    };
  }

  // Rule 3: Concrete with rebar
  if (has_rebar && (declared_class === 'CLEAN_BASE_HEAVY' || declared_class === 'CONCRETE_WITH_REBAR')) {
    return {
      resulting_class: 'CONCRETE_WITH_REBAR',
      reclassified: declared_class !== 'CONCRETE_WITH_REBAR',
      reason: 'Concrete with rebar detected. Facility-based surcharge may apply.',
      reasonEs: 'Concreto con varilla detectado. Puede aplicar recargo de instalación.',
      no_notice_flag: false,
      reroute_required: false,
      reroute_severity: 'none',
      penalty_surcharge: 0,
      facility_surcharge_applies: true,
    };
  }

  // No reclassification needed
  return {
    resulting_class: declared_class,
    reclassified: false,
    reason: 'Material matches declared classification.',
    reasonEs: 'El material coincide con la clasificación declarada.',
    no_notice_flag: false,
    reroute_required: false,
    reroute_severity: 'none',
    penalty_surcharge: 0,
    facility_surcharge_applies: false,
  };
}

// ── Canonical Warning Blocks (short) ─────────────────────────

export const HEAVY_WARNINGS = {
  cleanLoad: {
    en: 'Clean loads of a single heavy material qualify for flat-fee pricing with disposal included. Fill to the line — do not overfill.',
    es: 'Las cargas limpias de un solo material pesado califican para tarifa plana con disposición incluida. Llene hasta la línea — no sobrecargue.',
  },
  mixedReclassification: {
    en: `If more than ${HEAVY_POLICY.contamination_threshold_pct}% of another heavy material is present, the load is reclassified as Mixed Heavy (+$300). If more than ${HEAVY_POLICY.debris_to_general_threshold_pct}% is trash or debris, it becomes General Debris and is billed by weight at $${HEAVY_POLICY.overage_per_ton_general}/ton.`,
    es: `Si más del ${HEAVY_POLICY.contamination_threshold_pct}% de otro material pesado está presente, la carga se reclasifica como Pesado Mezclado (+$300). Si más del ${HEAVY_POLICY.debris_to_general_threshold_pct}% es basura o escombros, se convierte en Escombros Generales y se factura por peso a $${HEAVY_POLICY.overage_per_ton_general}/ton.`,
  },
  noNoticeReroute: {
    en: `If materials are misdeclared and our team is not notified before pickup, a reroute surcharge of $${HEAVY_POLICY.no_notice_surcharge_standard}–$${HEAVY_POLICY.no_notice_surcharge_severe} applies in addition to the actual disposal cost difference. Advance notice avoids any penalty — we will adjust logistics at no extra charge.`,
    es: `Si los materiales se declaran incorrectamente y nuestro equipo no es notificado antes de la recogida, se aplica un recargo de $${HEAVY_POLICY.no_notice_surcharge_standard}–$${HEAVY_POLICY.no_notice_surcharge_severe} además de la diferencia real en el costo de disposición. Notificar con anticipación evita cualquier penalización — ajustaremos la logística sin cargo adicional.`,
  },
  concreteWithRebar: {
    en: 'Concrete with rebar may be subject to an additional disposal surcharge depending on the receiving facility.',
    es: 'El concreto con varilla puede estar sujeto a un recargo de disposición adicional dependiendo de la instalación receptora.',
  },
  greenHalo: {
    en: `Green Halo premium disposal routes 100% clean material to a certified recycling facility. An additional disposal premium of $${HEAVY_POLICY.green_halo_surcharge_per_ton}/ton may apply. A Green Halo recycling receipt is provided when the facility certifies the load as recyclable.`,
    es: `La disposición premium Green Halo envía material 100% limpio a una instalación de reciclaje certificada. Puede aplicar un recargo de disposición premium de $${HEAVY_POLICY.green_halo_surcharge_per_ton}/ton. Se proporciona un recibo de reciclaje Green Halo cuando la instalación certifica la carga como reciclable.`,
  },
} as const;

// ── Size validation helper ───────────────────────────────────
export function isHeavyAllowedSize(size: number): boolean {
  return (HEAVY_POLICY.allowed_sizes as readonly number[]).includes(size);
}
