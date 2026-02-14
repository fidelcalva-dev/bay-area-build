// Master Extras Library Panel for Internal Calculator

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, Plus, Package, Clock, Shield, MapPin, Weight, Repeat, Settings, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { fetchFullExtraCatalog, type ExtraCatalogItem } from '@/services/extrasPricingEngine';

// ── Category Config ────────────────────────────────────
const CATEGORIES = [
  { value: 'ALL', label: 'All Categories', icon: Package },
  { value: 'TIME_SCHEDULING', label: 'Time & Scheduling', icon: Clock },
  { value: 'PROTECTION_SAFETY', label: 'Protection & Safety', icon: Shield },
  { value: 'ACCESS_PERMITS', label: 'Access & Permits', icon: MapPin },
  { value: 'WEIGHT_DISPOSAL', label: 'Weight / Disposal', icon: Weight },
  { value: 'SWAP_EQUIPMENT', label: 'Swap & Equipment', icon: Repeat },
  { value: 'ADMIN_CUSTOM', label: 'Admin / Custom', icon: Settings },
];

// Staff-only notes for known extras
const STAFF_NOTES: Record<string, string> = {
  EXTRA_DAY: 'Standard $35/day. Apply when rental extends beyond included period.',
  RUSH_FEE: 'Use for same-day requests received after noon cutoff.',
  LIVE_LOAD: 'Driver waits on site. 30 min included, then $180/hr in 15-min increments.',
  PLYWOOD: 'Required for asphalt driveways or freshly paved surfaces.',
  PERMIT_ASSIST: 'Flat fee. Customer responsible for actual permit costs from city.',
  DRY_RUN_TRIP: 'Charge if driver cannot access site. Document with photos.',
  CONTAMINATION_FEE: 'Apply when prohibited materials found. Requires photo evidence.',
  SWAP: 'Standard swap fee. Includes delivery of new + pickup of old.',
};

export interface SelectedExtra {
  catalogItem: ExtraCatalogItem;
  quantity: number;
  unitPrice: number | null;
  notes: string;
}

interface ExtrasLibraryPanelProps {
  selectedExtras: SelectedExtra[];
  onAddExtra: (extra: SelectedExtra) => void;
  onRemoveExtra: (code: string) => void;
  userRole: string;
}

