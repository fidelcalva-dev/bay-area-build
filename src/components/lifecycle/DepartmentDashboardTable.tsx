import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DepartmentBadge, SlaBadge, type SlaStatus } from './LifecycleBadges';
import { formatDuration, getLiveDurationMinutes } from '@/lib/lifecycleService';

// ============================================
// STANDARDIZED DEPARTMENT DASHBOARD TABLE
// Same pattern across Sales, Billing, Dispatch, Driver
// ============================================

export interface DashboardFilter {
  key: string;
  label: string;
  count?: number;
}

export interface DashboardColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: (entityId: string) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

interface DepartmentDashboardTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: DashboardColumn<T>[];
  filters: DashboardFilter[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  headerAction?: React.ReactNode;
  className?: string;
  getRowId?: (row: T) => string;
}

export function DepartmentDashboardTable<T>({
  title,
  subtitle,
  data,
  columns,
  filters,
  activeFilter,
  onFilterChange,
  searchValue = '',
  onSearchChange,
  loading = false,
  emptyMessage = 'No items in this view',
  headerAction,
  className,
}: DepartmentDashboardTableProps<T>) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border bg-card', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {onSearchChange && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-8 h-9 w-48 text-sm"
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => onFilterChange(filter.key)}
            >
              {filter.label}
              {filter.count !== undefined && (
                <Badge
                  variant={activeFilter === filter.key ? 'secondary' : 'outline'}
                  className="ml-1.5 h-4 px-1 text-[10px] min-w-[18px] justify-center"
                >
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        'text-xs font-medium uppercase tracking-wide text-muted-foreground',
                        col.className,
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          'py-2.5 text-sm',
                          col.className,
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center'
                        )}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Helper components for dashboard columns ---

export function TimeInStageCell({ enteredAt }: { enteredAt: string }) {
  const mins = getLiveDurationMinutes(enteredAt);
  const isLong = mins > 720; // 12h
  return (
    <span className={cn('text-xs tabular-nums', isLong && 'text-destructive font-medium')}>
      {formatDuration(mins)}
    </span>
  );
}

export function SlaCell({ enteredAt, slaMinutes }: { enteredAt: string; slaMinutes: number | null }) {
  if (!slaMinutes) return <span className="text-xs text-muted-foreground">--</span>;
  const elapsed = getLiveDurationMinutes(enteredAt);
  let status: SlaStatus = 'on_track';
  if (elapsed > slaMinutes) status = 'breached';
  else if (elapsed > slaMinutes * 0.75) status = 'at_risk';
  return <SlaBadge status={status} />;
}
