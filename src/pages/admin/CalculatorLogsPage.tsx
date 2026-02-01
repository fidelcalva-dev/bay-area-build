// Calculator Audit Logs Page for Admin

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ClipboardList, Search, Filter, Eye, Download, Calculator, Percent, AlertTriangle } from 'lucide-react';
import { getCalculatorLogs } from '@/services/calculatorService';
import type { CalculatorLog } from '@/types/calculator';

const ACTION_TYPE_COLORS: Record<string, string> = {
  CALCULATE: 'bg-blue-100 text-blue-700',
  APPLY_DISCOUNT: 'bg-amber-100 text-amber-700',
  OVERRIDE: 'bg-purple-100 text-purple-700',
  CONVERT_TO_QUOTE: 'bg-green-100 text-green-700',
  CONVERT_TO_ORDER: 'bg-emerald-100 text-emerald-700',
};

export default function CalculatorLogsPage() {
  const [filters, setFilters] = useState({
    actionType: '',
    search: '',
  });

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['calculator-logs', filters],
    queryFn: () => getCalculatorLogs({
      actionType: filters.actionType || undefined,
    }),
    staleTime: 30 * 1000,
  });

  const filteredLogs = logs.filter(log => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const inputs = log.inputs_json;
      return (
        inputs?.market_code?.toLowerCase().includes(searchLower) ||
        inputs?.destination_address?.toLowerCase().includes(searchLower) ||
        log.user_role?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Calculator Audit Logs
          </h1>
          <p className="text-muted-foreground">
            Track all calculator usage, discounts, and overrides
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by market, address, or role..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filters.actionType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="CALCULATE">Calculate</SelectItem>
                <SelectItem value="APPLY_DISCOUNT">Apply Discount</SelectItem>
                <SelectItem value="OVERRIDE">Override</SelectItem>
                <SelectItem value="CONVERT_TO_QUOTE">Convert to Quote</SelectItem>
                <SelectItem value="CONVERT_TO_ORDER">Convert to Order</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.filter(l => l.action_type === 'CALCULATE').length}</p>
                <p className="text-sm text-muted-foreground">Calculations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Percent className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.filter(l => l.action_type === 'APPLY_DISCOUNT').length}</p>
                <p className="text-sm text-muted-foreground">Discounts Applied</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.filter(l => l.action_type === 'OVERRIDE').length}</p>
                <p className="text-sm text-muted-foreground">Overrides</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.filter(l => l.action_type.includes('CONVERT')).length}</p>
                <p className="text-sm text-muted-foreground">Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No logs found matching your filters
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${ACTION_TYPE_COLORS[log.action_type] || 'bg-gray-100 text-gray-700'} border-0`}>
                        {log.action_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{log.user_role || 'Unknown'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.inputs_json?.market_code || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{log.inputs_json?.service_type}</p>
                        <p className="text-muted-foreground">{log.inputs_json?.dumpster_size}yd</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.discount_applied ? (
                        <Badge variant="outline" className="text-amber-600">
                          {log.discount_applied.type === 'PERCENTAGE' 
                            ? `${log.discount_applied.value}%` 
                            : `$${log.discount_applied.value}`}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <LogDetailDialog log={log} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LogDetailDialog({ log }: { log: CalculatorLog }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Inputs</h4>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                {JSON.stringify(log.inputs_json, null, 2)}
              </pre>
            </div>
            {log.outputs_json && (
              <div>
                <h4 className="font-medium mb-2">Outputs</h4>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                  {JSON.stringify(log.outputs_json, null, 2)}
                </pre>
              </div>
            )}
            {log.discount_applied && (
              <div>
                <h4 className="font-medium mb-2">Discount Applied</h4>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                  {JSON.stringify(log.discount_applied, null, 2)}
                </pre>
              </div>
            )}
            {log.override_details && (
              <div>
                <h4 className="font-medium mb-2">Override Details</h4>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                  {JSON.stringify(log.override_details, null, 2)}
                </pre>
              </div>
            )}
            {log.notes && (
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm bg-muted p-3 rounded-lg">{log.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
