/**
 * Admin Disposal Search — Phase 5
 * Search for transfer stations / recycling facilities and add them to disposal_sites
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Plus, MapPin, Star, Phone, Clock,
  Building2, Filter, CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  getDisposalSites,
  createDisposalSite,
  createDisposalRate,
  getDisposalRates,
  getMaterialWeights,
} from '@/services/disposalCostEngine';
import type { DisposalSite, DisposalRate, MaterialWeightReference } from '@/types/disposal';

const SITE_TYPES = [
  { value: 'transfer_station', label: 'Transfer Station' },
  { value: 'recycling', label: 'Recycling Center' },
  { value: 'landfill', label: 'Landfill' },
  { value: 'composting', label: 'Composting Facility' },
];

export default function DisposalSearchPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState<DisposalSite | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Form state
  const [siteForm, setSiteForm] = useState({
    name: '',
    type: 'transfer_station' as DisposalSite['type'],
    address: '',
    city: '',
    state: 'CA',
    zip: '',
    lat: 0,
    lng: 0,
    materials_accepted: [] as string[],
    is_active: true,
    compliance_rating: 3,
    typical_wait_time_min: 20,
    ticket_required: true,
    phone: '',
    hours: '',
    notes: '',
  });

  const [rateForm, setRateForm] = useState({
    material_type: '',
    price_per_ton: '',
    flat_fee: '',
    minimum_fee: '',
    source: 'manual' as DisposalRate['source'],
    notes: '',
  });

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['disposal-sites'],
    queryFn: getDisposalSites,
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['material-weights'],
    queryFn: getMaterialWeights,
  });

  const addSiteMutation = useMutation({
    mutationFn: (site: typeof siteForm) => createDisposalSite(site),
    onSuccess: (data) => {
      if (data) {
        toast({ title: 'Site Added', description: `${data.name} added to disposal sites.` });
        queryClient.invalidateQueries({ queryKey: ['disposal-sites'] });
        setShowAddDialog(false);
      }
    },
    onError: () => toast({ title: 'Error', description: 'Failed to add site.', variant: 'destructive' }),
  });

  const addRateMutation = useMutation({
    mutationFn: (rate: Parameters<typeof createDisposalRate>[0]) => createDisposalRate(rate),
    onSuccess: (data) => {
      if (data) {
        toast({ title: 'Rate Added', description: 'Disposal rate saved.' });
        setShowRateDialog(false);
      }
    },
    onError: () => toast({ title: 'Error', description: 'Failed to add rate.', variant: 'destructive' }),
  });

  const filteredSites = sites.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleAddSite = () => {
    addSiteMutation.mutate(siteForm);
  };

  const handleAddRate = () => {
    if (!selectedSite) return;
    addRateMutation.mutate({
      disposal_site_id: selectedSite.id,
      material_type: rateForm.material_type,
      price_per_ton: rateForm.price_per_ton ? Number(rateForm.price_per_ton) : null,
      flat_fee: rateForm.flat_fee ? Number(rateForm.flat_fee) : null,
      minimum_fee: rateForm.minimum_fee ? Number(rateForm.minimum_fee) : null,
      source: rateForm.source,
      notes: rateForm.notes || null,
      is_active: true,
      last_verified_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Disposal Site Management</h1>
        <p className="text-muted-foreground">
          Search, add, and manage disposal facilities. Rates must be entered manually.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {SITE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Site
        </Button>
      </div>

      {/* Sites Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Wait</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredSites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No disposal sites found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {site.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {site.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{site.city}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        {site.compliance_rating}/5
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {site.typical_wait_time_min}m
                      </div>
                    </TableCell>
                    <TableCell>
                      {site.ticket_required ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSite(site);
                          setShowRateDialog(true);
                        }}
                      >
                        Add Rate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Site Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Disposal Site</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Name</Label>
                <Input
                  value={siteForm.name}
                  onChange={(e) => setSiteForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Blue Certified Recycling"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={siteForm.type}
                  onValueChange={(v) => setSiteForm((f) => ({ ...f, type: v as DisposalSite['type'] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SITE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Compliance Rating</Label>
                <Select
                  value={String(siteForm.compliance_rating)}
                  onValueChange={(v) => setSiteForm((f) => ({ ...f, compliance_rating: Number(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}/5</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input
                  value={siteForm.address}
                  onChange={(e) => setSiteForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={siteForm.city}
                  onChange={(e) => setSiteForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div>
                <Label>ZIP</Label>
                <Input
                  value={siteForm.zip}
                  onChange={(e) => setSiteForm((f) => ({ ...f, zip: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={siteForm.phone}
                  onChange={(e) => setSiteForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Typical Wait (min)</Label>
                <Input
                  type="number"
                  value={siteForm.typical_wait_time_min}
                  onChange={(e) => setSiteForm((f) => ({ ...f, typical_wait_time_min: Number(e.target.value) }))}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  checked={siteForm.ticket_required}
                  onCheckedChange={(c) => setSiteForm((f) => ({ ...f, ticket_required: c }))}
                />
                <Label>Dump Ticket Required</Label>
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={siteForm.notes}
                  onChange={(e) => setSiteForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddSite} disabled={!siteForm.name || !siteForm.address || !siteForm.city}>
              Add Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rate Dialog */}
      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Disposal Rate — {selectedSite?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Material Type</Label>
              <Select
                value={rateForm.material_type}
                onValueChange={(v) => setRateForm((f) => ({ ...f, material_type: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.material_name}>{m.material_name}</SelectItem>
                  ))}
                  <SelectItem value="General">General / Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price per Ton ($)</Label>
                <Input
                  type="number"
                  value={rateForm.price_per_ton}
                  onChange={(e) => setRateForm((f) => ({ ...f, price_per_ton: e.target.value }))}
                  placeholder="115.00"
                />
              </div>
              <div>
                <Label>Flat Fee ($)</Label>
                <Input
                  type="number"
                  value={rateForm.flat_fee}
                  onChange={(e) => setRateForm((f) => ({ ...f, flat_fee: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label>Minimum Fee ($)</Label>
              <Input
                type="number"
                value={rateForm.minimum_fee}
                onChange={(e) => setRateForm((f) => ({ ...f, minimum_fee: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Source</Label>
              <Select
                value={rateForm.source}
                onValueChange={(v) => setRateForm((f) => ({ ...f, source: v as DisposalRate['source'] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="phone">Phone Verification</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={rateForm.notes}
                onChange={(e) => setRateForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. Verified Jan 2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRateDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRate} disabled={!rateForm.material_type}>
              Save Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
