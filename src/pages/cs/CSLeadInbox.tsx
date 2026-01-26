import { useState } from 'react';
import { useLeads, useLeadChannels, useLeadStats, updateLeadStatus, LeadFilters, Lead } from '@/hooks/useLeadHub';
import { formatPhoneDisplay } from '@/lib/phoneUtils';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Mail, MessageSquare, FileText, Search, Filter, Users, Clock, UserCheck, Inbox, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function CSLeadInbox() {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const { leads, loading, totalCount } = useLeads(filters, 'cs');
  const { channels } = useLeadChannels();
  const { stats } = useLeadStats('cs');

  const handleStatusChange = async () => {
    if (!selectedLead || !newStatus) return;
    
    const { success } = await updateLeadStatus(selectedLead.id, newStatus, statusNotes);
    if (success) {
      toast.success('Lead status updated');
      setStatusDialogOpen(false);
      setStatusNotes('');
    } else {
      toast.error('Failed to update status');
    }
  };

  const getChannelIcon = (channelKey: string | null) => {
    const channel = channels.find(c => c.channel_key === channelKey);
    return channel?.icon || '📋';
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            CS Lead Inbox
          </h1>
          <p className="text-muted-foreground">Existing customers & follow-ups</p>
        </div>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">New</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Existing Customers</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Follow-ups</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.contacted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, email, city..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                />
              </div>
            </div>
            <Select
              value={filters.channel_key || 'all'}
              onValueChange={(v) => setFilters(f => ({ ...f, channel_key: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {channels.filter(c => c.is_active).map(c => (
                  <SelectItem key={c.channel_key} value={c.channel_key}>
                    {c.icon} {c.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters(f => ({ ...f, status: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found matching your filters
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Ch</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="text-xl">
                      {getChannelIcon(lead.channel_key)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {lead.customer_name || 'Unknown'}
                        {lead.is_existing_customer && (
                          <Badge variant="outline" className="ml-2 text-xs bg-green-50">
                            Existing
                          </Badge>
                        )}
                      </div>
                      {lead.customer_phone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {formatPhoneDisplay(lead.customer_phone)}
                        </div>
                      )}
                      {lead.customer_email && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.customer_email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.city || lead.zip || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {lead.customer_type_detected || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.lead_status)}>
                        {lead.lead_status || 'new'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {lead.customer_phone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`tel:${lead.customer_phone}`)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedLead(lead);
                            setNewStatus(lead.lead_status || 'new');
                            setStatusDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Lead</label>
              <p className="text-muted-foreground">
                {selectedLead?.customer_name || 'Unknown'} • {selectedLead?.customer_phone || selectedLead?.customer_email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
