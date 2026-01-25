import { Check, X, Minus } from 'lucide-react';
import { COMPARISON_DATA } from '@/lib/categoryPositioning';
import { cn } from '@/lib/utils';

interface BrokerComparisonTableProps {
  className?: string;
}

export function BrokerComparisonTable({ className }: BrokerComparisonTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="text-left font-semibold text-foreground p-4 w-1/3">
              {COMPARISON_DATA.headers[0]}
            </th>
            <th className="text-left font-semibold text-muted-foreground p-4 w-1/3">
              {COMPARISON_DATA.headers[1]}
            </th>
            <th className="text-left font-semibold text-primary p-4 w-1/3 bg-primary/5">
              {COMPARISON_DATA.headers[2]}
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_DATA.rows.map((row, index) => (
            <tr 
              key={row.factor} 
              className={cn(
                "border-t border-border",
                index % 2 === 0 ? "bg-background" : "bg-muted/30"
              )}
            >
              <td className="p-4 font-medium text-foreground">
                {row.factor}
              </td>
              <td className="p-4 text-muted-foreground">
                {row.broker}
              </td>
              <td className="p-4 text-foreground bg-primary/5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  {row.localYard}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Simplified visual comparison for mobile
interface SimplifiedComparisonProps {
  className?: string;
}

export function SimplifiedComparison({ className }: SimplifiedComparisonProps) {
  const comparisons = [
    { label: 'Own fleet', broker: false, local: true },
    { label: 'Direct dispatch', broker: false, local: true },
    { label: 'ZIP-based pricing', broker: false, local: true },
    { label: 'Single point of contact', broker: false, local: true },
    { label: 'Real-time inventory', broker: false, local: true },
  ];

  return (
    <div className={cn("grid gap-3", className)}>
      {comparisons.map((item) => (
        <div key={item.label} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
          <span className="font-medium text-foreground">{item.label}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">Broker</span>
              {item.broker ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <X className="w-4 h-4 text-destructive" />
              )}
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="text-xs font-medium">Calsan</span>
              {item.local ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <X className="w-4 h-4 text-destructive" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
