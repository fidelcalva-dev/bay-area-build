// Internal Order Builder — Cart-style multi-item order composition for Sales/CS
import { useState, useEffect, useCallback } from 'react';
import { Plus, ShoppingCart, Package, Wrench, HelpCircle, Trash2, Calendar, Clock, MapPin, FileText, AlertCircle, CheckCircle, Send, ArrowLeft, Shield, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  createCart, fetchCart, updateCart, fetchMyCarts,
  addCartItem, removeCartItem, updateCartItem, fetchCartItems,
  addSchedule, removeSchedule, fetchItemSchedules,
  fetchExtraCatalog, fetchCartAuditLog,
  type CartRow, type CartItemRow, type CartScheduleRow, type ExtraCatalogRow,
} from '@/services/cartService';
import {
  fetchFullExtraCatalog, resolveExtraPrice, filterExtrasByContext,
  calculateMargin, logPricingOverride,
  type ExtraCatalogItem, type PricingRuleMatch,
} from '@/services/extrasPricingEngine';

// ── Constants ──────────────────────────────────────────
const DUMPSTER_SIZES = [5, 8, 10, 20, 30, 40, 50];
const MATERIAL_CATEGORIES = [
  { value: 'general', label: 'General Debris' },
  { value: 'heavy', label: 'Heavy / C&D' },
  { value: 'green', label: 'Green Waste' },
];
const TIME_WINDOWS = ['Morning 8-12', 'Midday 12-3', 'Afternoon 3-6'];
const SCHEDULE_TYPES = ['DELIVERY', 'PICKUP', 'SWAP'];

type AddItemMode = 'dumpster' | 'extra' | 'custom' | 'rfq' | null;

