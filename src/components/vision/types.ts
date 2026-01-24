// Waste Vision AI Types

export interface MaterialDetection {
  id: string;
  label: string;
  confidence: number;
  estimated_volume_pct?: number;
}

export interface HazardDetection {
  id: string;
  label: string;
  confidence: number;
  note?: string;
}

export interface AnalysisResult {
  success: boolean;
  analysisId?: string;
  materials: MaterialDetection[];
  hazards: HazardDetection[];
  volume_cy: { low: number; high: number };
  weight_tons: { low: number; high: number };
  pickup_loads: { low: number; high: number };
  recommended_flow: {
    waste_type: 'heavy' | 'mixed';
    recommended_size: number;
    alternate_sizes: number[];
    fit_confidence: 'safe' | 'tight' | 'risk' | 'overflow';
    notes: string[];
  };
  green_halo: {
    eligible: boolean;
    note?: string;
  };
  hazard_review_required: boolean;
  overall_confidence: 'high' | 'medium' | 'low';
  disclaimers: string[];
  error?: string;
}

export interface WasteVisionSession {
  id: string;
  created_at: string;
  image_count: number;
  result: AnalysisResult | null;
  applied_to_quote: boolean;
}
