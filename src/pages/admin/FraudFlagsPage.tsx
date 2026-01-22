import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, AlertTriangle, Search, Filter, Loader2, 
  RefreshCw, Eye, CheckCircle, Ban, DollarSign, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFraudFlags, FraudFilters } from '@/hooks/useFraudFlags';
import { FraudFlagDetailDialog } from '@/components/fraud/FraudFlagDetailDialog';
import type { FraudFlag, FraudSeverity, FraudStatus } from '@/lib/fraudService';

export default function FraudFlagsPage() {
  const [filters, setFilters] = useState<FraudFilters>({
    status: 'open',
    severity: 'all',
    days: 7,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);

  const { flags, loading, refetch, stats } = useFraudFlags(filters);

  const filteredFlags = flags.filter((flag) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      flag.phone?.includes(search) ||
      flag.reason.toLowerCase().includes(search) ||
      flag.flag_type.toLowerCase().includes(search)
    );
  });

  const getSeverityBadge = (severity: FraudSeverity) => {
    const variants: Record<FraudSeverity, string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return <Badge className={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: FraudStatus) => {
    const variants: Record<FraudStatus, string> = {
      open: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getFlagTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      velocity_phone: 'Velocity (Phone)',
      multi_address: 'Multiple Addresses',
      out_of_range: 'Out of Range',
      identity_mismatch: 'Identity Mismatch',
      high_risk_combo: 'High Risk Combo',
    };
    return labels[type] || type;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Fraud Flags
          </h1>
          <p className="text-muted-foreground">Review and manage fraud detection flags</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.open}</p>
              <p className="text-xs text-muted-foreground">Open Flags</p>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.high > 0 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.high}</p>
              <p className="text-xs text-muted-foreground">High Severity</p>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.medium > 0 ? 'border-orange-200 bg-orange-50/50' : ''}>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.medium}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.low}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total (Period)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters({ ...filters, status: v as FraudStatus | 'all' })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.severity || 'all'}
              onValueChange={(v) => setFilters({ ...filters, severity: v as FraudSeverity | 'all' })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(filters.days || 7)}
              onValueChange={(v) => setFilters({ ...filters, days: parseInt(v) })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24h</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Fraud Flags ({filteredFlags.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredFlags.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No fraud flags found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Severity</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Phone</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Reason</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlags.map((flag) => (
                    <tr
                      key={flag.id}
                      className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedFlag(flag)}
                    >
                      <td className="py-3 px-2">
                        {getSeverityBadge(flag.severity)}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {getFlagTypeLabel(flag.flag_type)}
                      </td>
                      <td className="py-3 px-2 font-mono text-sm">
                        {flag.phone || '—'}
                      </td>
                      <td className="py-3 px-2 text-sm max-w-xs truncate">
                        {flag.reason}
                      </td>
                      <td className="py-3 px-2">
                        {getStatusBadge(flag.status)}
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {formatDate(flag.created_at)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFlag(flag);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedFlag && (
        <FraudFlagDetailDialog
          open={!!selectedFlag}
          onOpenChange={(open) => !open && setSelectedFlag(null)}
          flag={selectedFlag}
          onSuccess={() => {
            setSelectedFlag(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
