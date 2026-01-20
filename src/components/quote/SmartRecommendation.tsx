// Smart Recommendation Engine for Quote Calculator
// Provides intelligent size recommendations based on project type and material

import { useMemo } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectType {
  id: string;
  label: string;
  icon: string;
  recommendedSize: number;
  heavyMaterial: boolean;
  typicalWeight: 'light' | 'medium' | 'heavy';
  description: string;
}

export const PROJECT_TYPES: ProjectType[] = [
  { id: 'garage', label: 'Garage Cleanout', icon: '🏠', recommendedSize: 10, heavyMaterial: false, typicalWeight: 'light', description: 'Boxes, furniture, misc items' },
  { id: 'remodel', label: 'Remodel', icon: '🔨', recommendedSize: 20, heavyMaterial: false, typicalWeight: 'medium', description: 'Drywall, cabinets, flooring' },
  { id: 'roofing', label: 'Roofing', icon: '🏗️', recommendedSize: 20, heavyMaterial: false, typicalWeight: 'heavy', description: 'Shingles are heavy — watch tonnage' },
  { id: 'demo', label: 'Demolition', icon: '💥', recommendedSize: 30, heavyMaterial: false, typicalWeight: 'heavy', description: 'Mixed debris, structural materials' },
  { id: 'landscaping', label: 'Landscaping', icon: '🌳', recommendedSize: 10, heavyMaterial: false, typicalWeight: 'medium', description: 'Branches, sod, yard waste' },
  { id: 'concrete', label: 'Concrete / Soil', icon: '🪨', recommendedSize: 10, heavyMaterial: true, typicalWeight: 'heavy', description: 'Requires inert-only dumpster' },
];

export type ConfidenceLevel = 'safe' | 'tight' | 'overflow';

interface SmartRecommendationResult {
  recommendedSize: number;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  reason: string;
}

export function getSmartRecommendation(
  selectedSize: number,
  projectType: string | null,
  materialType: 'general' | 'heavy'
): SmartRecommendationResult {
  const project = PROJECT_TYPES.find(p => p.id === projectType);
  
  // Default recommendation based on material
  let recommendedSize = materialType === 'heavy' ? 10 : 20;
  let confidence: ConfidenceLevel = 'safe';
  let reason = 'Based on typical project needs';

  if (project) {
    recommendedSize = project.recommendedSize;
    
    // Adjust for heavy materials
    if (materialType === 'heavy') {
      recommendedSize = Math.min(recommendedSize, 10);
    }

    // Determine confidence based on size selection vs recommendation
    if (selectedSize >= recommendedSize) {
      confidence = 'safe';
      reason = `${project.label} projects typically fit in ${recommendedSize} yards`;
    } else if (selectedSize >= recommendedSize - 10) {
      confidence = 'tight';
      reason = `Might be tight for ${project.label.toLowerCase()} — consider sizing up`;
    } else {
      confidence = 'overflow';
      reason = `${project.label} often needs ${recommendedSize}+ yards`;
    }

    // Special handling for heavy-weight projects
    if (project.typicalWeight === 'heavy' && selectedSize > 10) {
      confidence = selectedSize <= 20 ? 'tight' : 'safe';
      reason = 'Heavy materials — watch your weight limit';
    }
  }

  const confidenceLabels: Record<ConfidenceLevel, string> = {
    safe: 'Safe choice',
    tight: 'Might be tight',
    overflow: 'Risk of overflow',
  };

  return {
    recommendedSize,
    confidence,
    confidenceLabel: confidenceLabels[confidence],
    reason,
  };
}

interface ProjectTypeSelectorProps {
  value: string | null;
  onChange: (projectType: string | null) => void;
  materialType: 'general' | 'heavy';
}

export function ProjectTypeSelector({ value, onChange, materialType }: ProjectTypeSelectorProps) {
  const availableProjects = useMemo(() => {
    if (materialType === 'heavy') {
      return PROJECT_TYPES.filter(p => p.heavyMaterial || p.id === 'concrete');
    }
    return PROJECT_TYPES.filter(p => !p.heavyMaterial);
  }, [materialType]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        What's your project? <span className="text-muted-foreground font-normal">(optional)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {availableProjects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onChange(value === project.id ? null : project.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all",
              value === project.id
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-input bg-background text-muted-foreground hover:border-primary/50"
            )}
          >
            <span>{project.icon}</span>
            <span>{project.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  label: string;
  className?: string;
}

export function ConfidenceBadge({ confidence, label, className }: ConfidenceBadgeProps) {
  const styles: Record<ConfidenceLevel, { bg: string; text: string; icon: React.ReactNode }> = {
    safe: { 
      bg: 'bg-success/10 border-success/30', 
      text: 'text-success', 
      icon: <CheckCircle className="w-3.5 h-3.5" /> 
    },
    tight: { 
      bg: 'bg-amber-500/10 border-amber-500/30', 
      text: 'text-amber-600 dark:text-amber-400', 
      icon: <Info className="w-3.5 h-3.5" /> 
    },
    overflow: { 
      bg: 'bg-destructive/10 border-destructive/30', 
      text: 'text-destructive', 
      icon: <AlertTriangle className="w-3.5 h-3.5" /> 
    },
  };

  const style = styles[confidence];

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
      style.bg, style.text, className
    )}>
      {style.icon}
      <span>{label}</span>
    </div>
  );
}

interface RecommendedBadgeProps {
  isRecommended: boolean;
  className?: string;
}

export function RecommendedBadge({ isRecommended, className }: RecommendedBadgeProps) {
  if (!isRecommended) return null;
  
  return (
    <span className={cn(
      "absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full whitespace-nowrap flex items-center gap-1",
      className
    )}>
      <Sparkles className="w-3 h-3" />
      RECOMMENDED
    </span>
  );
}