// ── Component ──────────────────────────────────────────
export default function OrderBuilder() {
  // Cart state
  const [cart, setCart] = useState<CartRow | null>(null);
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [schedules, setSchedules] = useState<Record<string, CartScheduleRow[]>>({});
  const [extras, setExtras] = useState<ExtraCatalogRow[]>([]);
  const [fullCatalog, setFullCatalog] = useState<ExtraCatalogItem[]>([]);
  const [recentCarts, setRecentCarts] = useState<CartRow[]>([]);
  const [showRecent, setShowRecent] = useState(true);

  // Form state
  const [zip, setZip] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState('homeowner');
  const [notesInternal, setNotesInternal] = useState('');
  const [notesCustomer, setNotesCustomer] = useState('');

  // Add item dialog
  const [addMode, setAddMode] = useState<AddItemMode>(null);
  const [itemForm, setItemForm] = useState({
    title: '', description: '', qty: 1, unit: 'each',
    unitPrice: '' as string, sizeYd: 20, materialCategory: 'general',
    extraCode: '',
  });
  const [resolvedPrice, setResolvedPrice] = useState<PricingRuleMatch | null>(null);

  // Schedule dialog
  const [scheduleDialog, setScheduleDialog] = useState<{ itemId: string; cartId: string } | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    type: 'DELIVERY', date: undefined as Date | undefined, window: 'Morning 8-12', notes: '',
  });

  // Load extras catalog on mount
  useEffect(() => {
    fetchExtraCatalog().then(setExtras).catch(console.error);
    fetchFullExtraCatalog().then(setFullCatalog).catch(console.error);
    fetchMyCarts('DRAFT').then(setRecentCarts).catch(console.error);
  }, []);

  // Refresh items + schedules
  const refreshCart = useCallback(async (cartId: string) => {
    const [cartData, itemsData] = await Promise.all([
      fetchCart(cartId),
      fetchCartItems(cartId),
    ]);
    setCart(cartData);
    setItems(itemsData);
    // Load schedules for all items
    const schedMap: Record<string, CartScheduleRow[]> = {};
    await Promise.all(itemsData.map(async (item) => {
      schedMap[item.id] = await fetchItemSchedules(item.id);
    }));
    setSchedules(schedMap);
  }, []);

  // ── Create new cart ──────────────────────────────────
  const handleCreateCart = async () => {
    try {
      const newCart = await createCart({ zip, serviceAddress: address, customerType });
      setShowRecent(false);
      await refreshCart(newCart.id);
      toast.success('Cart created');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create cart');
    }
  };

  // ── Resume existing cart ─────────────────────────────
  const handleResumeCart = async (cartId: string) => {
    setShowRecent(false);
    await refreshCart(cartId);
    if (cart) {
      setZip(cart.zip ?? '');
      setAddress(cart.service_address_text ?? '');
      setCustomerType(cart.customer_type ?? 'homeowner');
      setNotesInternal(cart.notes_internal ?? '');
      setNotesCustomer(cart.notes_customer ?? '');
    }
  };

  // ── Add Item ─────────────────────────────────────────
  const handleAddItem = async () => {
    if (!cart) return;
    try {
      const price = itemForm.unitPrice !== '' ? parseFloat(itemForm.unitPrice) : null;
      const isPending = price == null;

      let itemType = 'CUSTOM';
      let title = itemForm.title;
      let sizeYd: number | null = null;
      let matCat: string | null = null;

      if (addMode === 'dumpster') {
        itemType = 'DUMPSTER';
        title = `${itemForm.sizeYd}yd Dumpster — ${MATERIAL_CATEGORIES.find(m => m.value === itemForm.materialCategory)?.label}`;
        sizeYd = itemForm.sizeYd;
        matCat = itemForm.materialCategory;
      } else if (addMode === 'extra') {
        itemType = 'EXTRA';
        const extra = extras.find(e => e.code === itemForm.extraCode);
        if (extra) {
          title = extra.name;
        }
      } else if (addMode === 'rfq') {
        itemType = 'RFQ';
      }

      await addCartItem(cart.id, {
        item_type: itemType,
        title,
        description: itemForm.description || undefined,
        qty: itemForm.qty,
        unit: itemForm.unit,
        unit_price: price,
        is_price_pending: isPending,
        pricing_source: isPending ? 'PENDING' : 'MANUAL',
        related_size_yd: sizeYd,
        related_material_category: matCat,
      });

      setAddMode(null);
      resetItemForm();
      await refreshCart(cart.id);
      toast.success('Item added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item');
    }
  };

  // ── Remove Item ──────────────────────────────────────
  const handleRemoveItem = async (itemId: string) => {
    if (!cart) return;
    await removeCartItem(cart.id, itemId);
    await refreshCart(cart.id);
    toast.success('Item removed');
  };

  // ── Add Schedule ─────────────────────────────────────
  const handleAddSchedule = async () => {
    if (!scheduleDialog || !scheduleForm.date) return;
    await addSchedule(scheduleDialog.cartId, scheduleDialog.itemId, {
      schedule_type: scheduleForm.type,
      scheduled_date: format(scheduleForm.date, 'yyyy-MM-dd'),
      time_window: scheduleForm.window,
      notes: scheduleForm.notes || undefined,
    });
    setScheduleDialog(null);
    setScheduleForm({ type: 'DELIVERY', date: undefined, window: 'Morning 8-12', notes: '' });
    await refreshCart(scheduleDialog.cartId);
    toast.success('Schedule added');
  };

  // ── Save notes ───────────────────────────────────────
  const handleSaveNotes = async () => {
    if (!cart) return;
    await updateCart(cart.id, { notes_internal: notesInternal, notes_customer: notesCustomer });
    toast.success('Notes saved');
  };

  const resetItemForm = () => {
    setItemForm({ title: '', description: '', qty: 1, unit: 'each', unitPrice: '', sizeYd: 20, materialCategory: 'general', extraCode: '' });
    setResolvedPrice(null);
  };

  // Computed
  const pendingCount = items.filter(i => i.is_price_pending).length;
  const estimatedTotal = items.reduce((s, i) => s + (i.amount ?? 0), 0);

  // ── LANDING: show recent carts or create ─────────────
  if (showRecent && !cart) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Builder</h1>
            <p className="text-sm text-muted-foreground">Build complex multi-item orders for customers</p>
          </div>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader><CardTitle className="text-base">Start New Cart</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="ZIP Code" value={zip} onChange={e => setZip(e.target.value)} />
              <Input placeholder="Service Address" value={address} onChange={e => setAddress(e.target.value)} />
              <Select value={customerType} onValueChange={setCustomerType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner">Homeowner</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateCart} className="w-full md:w-auto">
              <ShoppingCart className="w-4 h-4 mr-2" /> Create Cart
            </Button>
          </CardContent>
        </Card>

        {/* Recent Drafts */}
        {recentCarts.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Drafts</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {recentCarts.slice(0, 10).map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleResumeCart(c.id)}
                    className="w-full text-left px-3 py-3 hover:bg-muted/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.service_address_text || c.zip || 'No address'}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(c.created_at), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{c.status}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── MAIN BUILDER ─────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { setCart(null); setItems([]); setShowRecent(true); }}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Order Builder</h1>
          <p className="text-xs text-muted-foreground">
            Cart {cart?.id.slice(0, 8)} · {cart?.status}
            {cart?.zip && ` · ZIP ${cart.zip}`}
          </p>
        </div>
        <Badge variant={pendingCount > 0 ? 'destructive' : 'default'}>
          {pendingCount > 0 ? `${pendingCount} price pending` : 'All priced'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Customer + Address + Notes */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="ZIP" value={zip} onChange={e => setZip(e.target.value)} />
              <Input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
              <Select value={customerType} onValueChange={setCustomerType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner">Homeowner</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Internal Notes</label>
                <Textarea rows={3} value={notesInternal} onChange={e => setNotesInternal(e.target.value)} placeholder="Staff-only notes..." />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Customer Notes</label>
                <Textarea rows={3} value={notesCustomer} onChange={e => setNotesCustomer(e.target.value)} placeholder="Visible to customer..." />
              </div>
              <Button size="sm" variant="outline" onClick={handleSaveNotes} className="w-full">Save Notes</Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { resetItemForm(); setAddMode('dumpster'); }}>
              <Package className="w-4 h-4 mr-1" /> Add Dumpster
            </Button>
            <Button size="sm" variant="outline" onClick={() => { resetItemForm(); setAddMode('extra'); }}>
              <Wrench className="w-4 h-4 mr-1" /> Add Extra
            </Button>
            <Button size="sm" variant="outline" onClick={() => { resetItemForm(); setAddMode('custom'); }}>
              <Plus className="w-4 h-4 mr-1" /> Custom Item
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { resetItemForm(); setAddMode('rfq'); }}>
              <HelpCircle className="w-4 h-4 mr-1" /> Request Price
            </Button>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Cart is empty. Add dumpsters, extras, or custom items.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <Card key={item.id} className={cn(item.is_price_pending && 'border-destructive/40')}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{item.item_type}</Badge>
                          <span className="font-medium text-sm text-foreground truncate">{item.title}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>Qty: {item.qty}</span>
                          <span>Unit: {item.unit}</span>
                          {item.related_size_yd && <span>Size: {item.related_size_yd}yd</span>}
                        </div>

                        {/* Schedules */}
                        {(schedules[item.id] ?? []).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {schedules[item.id].map(s => (
                              <div key={s.id} className="flex items-center gap-2 text-xs">
                                <Calendar className="w-3 h-3 text-primary" />
                                <Badge variant="secondary" className="text-[10px]">{s.schedule_type}</Badge>
                                <span>{format(new Date(s.scheduled_date), 'MMM d')}</span>
                                <span className="text-muted-foreground">{s.time_window}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1 text-xs"
                          onClick={() => cart && setScheduleDialog({ itemId: item.id, cartId: cart.id })}
                        >
                          <Clock className="w-3 h-3 mr-1" /> Add Schedule
                        </Button>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        {item.is_price_pending ? (
                          <Badge variant="outline" className="text-destructive border-destructive/40">
                            <AlertCircle className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        ) : (
                          <p className="font-semibold text-foreground">${(item.amount ?? 0).toFixed(2)}</p>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Total</span>
                  <span className="font-bold text-foreground">${estimatedTotal.toFixed(2)}</span>
                </div>
                {pendingCount > 0 && (
                  <p className="text-xs text-destructive mt-1">
                    {pendingCount} item(s) require pricing before finalization
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cart Actions */}
          {items.length > 0 && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" disabled>
                <Send className="w-4 h-4 mr-1" /> Send to Customer
              </Button>
              <Button size="sm" disabled={pendingCount > 0}>
                <CheckCircle className="w-4 h-4 mr-1" /> Convert to Order
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Item Dialog ───────────────────────────── */}
      <Dialog open={addMode !== null} onOpenChange={(open) => { if (!open) setAddMode(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {addMode === 'dumpster' && 'Add Dumpster'}
              {addMode === 'extra' && 'Add Extra'}
              {addMode === 'custom' && 'Add Custom Item'}
              {addMode === 'rfq' && 'Request for Price'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Dumpster-specific */}
            {addMode === 'dumpster' && (
              <>
                <div>
                  <label className="text-xs font-medium">Size</label>
                  <Select value={String(itemForm.sizeYd)} onValueChange={v => setItemForm(f => ({ ...f, sizeYd: parseInt(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DUMPSTER_SIZES.map(s => (
                        <SelectItem key={s} value={String(s)}>{s} Yard</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium">Material</label>
                  <Select value={itemForm.materialCategory} onValueChange={v => setItemForm(f => ({ ...f, materialCategory: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MATERIAL_CATEGORIES.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Extra-specific */}
            {addMode === 'extra' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Select Extra</label>
                  <Select value={itemForm.extraCode} onValueChange={async (v) => {
                    const catalogItem = fullCatalog.find(e => e.code === v);
                    const extra = extras.find(e => e.code === v);
                    setItemForm(f => ({
                      ...f,
                      extraCode: v,
                      title: extra?.name ?? catalogItem?.name ?? '',
                      description: extra?.description ?? catalogItem?.description ?? '',
                      unit: extra?.unit ?? catalogItem?.unit ?? 'each',
                      unitPrice: '',
                    }));
                    // Resolve price via engine
                    if (catalogItem) {
                      const result = await resolveExtraPrice(catalogItem, {
                        zoneId: undefined, // TODO: resolve from zip
                        sizeYd: itemForm.sizeYd,
                        materialType: itemForm.materialCategory,
                        basePrice: estimatedTotal,
                        totalPrice: estimatedTotal,
                      });
                      setResolvedPrice(result);
                      if (result.price != null) {
                        setItemForm(f => ({ ...f, unitPrice: String(result.price) }));
                      }
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                    <SelectContent>
                      {fullCatalog.map(e => (
                        <SelectItem key={e.code} value={e.code}>
                          <span className="flex items-center gap-2">
                            {e.name}
                            {e.requires_approval && <Shield className="w-3 h-3 text-destructive" />}
                            <Badge variant="outline" className="text-[10px] ml-1">{e.pricing_model}</Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing resolution info */}
                {resolvedPrice && itemForm.extraCode && (
                  <div className="rounded-lg border border-border p-3 space-y-1.5 bg-muted/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Source</span>
                      <Badge variant="secondary" className="text-[10px]">{resolvedPrice.source}</Badge>
                    </div>
                    {resolvedPrice.price != null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Resolved Price</span>
                        <span className="font-semibold text-foreground">${resolvedPrice.price.toFixed(2)}</span>
                      </div>
                    )}
                    {resolvedPrice.vendorCost != null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Vendor Cost</span>
                        <span className="text-foreground">${resolvedPrice.vendorCost.toFixed(2)}</span>
                      </div>
                    )}
                    {resolvedPrice.vendorCost != null && resolvedPrice.price != null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Margin</span>
                        {(() => {
                          const m = calculateMargin(resolvedPrice.price, resolvedPrice.vendorCost!);
                          return (
                            <span className={cn('font-medium',
                              m.band === 'green' && 'text-primary',
                              m.band === 'yellow' && 'text-muted-foreground',
                              m.band === 'red' && 'text-destructive'
                            )}>
                              {(m.marginPercent * 100).toFixed(0)}%
                            </span>
                          );
                        })()}
                      </div>
                    )}
                    {resolvedPrice.isPending && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Price pending — requires manual entry
                      </p>
                    )}
                    {resolvedPrice.requiresApproval && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Requires manager approval
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Custom / RFQ title */}
            {(addMode === 'custom' || addMode === 'rfq') && (
              <div>
                <label className="text-xs font-medium">Title</label>
                <Input value={itemForm.title} onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Permit handling SF" />
              </div>
            )}

            {/* Description (all) */}
            <div>
              <label className="text-xs font-medium">Description</label>
              <Textarea rows={2} value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional details..." />
            </div>

            {/* Qty + Unit + Price */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium">Qty</label>
                <Input type="number" min={1} value={itemForm.qty} onChange={e => setItemForm(f => ({ ...f, qty: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="text-xs font-medium">Unit</label>
                <Select value={itemForm.unit} onValueChange={v => setItemForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="each">each</SelectItem>
                    <SelectItem value="day">day</SelectItem>
                    <SelectItem value="ton">ton</SelectItem>
                    <SelectItem value="flat">flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Unit Price</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={itemForm.unitPrice}
                  onChange={e => setItemForm(f => ({ ...f, unitPrice: e.target.value }))}
                  placeholder={addMode === 'rfq' ? 'TBD' : '$0.00'}
                />
              </div>
            </div>
            {addMode === 'rfq' && (
              <p className="text-xs text-destructive">Leave price blank — it will be marked as "Price Pending"</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMode(null)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Schedule Dialog ───────────────────────────── */}
      <Dialog open={scheduleDialog !== null} onOpenChange={(open) => { if (!open) setScheduleDialog(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Schedule</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Type</label>
              <Select value={scheduleForm.type} onValueChange={v => setScheduleForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCHEDULE_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !scheduleForm.date && 'text-muted-foreground')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {scheduleForm.date ? format(scheduleForm.date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={scheduleForm.date}
                    onSelect={(d) => setScheduleForm(f => ({ ...f, date: d ?? undefined }))}
                    disabled={(d) => d < new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-xs font-medium">Time Window</label>
              <Select value={scheduleForm.window} onValueChange={v => setScheduleForm(f => ({ ...f, window: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIME_WINDOWS.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Notes</label>
              <Input value={scheduleForm.notes} onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialog(null)}>Cancel</Button>
            <Button onClick={handleAddSchedule} disabled={!scheduleForm.date}>Add Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
