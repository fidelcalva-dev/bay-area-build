// Smart Recommendation Engine for Quote Calculator V1
// Automatically recommends dumpster size based on Waste Type + Project Type
// This is advisory, not a guarantee

import { useState, useMemo } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Info, HelpCircle, ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// PROJECT TYPE DEFINITIONS
// ============================================================

export interface ProjectType {
  id: string;
  label: string;
  icon: string;
  // For general debris - recommended sizes by scale
  generalSizeSmall?: number;
  generalSizeLarge?: number;
  // For heavy materials - recommended sizes by scale
  heavySizeSmall?: number;
  heavySizeLarge?: number;
  // Can this project apply to heavy materials?
  allowsHeavy: boolean;
  // Can this project apply to general debris?
  allowsGeneral: boolean;
  description: string;
}

// Project types with specific size recommendations per spec
export const PROJECT_TYPES: ProjectType[] = [
  // General Debris Projects
  { 
    id: 'garage', 
    label: 'Garage Cleanout', 
    icon: '🏠', 
    generalSizeSmall: 10, 
    generalSizeLarge: 20,
    allowsGeneral: true,
    allowsHeavy: false,
    description: 'Boxes, furniture, misc items' 
  },
  { 
    id: 'remodel', 
    label: 'Remodel', 
    icon: '🔨', 
    generalSizeSmall: 20, 
    generalSizeLarge: 20,
    allowsGeneral: true,
    allowsHeavy: false,
    description: 'Drywall, cabinets, flooring' 
  },
  { 
    id: 'roofing-small', 
    label: 'Roofing (Small)', 
    icon: '🏠', 
    generalSizeSmall: 20, 
    generalSizeLarge: 20,
    allowsGeneral: true,
    allowsHeavy: false,
    description: 'Small roof, shingles' 
  },
  { 
    id: 'roofing-large', 
    label: 'Roofing (Large)', 
    icon: '🏗️', 
    generalSizeSmall: 30, 
    generalSizeLarge: 30,
    allowsGeneral: true,
    allowsHeavy: false,
    description: 'Large roof, heavy shingles' 
  },
  { 
    id: 'demo', 
    label: 'Demo / Full Cleanout', 
    icon: '💥', 
    generalSizeSmall: 30, 
    generalSizeLarge: 40,
    allowsGeneral: true,
    allowsHeavy: false,
    description: 'Mixed debris, structural materials' 
  },
  { 
    id: 'commercial', 
    label: 'Commercial / Very Large', 
    icon: '🏢', 
    generalSizeSmall: 40, 
    generalSizeLarge: 50,
    allowsGeneral: true,
    allowsHeavy: false,
    description: 'Large-scale cleanout or construction' 
  },
  { 
    id: 'landscaping', 
    label: 'Landscaping', 
    icon: '🌳', 
    generalSizeSmall: 10, 
    generalSizeLarge: 20,
    allowsGeneral: true,
    allowsHeavy: false,
    description: 'Branches, sod, yard waste' 
  },
  // Heavy Material Projects
  { 
    id: 'concrete-small', 
    label: 'Concrete / Soil (Small)', 
    icon: '🪨', 
    heavySizeSmall: 6, 
    heavySizeLarge: 6,
    allowsGeneral: false,
    allowsHeavy: true,
    description: 'Small patio, walkway' 
  },
  { 
    id: 'concrete-medium', 
    label: 'Concrete / Soil (Medium)', 
    icon: '🪨', 
    heavySizeSmall: 8, 
    heavySizeLarge: 8,
    allowsGeneral: false,
    allowsHeavy: true,
    description: 'Driveway section, larger area' 
  },
  { 
    id: 'concrete-large', 
    label: 'Concrete / Soil (Large)', 
    icon: '🪨', 
    heavySizeSmall: 10, 
    heavySizeLarge: 10,
    allowsGeneral: false,
    allowsHeavy: true,
    description: 'Full driveway, foundation work' 
  },
];

// ============================================================
// SMART RECOMMENDATION LOGIC
// ============================================================

export type ConfidenceLevel = 'safe' | 'tight' | 'overflow';

export interface SmartRecommendationResult {
  recommendedSize: number;
  recommendationReason: string;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  reason: string; // Display reason for UI
}

