import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface DashboardFilterValues {
  startDate: Date;
  endDate: Date;
  yardId?: string;
  customerType?: string;
}

interface DashboardFiltersProps {
  filters: DashboardFilterValues;
  onFiltersChange: (filters: DashboardFilterValues) => void;
  yards?: { id: string; name: string }[];
  showYardFilter?: boolean;
  showCustomerTypeFilter?: boolean;
  onExport?: () => void;
  exporting?: boolean;
}

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This Month', preset: 'this_month' },
  { label: 'Last Month', preset: 'last_month' },
  { label: 'Last 90 days', days: 90 },
];

export function DashboardFilters({
  filters,
  onFiltersChange,
  yards = [],
  showYardFilter = false,
  showCustomerTypeFilter = false,
  onExport,
  exporting = false,
}: DashboardFiltersProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (preset.preset === 'this_month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (preset.preset === 'last_month') {
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
    } else {
      start = subDays(now, preset.days || 0);
    }

    onFiltersChange({ ...filters, startDate: start, endDate: end });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
      {/* Date Range Presets */}
      <div className="flex items-center gap-1">
        {PRESETS.slice(0, 4).map((preset) => (
          <Button
            key={preset.label}
            variant="ghost"
            size="sm"
            onClick={() => applyPreset(preset)}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Custom Date Range */}
      <div className="flex items-center gap-2">
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn('w-[130px] justify-start text-left font-normal')}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(filters.startDate, 'MMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => {
                if (date) {
                  onFiltersChange({ ...filters, startDate: date });
                  setStartOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">to</span>

        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn('w-[130px] justify-start text-left font-normal')}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(filters.endDate, 'MMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => {
                if (date) {
                  onFiltersChange({ ...filters, endDate: date });
                  setEndOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Optional Filters */}
      {showYardFilter && yards.length > 0 && (
        <>
          <div className="h-6 w-px bg-border" />
          <Select
            value={filters.yardId || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, yardId: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Yards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Yards</SelectItem>
              {yards.map((yard) => (
                <SelectItem key={yard.id} value={yard.id}>{yard.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {showCustomerTypeFilter && (
        <>
          <div className="h-6 w-px bg-border" />
          <Select
            value={filters.customerType || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, customerType: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="homeowner">Homeowner</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      {/* Export Button */}
      {onExport && (
        <>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </>
      )}
    </div>
  );
}
