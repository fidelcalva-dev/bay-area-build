import { useState } from 'react';
import { 
  Shield, AlertTriangle, Search, Loader2, RefreshCw, 
  Eye, UserPlus, UserMinus, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFraudFlags, FraudFilters } from '@/hooks/useFraudFlags';
import { useTrustedCustomers } from '@/hooks/useTrustedCustomers';
import { FraudFlagDetailDialog } from '@/components/fraud/FraudFlagDetailDialog';
import type { FraudFlag, FraudSeverity, FraudStatus } from '@/lib/fraudService';
import { addToWhitelist, removeFromWhitelist } from '@/lib/riskScoreService';
import { toast } from 'sonner';

export default function RiskReviewPage() {
  const [activeTab, setActiveTab] = useState('flags');
  const [filters, setFilters] = useState<FraudFilters>({
    status: 'open',
    severity: 'all',
    days: 7,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);
  const [showAddWhitelist, setShowAddWhitelist] = useState(false);
  const [whitelistForm, setWhitelistForm] = useState({ phone: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { flags, loading: flagsLoading, refetch: refetchFlags, stats: flagStats } = useFraudFlags(filters);
  const { customers: trustedCustomers, loading: trustedLoading, refetch: refetchTrusted, stats: trustedStats } = useTrustedCustomers();

  const filteredFlags = flags.filter((flag) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      flag.phone?.includes(search) ||
      flag.reason.toLowerCase().includes(search) ||
      flag.flag_type.toLowerCase().includes(search)
    );
  });

  const filteredTrusted = trustedCustomers.filter((c) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      c.phone?.includes(search) ||
      c.reason.toLowerCase().includes(search)
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

  const getRiskScoreBadge = (score?: number) => {
    if (score === undefined || score === null) return null;
    let color = 'bg-green-100 text-green-800';
    if (score >= 60) color = 'bg-red-100 text-red-800';
    else if (score >= 30) color = 'bg-orange-100 text-orange-800';
    return <Badge className={color}>{score}</Badge>;
  };

  const getFlagTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      velocity_phone: 'Velocity',
      multi_address: 'Multi-Address',
      out_of_range: 'Out of Range',
      identity_mismatch: 'ID Mismatch',
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

  const handleAddWhitelist = async () => {
    if (!whitelistForm.phone || !whitelistForm.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addToWhitelist({
        phone: whitelistForm.phone,
        reason: whitelistForm.reason,
      });

      if (result.success) {
        toast.success('Added to whitelist');
        setShowAddWhitelist(false);
        setWhitelistForm({ phone: '', reason: '' });
        refetchTrusted();
      } else {
        toast.error(result.error || 'Failed to add');
      }
    } catch (err) {
      toast.error('Failed to add to whitelist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveWhitelist = async (id: string) => {
    const result = await removeFromWhitelist(id);
    if (result.success) {
      toast.success('Removed from whitelist');
      refetchTrusted();
    } else {
      toast.error(result.error || 'Failed to remove');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Risk Review
          </h1>
          <p className="text-muted-foreground">Manage fraud flags and trusted customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddWhitelist(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add to Whitelist
          </Button>
          <Button 
            variant="outline" 
            onClick={() => { refetchFlags(); refetchTrusted(); }} 
            disabled={flagsLoading || trustedLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(flagsLoading || trustedLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className={flagStats.high > 0 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{flagStats.high}</p>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card className={flagStats.medium > 0 ? 'border-orange-200 bg-orange-50/50' : ''}>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{flagStats.medium}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{flagStats.low}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{flagStats.open}</p>
              <p className="text-xs text-muted-foreground">Open Flags</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{trustedStats.active}</p>
              <p className="text-xs text-muted-foreground">Whitelisted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{flagStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Flags</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="flags" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Fraud Flags
          </TabsTrigger>
          <TabsTrigger value="whitelist" className="gap-2">
            <Users className="w-4 h-4" />
            Whitelist
          </TabsTrigger>
        </TabsList>

        {/* Search and filters */}
        <Card className="mt-4">
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
              {activeTab === 'flags' && (
                <>
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
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <TabsContent value="flags" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Fraud Flags ({filteredFlags.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flagsLoading ? (
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
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Score</th>
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
                            {getRiskScoreBadge((flag as unknown as { risk_score?: number }).risk_score)}
                            {(flag as unknown as { is_whitelisted?: boolean }).is_whitelisted && (
                              <Badge variant="outline" className="ml-1 text-green-600 border-green-200">WL</Badge>
                            )}
                          </td>
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
        </TabsContent>

        <TabsContent value="whitelist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Trusted Customers ({filteredTrusted.filter(c => c.status === 'active').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trustedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredTrusted.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No trusted customers found</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowAddWhitelist(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First Trusted Customer
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Phone</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Reason</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Added</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrusted.map((customer) => (
                        <tr key={customer.id} className="border-b last:border-b-0 hover:bg-muted/50">
                          <td className="py-3 px-2 font-mono text-sm">
                            {customer.phone || '—'}
                          </td>
                          <td className="py-3 px-2 text-sm max-w-xs truncate">
                            {customer.reason}
                          </td>
                          <td className="py-3 px-2">
                            {customer.status === 'active' ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {formatDate(customer.created_at)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            {customer.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveWhitelist(customer.id)}
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      {selectedFlag && (
        <FraudFlagDetailDialog
          open={!!selectedFlag}
          onOpenChange={(open) => !open && setSelectedFlag(null)}
          flag={selectedFlag}
          onSuccess={() => {
            setSelectedFlag(null);
            refetchFlags();
            refetchTrusted();
          }}
        />
      )}

      {/* Add Whitelist Dialog */}
      <Dialog open={showAddWhitelist} onOpenChange={setShowAddWhitelist}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Whitelist</DialogTitle>
            <DialogDescription>
              Add a trusted customer to reduce false positive fraud flags
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={whitelistForm.phone}
                onChange={(e) => setWhitelistForm({ ...whitelistForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="E.g., Repeat contractor, verified identity..."
                value={whitelistForm.reason}
                onChange={(e) => setWhitelistForm({ ...whitelistForm, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWhitelist(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWhitelist} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add to Whitelist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
