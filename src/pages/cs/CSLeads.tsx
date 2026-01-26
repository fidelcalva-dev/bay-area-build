import { useState } from 'react';
import { 
  Users, Phone, Mail, MessageSquare, Search, 
  Clock, CheckCircle2, Loader2, Building, User, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useLeadCapture, Lead, LeadFilters } from '@/hooks/useLeadCapture';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
  booked: { label: 'Booked', color: 'bg-green-100 text-green-800' },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-800' },
};

export default function CSLeads() {
  const [filters, setFilters] = useState<LeadFilters>({ assigned_team: 'cs' });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const { leads, stats, isLoading, updateLeadStatus } = useLeadCapture(filters);

  // Filter to show existing customers and CS-assigned leads
  const csLeads = leads.filter(lead => 
    lead.is_existing_customer || lead.assignment_type === 'cs'
  );

  if (isLoading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Service Leads</h1>
          <p className="text-muted-foreground">Existing customers and support requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{csLeads.length}</div>
            <p className="text-xs text-muted-foreground">Total Assigned</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-blue-600">
              {csLeads.filter(l => l.lead_status === 'new').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-yellow-600">
              {csLeads.filter(l => l.is_existing_customer).length}
            </div>
            <p className="text-xs text-muted-foreground">Existing Customers</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-green-600">
              {csLeads.filter(l => l.lead_status === 'converted' || l.lead_status === 'booked').length}
            </div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No leads assigned to CS
                  </TableCell>
                </TableRow>
              ) : (
                csLeads.map((lead) => {
                  const statusConfig = STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.new;

                  return (
                    <TableRow 
                      key={lead.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {lead.customer_name || '—'}
                            {lead.is_existing_customer && (
                              <Badge variant="secondary" className="text-xs">Existing</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.city || lead.zip ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {lead.city}{lead.city && lead.zip ? ', ' : ''}{lead.zip}
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{lead.customer_type_detected || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {lead.customer_phone && (
                            <>
                              <Button variant="ghost" size="icon" asChild>
                                <a href={`tel:${lead.customer_phone}`}>
                                  <Phone className="w-4 h-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon" asChild>
                                <a href={`sms:${lead.customer_phone}`}>
                                  <MessageSquare className="w-4 h-4" />
                                </a>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedLead.customer_name || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{selectedLead.customer_phone || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{selectedLead.customer_email || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p>{selectedLead.city}{selectedLead.zip ? `, ${selectedLead.zip}` : ''}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedLead.lead_status === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        updateLeadStatus(selectedLead.id, key);
                        setSelectedLead({ ...selectedLead, lead_status: key });
                      }}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
