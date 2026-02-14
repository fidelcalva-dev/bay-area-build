// ============================================================
// DUMP & RETURN ENGINE — Customer-Owned Dumpster Hauling
// Pricing: truck time (hourly) + dump fee + 30% markup
// ============================================================

export const DUMP_RETURN_DEFAULTS = {
  hourlyRate: 180,
  minimumHours: 2,
  billingIncrementMinutes: 15,
  dumpFeeMarkupPct: 0.30,
  autoBillAdjustmentMax: 250,
  hookUnhookMinutes: 15,
  dumpProcessMinutes: 20,
} as const;

export interface DumpReturnConfig {
  hourlyRate: number;
  minimumHours: number;
  billingIncrementMinutes: number;
  dumpFeeMarkupPct: number;
  autoBillAdjustmentMax: number;
}

export interface DumpReturnEstimate {
  estimatedMinutesTotal: number;
  minimumMinutes: number;
  billedMinutes: number;
  billedIncrements: number;
  hourlyCharge: number;
  estimatedDumpFee: number;
  dumpFeeMarkup: number;
  estimatedTotal: number;
  config: DumpReturnConfig;
}

export interface DumpReturnActuals {
  actualMinutes: number;
  actualDumpFee: number;
  actualHourlyCharge: number;
  actualDumpMarkup: number;
  actualTotal: number;
  adjustmentVsEstimate: number;
  requiresApproval: boolean;
}

/**
 * Compute estimated pricing for Dump & Return service.
 */
export function estimateDumpReturn(params: {
  estimatedDriveMinutes: number;
  estimatedDumpFee: number;
  config?: Partial<DumpReturnConfig>;
}): DumpReturnEstimate {
  const cfg: DumpReturnConfig = {
    hourlyRate: params.config?.hourlyRate ?? DUMP_RETURN_DEFAULTS.hourlyRate,
    minimumHours: params.config?.minimumHours ?? DUMP_RETURN_DEFAULTS.minimumHours,
    billingIncrementMinutes: params.config?.billingIncrementMinutes ?? DUMP_RETURN_DEFAULTS.billingIncrementMinutes,
    dumpFeeMarkupPct: params.config?.dumpFeeMarkupPct ?? DUMP_RETURN_DEFAULTS.dumpFeeMarkupPct,
    autoBillAdjustmentMax: params.config?.autoBillAdjustmentMax ?? DUMP_RETURN_DEFAULTS.autoBillAdjustmentMax,
  };

  const operationalMinutes =
    DUMP_RETURN_DEFAULTS.hookUnhookMinutes +
    params.estimatedDriveMinutes +
    DUMP_RETURN_DEFAULTS.dumpProcessMinutes;

  const minimumMinutes = cfg.minimumHours * 60;
  const billedMinutes = Math.max(operationalMinutes, minimumMinutes);
  const billedIncrements = Math.ceil(billedMinutes / cfg.billingIncrementMinutes);
  const ratePerIncrement = cfg.hourlyRate / (60 / cfg.billingIncrementMinutes);
  const hourlyCharge = billedIncrements * ratePerIncrement;

  const dumpFeeMarkup = params.estimatedDumpFee * cfg.dumpFeeMarkupPct;
  const estimatedTotal = hourlyCharge + params.estimatedDumpFee + dumpFeeMarkup;

  return {
    estimatedMinutesTotal: operationalMinutes,
    minimumMinutes,
    billedMinutes,
    billedIncrements,
    hourlyCharge,
    estimatedDumpFee: params.estimatedDumpFee,
    dumpFeeMarkup,
    estimatedTotal,
    config: cfg,
  };
}

/**
 * Reconcile actuals from driver clock + dump ticket against estimate.
 */
export function reconcileDumpReturn(params: {
  actualMinutes: number;
  actualDumpFee: number;
  estimatedTotal: number;
  config?: Partial<DumpReturnConfig>;
}): DumpReturnActuals {
  const cfg: DumpReturnConfig = {
    hourlyRate: params.config?.hourlyRate ?? DUMP_RETURN_DEFAULTS.hourlyRate,
    minimumHours: params.config?.minimumHours ?? DUMP_RETURN_DEFAULTS.minimumHours,
    billingIncrementMinutes: params.config?.billingIncrementMinutes ?? DUMP_RETURN_DEFAULTS.billingIncrementMinutes,
    dumpFeeMarkupPct: params.config?.dumpFeeMarkupPct ?? DUMP_RETURN_DEFAULTS.dumpFeeMarkupPct,
    autoBillAdjustmentMax: params.config?.autoBillAdjustmentMax ?? DUMP_RETURN_DEFAULTS.autoBillAdjustmentMax,
  };

  const minimumMinutes = cfg.minimumHours * 60;
  const billedMinutes = Math.max(params.actualMinutes, minimumMinutes);
  const billedIncrements = Math.ceil(billedMinutes / cfg.billingIncrementMinutes);
  const ratePerIncrement = cfg.hourlyRate / (60 / cfg.billingIncrementMinutes);
  const actualHourlyCharge = billedIncrements * ratePerIncrement;

  const actualDumpMarkup = params.actualDumpFee * cfg.dumpFeeMarkupPct;
  const actualTotal = actualHourlyCharge + params.actualDumpFee + actualDumpMarkup;
  const adjustmentVsEstimate = actualTotal - params.estimatedTotal;

  return {
    actualMinutes: params.actualMinutes,
    actualDumpFee: params.actualDumpFee,
    actualHourlyCharge,
    actualDumpMarkup,
    actualTotal,
    adjustmentVsEstimate,
    requiresApproval: Math.abs(adjustmentVsEstimate) > cfg.autoBillAdjustmentMax,
  };
}

/**
 * Build invoice line items from actuals.
 */
export function buildDumpReturnInvoiceLines(actuals: DumpReturnActuals, config?: Partial<DumpReturnConfig>) {
  const hourlyRate = config?.hourlyRate ?? DUMP_RETURN_DEFAULTS.hourlyRate;
  const hours = +(actuals.actualMinutes / 60).toFixed(2);

  return [
    {
      code: 'HAUL_TIME',
      description: 'Truck time (pickup, haul, return)',
      qty: hours,
      unit: 'hour',
      unitPrice: hourlyRate,
      amount: actuals.actualHourlyCharge,
    },
    {
      code: 'DUMP_FEE',
      description: 'Disposal fee (per scale ticket)',
      qty: 1,
      unit: 'each',
      unitPrice: actuals.actualDumpFee,
      amount: actuals.actualDumpFee,
    },
    {
      code: 'DUMP_FEE_MARKUP',
      description: 'Environmental handling & processing',
      qty: 1,
      unit: 'each',
      unitPrice: actuals.actualDumpMarkup,
      amount: actuals.actualDumpMarkup,
    },
  ];
}