/**
 * Get smart size recommendation based on waste type and project type
 * 
 * Rules:
 * - Heavy: Only 6/8/10 available, default = 8, project-specific adjustments
 * - General: 6-50 available, default = 20, project-specific adjustments
 */
export function getSmartRecommendation(
  selectedSize: number,
  projectType: string | null,
  materialType: 'general' | 'heavy'
): SmartRecommendationResult {
  // Default recommendations per material type
  let recommendedSize = materialType === 'heavy' ? 8 : 20;
  let recommendationReason = materialType === 'heavy' 
    ? 'Default for heavy materials' 
    : 'Most popular for general debris';

  const project = projectType ? PROJECT_TYPES.find(p => p.id === projectType) : null;

  if (project) {
    if (materialType === 'heavy' && project.allowsHeavy) {
      // Heavy material project - use heavy size recommendations (capped at 10)
      recommendedSize = project.heavySizeLarge || project.heavySizeSmall || 8;
      recommendationReason = `${project.label} typically needs ${recommendedSize} yard for heavy materials`;
    } else if (materialType === 'general' && project.allowsGeneral) {
      // General debris project - use general size recommendations
      // Use the larger recommendation as default (safer choice)
      recommendedSize = project.generalSizeLarge || project.generalSizeSmall || 20;
      recommendationReason = `${project.label} projects typically need ${recommendedSize} yard`;
    }
  }

  // Ensure heavy materials stay within allowed sizes
  if (materialType === 'heavy') {
    recommendedSize = Math.min(recommendedSize, 10);
  }

  // Determine confidence based on user selection vs recommendation
  let confidence: ConfidenceLevel = 'safe';
  let confidenceLabel = 'Safe choice';
  let reason = recommendationReason;

  if (selectedSize >= recommendedSize) {
    confidence = 'safe';
    confidenceLabel = 'Safe choice';
    reason = project 
      ? `Good fit for ${project.label.toLowerCase()}` 
      : recommendationReason;
  } else if (selectedSize >= recommendedSize - 10 && selectedSize > 0) {
    confidence = 'tight';
    confidenceLabel = 'Might be tight';
    reason = project 
      ? `Might be tight for ${project.label.toLowerCase()} — consider ${recommendedSize} yard` 
      : 'Consider sizing up for safety margin';
  } else if (selectedSize > 0) {
    confidence = 'overflow';
    confidenceLabel = 'Risk of overflow';
    reason = project 
      ? `${project.label} often needs ${recommendedSize}+ yards` 
      : `We recommend ${recommendedSize} yard for this type of project`;
  }

  return {
    recommendedSize,
    recommendationReason,
    confidence,
    confidenceLabel,
    reason,
  };
}

// ============================================================
// UI COMPONENTS
// ============================================================

interface ProjectTypeSelectorProps {
  value: string | null;
  onChange: (projectType: string | null) => void;
  materialType: 'general' | 'heavy';
}

