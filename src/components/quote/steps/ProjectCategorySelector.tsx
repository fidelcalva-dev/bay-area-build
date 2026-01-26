// Project Category Selector - Smart step for quote funnel
// Shows relevant project categories based on customer type

import { Check, type LucideIcon } from 'lucide-react';
import { 
  Home, Hammer, HardHat, Wrench, TreePine, Building2, 
  Building, Recycle, Warehouse, Key, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectCategories, type ProjectCategory } from '@/hooks/useMaterialCatalog';
import { Skeleton } from '@/components/ui/skeleton';

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'home': Home,
  'hammer': Hammer,
  'hard-hat': HardHat,
  'wrench': Wrench,
  'tree-pine': TreePine,
  'building-2': Building2,
  'building': Building,
  'recycle': Recycle,
  'warehouse': Warehouse,
  'key': Key,
  'package': Package,
  // Add Lucide icon mappings for new homeowner categories
  'leaf': TreePine, // fallback for yard cleanup
};

interface ProjectCategorySelectorProps {
  value: string | null;
  onChange: (categoryCode: string) => void;
  customerType: string;
  isSpanish?: boolean;
}

export function ProjectCategorySelector({
  value,
  onChange,
  customerType,
  isSpanish = false,
}: ProjectCategorySelectorProps) {
  const { categories, isLoading, error } = useProjectCategories(customerType);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Failed to load project categories
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No project categories available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        {isSpanish ? '¿Qué tipo de proyecto?' : "What type of project?"}
      </label>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const isSelected = value === category.category_code;
          const IconComponent = CATEGORY_ICONS[category.icon] || Package;
          const displayName = isSpanish && category.display_name_es 
            ? category.display_name_es 
            : category.display_name;
          const description = isSpanish && category.description_es
            ? category.description_es
            : category.description;

          return (
            <button
              key={category.category_code}
              type="button"
              onClick={() => onChange(category.category_code)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-input bg-background hover:border-primary/50"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                "bg-muted/80 border border-border/50",
                isSelected && "bg-primary/10 border-primary/20"
              )}>
                <IconComponent 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isSelected ? "text-primary" : "text-foreground/70"
                  )}
                  strokeWidth={1.75}
                />
              </div>

              {/* Label */}
              <div className="font-medium text-foreground text-sm leading-tight">
                {displayName}
              </div>
              
              {/* Description (truncated) */}
              {description && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </div>
              )}

              {/* Selection checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectCategorySelector;
