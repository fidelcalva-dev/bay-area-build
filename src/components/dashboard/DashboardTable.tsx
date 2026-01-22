import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DashboardTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  headerAction?: ReactNode;
  maxHeight?: number;
}

export function DashboardTable<T extends Record<string, unknown>>({
  title,
  subtitle,
  data,
  columns,
  className,
  loading = false,
  emptyMessage = 'No data available',
  headerAction,
  maxHeight,
}: DashboardTableProps<T>) {
  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-5 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isEmpty = !data || data.length === 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-8 text-center text-muted-foreground">{emptyMessage}</div>
        ) : (
          <div className={cn('overflow-auto', maxHeight && `max-h-[${maxHeight}px]`)} style={maxHeight ? { maxHeight } : undefined}>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={String(col.key)}
                      className={cn(
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
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell
                        key={String(col.key)}
                        className={cn(
                          col.className,
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center'
                        )}
                      >
                        {col.render ? col.render(row) : (row[col.key as keyof T] as ReactNode)}
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
