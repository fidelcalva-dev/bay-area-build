import { cn } from '@/lib/utils';
import { USER_TYPES } from '@/components/quote/constants';

interface UserTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}

export function UserTypeSelector({ value, onChange }: UserTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {USER_TYPES.map((type) => {
        const isSelected = value === type.value;
        
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2",
              "text-sm font-medium transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <span className="text-base">{type.icon}</span>
            <span>{type.label}</span>
            {type.discount > 0 && isSelected && (
              <span className="text-[10px] bg-success text-success-foreground px-1.5 py-0.5 rounded-full font-bold">
                -{(type.discount * 100).toFixed(0)}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