export function ProjectTypeSelector({ value, onChange, materialType }: ProjectTypeSelectorProps) {
  const availableProjects = useMemo(() => {
    if (materialType === 'heavy') {
      return PROJECT_TYPES.filter(p => p.allowsHeavy);
    }
    return PROJECT_TYPES.filter(p => p.allowsGeneral);
  }, [materialType]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        What's your project? <span className="text-muted-foreground font-normal">(helps us recommend a size)</span>
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
      {value && (
        <p className="text-xs text-muted-foreground">
          {PROJECT_TYPES.find(p => p.id === value)?.description}
        </p>
      )}
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
  reason?: string;
  className?: string;
}

export function RecommendedBadge({ isRecommended, reason, className }: RecommendedBadgeProps) {
  if (!isRecommended) return null;
  
  return (
    <div className={cn("absolute -top-2.5 left-1/2 -translate-x-1/2 z-10", className)}>
      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full whitespace-nowrap flex items-center gap-1 shadow-sm">
        <Sparkles className="w-3 h-3" />
        RECOMMENDED
      </span>
    </div>
  );
}

// Reason text shown below the recommended badge
interface RecommendationReasonProps {
  reason: string;
  className?: string;
}

export function RecommendationReason({ reason, className }: RecommendationReasonProps) {
  return (
    <p className={cn(
      "text-[10px] text-primary/80 text-center mt-1 leading-tight",
      className
    )}>
      {reason}
    </p>
  );
}

// ============================================================
// WHY THIS SIZE - Expandable explanation section
// ============================================================

interface WhyThisSizeProps {
  projectType: string | null;
  materialType: 'general' | 'heavy';
  recommendedSize: number;
  selectedSize: number;
  className?: string;
}

export function WhyThisSize({ 
  projectType, 
  materialType, 
  recommendedSize, 
  selectedSize,
  className 
}: WhyThisSizeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const project = projectType ? PROJECT_TYPES.find(p => p.id === projectType) : null;
  
  // Don't show if no project type selected
  if (!projectType || !project) return null;

  const isRecommendedSelected = selectedSize === recommendedSize;
  const isSmallerThanRecommended = selectedSize < recommendedSize;

  // Build explanation based on project type
  const getDetailedExplanation = () => {
    const lines: string[] = [];
    
    // Project-specific reasoning
    if (project) {
      lines.push(`**${project.label}** projects typically generate a specific volume and weight of debris.`);
      
      if (materialType === 'heavy') {
        lines.push(`Heavy materials like concrete, dirt, and brick are limited to **6, 8, or 10 yard** dumpsters due to weight restrictions.`);
        lines.push(`We recommend **${recommendedSize} yards** based on typical ${project.label.toLowerCase()} project scope.`);
      } else {
        // General debris explanations by project type
        switch (project.id) {
          case 'garage':
            lines.push(`Garage cleanouts vary widely—a single-car garage with boxes usually fits in 10 yards, while a packed 2-car garage may need 20.`);
            break;
          case 'remodel':
            lines.push(`Kitchen and bathroom remodels typically generate drywall, cabinets, flooring, and fixtures. 20 yards handles most single-room remodels.`);
            break;
          case 'roofing-small':
            lines.push(`Small roofs (under 20 squares) typically fit in 20 yards. Shingles are heavy—watch your tonnage limit.`);
            break;
          case 'roofing-large':
            lines.push(`Large roofs (20+ squares) need 30 yards for volume. Remember: shingles weigh 250-350 lbs per square.`);
            break;
          case 'demo':
            lines.push(`Demolition creates bulky, mixed debris. Interior demo usually needs 30 yards; structural demo may need 40.`);
            break;
          case 'commercial':
            lines.push(`Commercial and large-scale projects benefit from 40-50 yard containers to minimize swap-outs and trips.`);
            break;
          case 'landscaping':
            lines.push(`Yard waste (branches, sod, brush) is bulky but light. 10-20 yards usually works unless you're removing trees.`);
            break;
          default:
            lines.push(`Based on typical project scope, **${recommendedSize} yards** should handle your debris.`);
        }
      }
    }

    // Add guidance based on selection vs recommendation
    if (isSmallerThanRecommended) {
      lines.push(`⚠️ **Sizing tip:** You selected ${selectedSize} yards, which is smaller than our recommendation. This works if your project is small-scale, but you risk needing a second haul.`);
    } else if (!isRecommendedSelected && selectedSize > recommendedSize) {
      lines.push(`✓ **Good call:** Going larger than recommended gives you a safety buffer and avoids overflow fees.`);
    }

    // Weight reminder
    lines.push(`💡 **Weight matters:** Each size includes a tonnage allowance. Overages are billed at $85-$110/ton, so estimate weight carefully.`);

    return lines;
  };

  const explanationLines = getDetailedExplanation();

  return (
    <div className={cn("mt-3", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        <span>Why {recommendedSize} yards?</span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isExpanded && "rotate-180"
        )} />
      </button>
      
      {isExpanded && (
        <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2 text-sm text-foreground">
          {explanationLines.map((line, idx) => (
            <p key={idx} className="leading-relaxed" dangerouslySetInnerHTML={{ 
              __html: line
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/⚠️/g, '<span class="text-amber-600">⚠️</span>')
                .replace(/✓/g, '<span class="text-success">✓</span>')
                .replace(/💡/g, '<span>💡</span>')
            }} />
          ))}
          
          <div className="pt-2 border-t border-primary/10 mt-3">
            <a 
              href="/contractor-best-practices#materials" 
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              Learn more in our Contractor Best Practices guide →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
