/**
 * Facilities Manager - Admin page for managing disposal facilities
 * Includes CSV bulk import for city-certified facility lists
 */
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, Plus, Upload, Search, Filter, CheckCircle, 
  AlertCircle, MapPin, Phone, Clock, FileSpreadsheet,
  RefreshCw, ExternalLink, Trash2, Edit, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getCertifiedSources, 
  upsertCertifiedSource,
  bulkImportFacilities,
  CERTIFICATION_LABELS,
  type CertifiedSource,
  type CertifiedFacility,
  type FacilityCSVRow
} from '@/lib/certifiedFacilityService';
import { getFacilities, type Facility, FACILITY_TYPE_LABELS, type FacilityType } from '@/lib/facilityService';

export default function FacilitiesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [certFilter, setCertFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [importData, setImportData] = useState<FacilityCSVRow[]>([]);
  const [importing, setImporting] = useState(false);
  
  // Form state for new/edit facility
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: 'CA',
    zip: '',
    facility_type: 'transfer_station' as FacilityType,
    certification_type: 'unknown',
    certification_city: '',
    accepted_material_classes: [] as string[],
    green_halo_related: false,
    phone: '',
    hours: '',
    notes: '',
    status: 'active',
  });

  // Fetch facilities
  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as CertifiedFacility[];
    },
  });

  // Fetch certified sources
  const { data: sources = [] } = useQuery({
    queryKey: ['certified-sources'],
    queryFn: getCertifiedSources,
  });

  // Get unique cities for filter
  const cities = [...new Set(facilities.map(f => f.city))].sort();

  // Filter facilities
  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = !search || 
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.address.toLowerCase().includes(search.toLowerCase()) ||
      f.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === 'all' || f.city === cityFilter;
    const matchesCert = certFilter === 'all' || f.certification_type === certFilter;
    return matchesSearch && matchesCity && matchesCert;
  });

  // Save facility mutation
  const saveFacility = useMutation({
    mutationFn: async (data: typeof form & { id?: string }) => {
      const { error } = await supabase
        .from('facilities')
        .upsert({
          id: data.id,
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          facility_type: data.facility_type,
          certification_type: data.certification_type,
          certification_city: data.certification_city || null,
          accepted_material_classes: data.accepted_material_classes.length > 0 
            ? data.accepted_material_classes 
            : ['MIXED_GENERAL'],
          green_halo_related: data.green_halo_related,
          phone: data.phone || null,
          hours: data.hours || null,
          notes: data.notes || null,
          status: data.status,
        }, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities-admin'] });
      setShowAddDialog(false);
      setSelectedFacility(null);
      resetForm();
      toast({ title: 'Facility saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error saving facility', description: error.message, variant: 'destructive' });
    },
  });

  // Delete facility mutation
  const deleteFacility = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('facilities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities-admin'] });
      toast({ title: 'Facility deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting facility', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setForm({
      name: '',
      address: '',
      city: '',
      state: 'CA',
      zip: '',
      facility_type: 'transfer_station',
      certification_type: 'unknown',
      certification_city: '',
      accepted_material_classes: [],
      green_halo_related: false,
      phone: '',
      hours: '',
      notes: '',
      status: 'active',
    });
  };

  const handleEdit = (facility: CertifiedFacility) => {
    setSelectedFacility(facility);
    setForm({
      name: facility.name,
      address: facility.address,
      city: facility.city,
      state: facility.state,
      zip: facility.zip,
      facility_type: facility.facility_type as FacilityType,
      certification_type: facility.certification_type || 'unknown',
      certification_city: facility.certification_city || '',
      accepted_material_classes: facility.accepted_material_classes || [],
      green_halo_related: facility.green_halo_related || false,
      phone: facility.phone || '',
      hours: facility.hours || '',
      notes: facility.notes || '',
      status: facility.status,
    });
    setShowAddDialog(true);
  };

  // CSV Import handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
      
      const rows: FacilityCSVRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        
        if (row.name && row.address) {
          rows.push({
            name: row.name,
            address: row.address,
            city: row.city || '',
            state: row.state,
            zip: row.zip || '',
            certification_type: row.certification_type,
            certification_city: row.certification_city,
            facility_type: row.facility_type,
            accepted_materials: row.accepted_materials,
            green_halo_related: row.green_halo_related,
            phone: row.phone,
            hours: row.hours,
            notes: row.notes,
          });
        }
      }
      
      setImportData(rows);
      setShowImportDialog(true);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await bulkImportFacilities(importData);
      
      if (result.success) {
        toast({ 
          title: 'Import Complete', 
          description: `Successfully imported ${result.imported} facilities` 
        });
      } else {
        toast({ 
          title: 'Import Completed with Errors',
          description: `Imported ${result.imported} facilities. ${result.errors.length} errors.`,
          variant: 'destructive'
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['facilities-admin'] });
      setShowImportDialog(false);
      setImportData([]);
    } catch (error) {
      toast({ 
        title: 'Import Failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const getCertBadgeColor = (type: string | null) => {
    switch (type) {
      case 'city_certified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'city_approved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'authorized':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Facilities Manager</h1>
          <p className="text-muted-foreground">
            Manage disposal facilities and city-certified recycling locations
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={() => setShowSourceDialog(true)}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Sources
          </Button>
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Facility
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{facilities.length}</div>
            <div className="text-sm text-muted-foreground">Total Facilities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {facilities.filter(f => f.certification_type === 'city_certified').length}
            </div>
            <div className="text-sm text-muted-foreground">City-Certified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {facilities.filter(f => f.green_halo_related).length}
            </div>
            <div className="text-sm text-muted-foreground">Green Halo Related</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{cities.length}</div>
            <div className="text-sm text-muted-foreground">Cities Covered</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={certFilter} onValueChange={setCertFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Certification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="city_certified">City-Certified</SelectItem>
                <SelectItem value="city_approved">City-Approved</SelectItem>
                <SelectItem value="authorized">Authorized</SelectItem>
                <SelectItem value="unknown">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Facilities Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Certification</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading facilities...
                  </TableCell>
                </TableRow>
              ) : filteredFacilities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No facilities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFacilities.map((facility) => (
                  <TableRow key={facility.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {facility.name}
                          {facility.green_halo_related && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                              GH
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {facility.address}, {facility.city}
                        </div>
                        {facility.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {facility.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {FACILITY_TYPE_LABELS[facility.facility_type as FacilityType] || facility.facility_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCertBadgeColor(facility.certification_type)}>
                        {CERTIFICATION_LABELS[facility.certification_type as keyof typeof CERTIFICATION_LABELS] || 'Standard'}
                      </Badge>
                      {facility.certification_city && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {facility.certification_city}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{facility.city}</TableCell>
                    <TableCell>
                      {facility.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(facility)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteFacility.mutate(facility.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedFacility ? 'Edit Facility' : 'Add New Facility'}
            </DialogTitle>
            <DialogDescription>
              Enter facility details. City-certified facilities will appear in compliance recommendations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facility Name *</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Zanker Road Landfill"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(408) 555-1234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <Input 
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input 
                  value={form.city} 
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="San Jose"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input 
                  value={form.state} 
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="CA"
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP *</Label>
                <Input 
                  value={form.zip} 
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  placeholder="95112"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facility Type</Label>
                <Select 
                  value={form.facility_type} 
                  onValueChange={(v) => setForm({ ...form, facility_type: v as FacilityType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FACILITY_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Certification Type</Label>
                <Select 
                  value={form.certification_type} 
                  onValueChange={(v) => setForm({ ...form, certification_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city_certified">City-Certified</SelectItem>
                    <SelectItem value="city_approved">City-Approved</SelectItem>
                    <SelectItem value="authorized">Authorized</SelectItem>
                    <SelectItem value="unknown">Standard / Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certification City</Label>
                <Input 
                  value={form.certification_city} 
                  onChange={(e) => setForm({ ...form, certification_city: e.target.value })}
                  placeholder="e.g., San Jose, Oakland"
                />
              </div>
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input 
                  value={form.hours} 
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="Mon-Sat 7am-5pm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.green_halo_related}
                onCheckedChange={(v) => setForm({ ...form, green_halo_related: v })}
              />
              <Label>Green Halo Related (Oakland WRRP)</Label>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes about this facility..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveFacility.mutate({ ...form, id: selectedFacility?.id })}
              disabled={!form.name || !form.address || !form.city || !form.zip || saveFacility.isPending}
            >
              {saveFacility.isPending ? 'Saving...' : 'Save Facility'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Preview Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
            <DialogDescription>
              {importData.length} facilities found. Review before importing.
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Certification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importData.slice(0, 20).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-sm">{row.address}</TableCell>
                    <TableCell>{row.city}</TableCell>
                    <TableCell>
                      <Badge className={getCertBadgeColor(row.certification_type || null)}>
                        {row.certification_type || 'unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {importData.length > 20 && (
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                ...and {importData.length - 20} more
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {importData.length} Facilities
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sources Dialog */}
      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certified Sources</DialogTitle>
            <DialogDescription>
              Official city sources for certified facility lists
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {sources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sources configured yet
              </div>
            ) : (
              sources.map((source) => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{source.source_name}</h4>
                        <p className="text-sm text-muted-foreground">{source.city_or_market}</p>
                        {source.source_url && (
                          <a 
                            href={source.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            View Source <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={source.parse_status === 'ok' ? 'default' : 'secondary'}>
                          {source.parse_status || 'pending'}
                        </Badge>
                        {source.facilities_found !== null && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {source.facilities_found} facilities
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSourceDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
