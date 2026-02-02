import { useState } from 'react';
import { 
  Users, Phone, Mail, MessageSquare, Search, Filter, 
  Download, Sparkles, Clock, CheckCircle2, XCircle, 
  TrendingUp, Loader2, Building, User, MapPin, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useLeadCapture, Lead, LeadFilters } from '@/hooks/useLeadCapture';
import { AICloseAssistPanel } from '@/components/sales/AICloseAssistPanel';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', icon: Phone },
  qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
  booked: { label: 'Booked', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-800', icon: XCircle },
  unresponsive: { label: 'Unresponsive', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const CUSTOMER_TYPE_ICONS: Record<string, typeof User> = {
  homeowner: User,
  contractor: Building,
  commercial: Building,
  unknown: User,
};

export default function LeadInbox() {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const { 
    leads, 
    sources, 
    stats, 
    isLoading, 
    updateLeadStatus, 
    classifyWithAI,
    exportLeads 
  } = useLeadCapture(filters);

  const handleExport = async (format: 'csv' | 'word') => {
    await exportLeads(format, filters);
    setExportDialogOpen(false);
  };

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
          <h1 className="text-2xl font-bold">Lead Inbox</h1>
          <p className="text-muted-foreground">Capture, qualify, and convert leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
            <p className="text-xs text-muted-foreground">Contacted</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-purple-600">{stats.qualified}</div>
            <p className="text-xs text-muted-foreground">Qualified</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            <p className="text-xs text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
            <p className="text-xs text-muted-foreground">Lost</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
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
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={filters.source_key || 'all'} 
          onValueChange={(v) => setFilters({ ...filters, source_key: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source.source_key} value={source.source_key}>
                {source.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={filters.customer_type || 'all'} 
          onValueChange={(v) => setFilters({ ...filters, customer_type: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="homeowner">Homeowner</SelectItem>
            <SelectItem value="contractor">Contractor</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
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
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const statusConfig = STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.new;
                  const StatusIcon = statusConfig.icon;
                  const CustomerTypeIcon = CUSTOMER_TYPE_ICONS[lead.customer_type_detected || 'unknown'];

                  return (
                    <TableRow 
                      key={lead.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                            <CustomerTypeIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{lead.customer_name || '—'}</p>
                            {lead.customer_phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {lead.customer_phone}
                              </p>
                            )}
                            {lead.customer_email && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {lead.customer_email}
                              </p>
                            )}
                          </div>
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
                        <Badge variant="outline" className="text-xs">
                          {lead.source_key || lead.lead_source || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{lead.customer_type_detected || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {lead.customer_phone && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`tel:${lead.customer_phone}`}>
                                <Phone className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {lead.customer_phone && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`sms:${lead.customer_phone}`}>
                                <MessageSquare className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => classifyWithAI(lead.id)}
                            title="Classify with AI"
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
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

      {/* Lead Detail Dialog with AI Assist */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Lead Details
              {selectedLead && (
                <Badge variant="outline" className="ml-2">
                  {selectedLead.lead_status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <ScrollArea className="max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pr-4">
                {/* Left Column - Lead Info */}
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
                      <label className="text-sm font-medium text-muted-foreground">Company</label>
                      <p>{selectedLead.company_name || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p>{selectedLead.city}{selectedLead.city && selectedLead.zip ? ', ' : ''}{selectedLead.zip || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Source</label>
                      <p>{selectedLead.source_key || selectedLead.lead_source || '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Customer Type</label>
                      <p className="capitalize">{selectedLead.customer_type_detected || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Project Category</label>
                      <p className="capitalize">{selectedLead.project_category || '—'}</p>
                    </div>
                  </div>

                  {selectedLead.notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      <p className="text-sm whitespace-pre-wrap bg-muted p-2 rounded">{selectedLead.notes}</p>
                    </div>
                  )}

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

                {/* Right Column - AI Close Assist */}
                <div>
                  <AICloseAssistPanel
                    leadId={selectedLead.id}
                    entityType="LEAD"
                    entityId={selectedLead.id}
                    leadData={{
                      customer_name: selectedLead.customer_name || undefined,
                      customer_phone: selectedLead.customer_phone || undefined,
                      customer_email: selectedLead.customer_email || undefined,
                      zip: selectedLead.zip || undefined,
                      city: selectedLead.city || undefined,
                      source_key: selectedLead.source_key || undefined,
                      notes: selectedLead.notes || undefined,
                    }}
                    userRole="sales"
                  />
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
            {selectedLead?.customer_phone && (
              <Button asChild>
                <a href={`tel:${selectedLead.customer_phone}`}>
                  <Phone className="w-4 h-4 mr-2" /> Call Lead
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Leads</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Export {leads.length} leads based on current filters.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" /> Download CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('word')}>
                <Download className="w-4 h-4 mr-2" /> Download Word
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