export function ExtrasLibraryPanel({
  selectedExtras,
  onAddExtra,
  onRemoveExtra,
  userRole,
}: ExtrasLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customItem, setCustomItem] = useState({
    title: '', description: '', quantity: 1, unit: 'each', price: '', isPricePending: false,
  });

  const { data: catalog = [], isLoading } = useQuery({
    queryKey: ['extra-catalog-full'],
    queryFn: fetchFullExtraCatalog,
    staleTime: 5 * 60 * 1000,
  });

  // Map category from DB to our filter keys
  const mapCategory = (cat: string | null): string => {
    if (!cat) return 'ADMIN_CUSTOM';
    const upper = cat.toUpperCase().replace(/[\s&]/g, '_').replace(/__+/g, '_');
    if (upper.includes('TIME') || upper.includes('SCHEDUL')) return 'TIME_SCHEDULING';
    if (upper.includes('PROTECT') || upper.includes('SAFETY')) return 'PROTECTION_SAFETY';
    if (upper.includes('ACCESS') || upper.includes('PERMIT')) return 'ACCESS_PERMITS';
    if (upper.includes('WEIGHT') || upper.includes('DISPOS')) return 'WEIGHT_DISPOSAL';
    if (upper.includes('SWAP') || upper.includes('EQUIP')) return 'SWAP_EQUIPMENT';
    return 'ADMIN_CUSTOM';
  };

  const filteredExtras = useMemo(() => {
    return catalog.filter(item => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === 'ALL' || mapCategory(item.category) === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [catalog, searchQuery, activeCategory]);

  const selectedCodes = new Set(selectedExtras.map(e => e.catalogItem.code));

  const handleAddFromCatalog = (item: ExtraCatalogItem) => {
    if (selectedCodes.has(item.code)) return;
    onAddExtra({
      catalogItem: item,
      quantity: 1,
      unitPrice: item.default_price,
      notes: '',
    });
  };

  const handleAddCustom = () => {
    const customCatalogItem: ExtraCatalogItem = {
      id: `custom-${Date.now()}`,
      code: `CUSTOM_${Date.now()}`,
      name: customItem.title,
      description: customItem.description,
      unit: customItem.unit,
      default_price: customItem.isPricePending ? null : parseFloat(customItem.price) || null,
      pricing_model: customItem.isPricePending ? 'PENDING' : 'FIXED',
      applies_to_material: 'ALL',
      applies_to_sizes_json: null,
      requires_approval: false,
      formula_expression: null,
      category: 'ADMIN_CUSTOM',
      is_active: true,
    };
    onAddExtra({
      catalogItem: customCatalogItem,
      quantity: customItem.quantity,
      unitPrice: customItem.isPricePending ? null : parseFloat(customItem.price) || null,
      notes: '',
    });
    setShowCustomDialog(false);
    setCustomItem({ title: '', description: '', quantity: 1, unit: 'each', price: '', isPricePending: false });
  };

  const getPricingBadge = (item: ExtraCatalogItem) => {
    if (item.pricing_model === 'PENDING') return <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700">RFQ</Badge>;
    if (item.pricing_model === 'FORMULA') return <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">Formula</Badge>;
    if (item.requires_approval) return <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700">Approval</Badge>;
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5" />
              Extras Library
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {selectedExtras.length} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search extras by name or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeCategory === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <Separator />

          {/* Extras list */}
          <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredExtras.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No extras found matching your criteria.
              </p>
            ) : (
              filteredExtras.map(item => {
                const isSelected = selectedCodes.has(item.code);
                const staffNote = STAFF_NOTES[item.code];
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-lg border text-sm transition-all ${
                      isSelected
                        ? 'border-primary/40 bg-primary/[0.03]'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs truncate">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{item.code}</span>
                          {getPricingBadge(item)}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        {staffNote && (
                          <p className="text-[10px] text-primary/70 mt-0.5 italic">
                            Staff: {staffNote}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.default_price != null && (
                          <span className="text-xs font-semibold">
                            ${item.default_price}
                            <span className="text-[10px] text-muted-foreground font-normal">/{item.unit}</span>
                          </span>
                        )}
                        {isSelected ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => onRemoveExtra(item.code)}
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleAddFromCatalog(item)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Separator />

          {/* Custom item button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setShowCustomDialog(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Custom Line Item
          </Button>

          {/* Selected extras summary */}
          {selectedExtras.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Added Extras</p>
              {selectedExtras.map(sel => (
                <div key={sel.catalogItem.code} className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{sel.catalogItem.name}</span>
                    {sel.quantity > 1 && (
                      <Badge variant="outline" className="text-[10px]">x{sel.quantity}</Badge>
                    )}
                  </div>
                  <span className="font-semibold">
                    {sel.unitPrice != null ? `$${(sel.unitPrice * sel.quantity).toFixed(0)}` : 'TBD'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Item Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Line Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input
                placeholder="Custom service or item..."
                value={customItem.title}
                onChange={e => setCustomItem(prev => ({ ...prev, title: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="Details for this line item..."
                value={customItem.description}
                onChange={e => setCustomItem(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={customItem.quantity}
                  onChange={e => setCustomItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unit</Label>
                <Select
                  value={customItem.unit}
                  onValueChange={v => setCustomItem(prev => ({ ...prev, unit: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Price ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={customItem.price}
                  onChange={e => setCustomItem(prev => ({ ...prev, price: e.target.value }))}
                  disabled={customItem.isPricePending}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={customItem.isPricePending}
                onCheckedChange={c => setCustomItem(prev => ({ ...prev, isPricePending: c }))}
              />
              <Label className="text-xs text-muted-foreground">Price pending (RFQ)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCustomDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCustom} disabled={!customItem.title.trim()}>
              Add to Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
