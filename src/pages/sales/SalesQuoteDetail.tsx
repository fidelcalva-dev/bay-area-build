import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Save, Loader2, Calendar, MapPin, Clock,
  FileText, Camera, Trash2, ImageIcon, Send, ScrollText, CreditCard,
  Phone, MessageSquare, Mail, User, Building2, Package, Weight,
  DollarSign, CheckCircle2, XCircle, AlertTriangle, Truck, Pencil,
  ShieldCheck, StickyNote, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sendOutboundQuote, createOutboundQuote, getIncludedTonsText } from "@/services/outboundQuoteService";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Draft", color: "bg-muted text-muted-foreground" },
  saved: { label: "Saved", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  pinned: { label: "Pinned", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  scheduled: { label: "Scheduled", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  converted: { label: "Converted", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  expired: { label: "Expired", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

const TIME_WINDOWS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "Any time",
];

const DUMPSTER_SIZES = [6, 10, 15, 20, 30, 40];

// ─── Dispatch Readiness Check ─────────────────────────────
function DispatchReadyCheck({ quote, deliveryDate, deliveryAddress }: {
  quote: any;
  deliveryDate: Date | undefined;
  deliveryAddress: string;
}) {
  const sizeYd = quote.user_selected_size_yards || quote.recommended_size_yards;
  const checks = [
    { label: "Address valid", ok: !!deliveryAddress && deliveryAddress.length > 5 },
    { label: "Dumpster size selected", ok: !!sizeYd },
    { label: "Delivery date selected", ok: !!deliveryDate },
    { label: "Customer phone", ok: !!quote.customer_phone },
    { label: "Material type set", ok: !!quote.material_type },
  ];
  const allPassed = checks.every(c => c.ok);

  return (
    <Card className={cn(
      "border-2",
      allPassed ? "border-success/50 bg-success/5" : "border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/10"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {allPassed ? (
            <ShieldCheck className="w-5 h-5 text-success" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          )}
          {allPassed ? "Dispatch Ready" : "Not Ready for Dispatch"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {checks.map(c => (
            <div key={c.label} className="flex items-center gap-1.5 text-sm">
              {c.ok ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
              )}
              <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Pricing Breakdown ────────────────────────────────────
function PricingBreakdown({ quote }: { quote: any }) {
  const sizeYd = quote.user_selected_size_yards || quote.recommended_size_yards || 10;
  const includedTons = getIncludedTonsText(sizeYd);
  const rows = [
    { label: "Base Price", value: quote.subtotal, emphasis: true },
    { label: "Delivery & Pickup", value: 0, note: "Included" },
    { label: `Disposal (${includedTons})`, value: 0, note: "Included" },
    ...(quote.discount_percent ? [{ label: `Discount (${quote.discount_percent}%)`, value: -(quote.subtotal * quote.discount_percent / 100) }] : []),
    ...(quote.toll_surcharge ? [{ label: "Toll Surcharge", value: quote.toll_surcharge }] : []),
  ];

  const total = rows.reduce((sum, r) => sum + (r.value || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Pricing Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <span className={cn(
              "font-medium",
              r.value < 0 ? "text-success" : "text-foreground"
            )}>
              {r.value === 0 && r.note ? (
                <span className="text-success">{r.note}</span>
              ) : r.value < 0 ? (
                `-$${Math.abs(r.value).toFixed(0)}`
              ) : (
                `$${r.value.toFixed(0)}`
              )}
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between">
          <span className="font-semibold text-foreground">Estimate Range</span>
          <span className="font-bold text-lg text-foreground">
            ${quote.estimated_min?.toFixed(0)} – ${quote.estimated_max?.toFixed(0)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Overage: $65/ton beyond included weight. Extra days: $15/day.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function SalesQuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quote, setQuote] = useState<any>(null);

  // Editable fields
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [billingInstructions, setBillingInstructions] = useState("");
  const [deliveryTimeWindow, setDeliveryTimeWindow] = useState("");
  const [deliveryPhotos, setDeliveryPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSendingContract, setIsSendingContract] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [salesNotes, setSalesNotes] = useState("");
  const [customerIntent, setCustomerIntent] = useState("");

  useEffect(() => {
    if (id) fetchQuote();
  }, [id]);

  async function fetchQuote() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setQuote(data);

      if (data.delivery_date) setDeliveryDate(new Date(data.delivery_date + "T00:00:00"));
      setDeliveryAddress(data.delivery_address || "");
      setDeliveryInstructions(data.delivery_instructions || "");
      setDeliveryTimeWindow(data.delivery_time_window || "");
      setBillingInstructions(data.billing_instructions || "");
      setDeliveryPhotos(data.delivery_photos || []);
      setSelectedSize(String(data.user_selected_size_yards || data.recommended_size_yards || ""));
      setSalesNotes(data.scheduling_notes || "");
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading quote", variant: "destructive" });
      navigate("/sales/quotes");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .update({
          delivery_date: deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : null,
          delivery_address: deliveryAddress || null,
          delivery_instructions: deliveryInstructions || null,
          delivery_time_window: deliveryTimeWindow || null,
          billing_instructions: billingInstructions || null,
          delivery_photos: deliveryPhotos,
          user_selected_size_yards: selectedSize ? Number(selectedSize) : null,
          scheduling_notes: salesNotes || null,
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Quote updated" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving quote", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const newPhotos: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `quotes/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("quote-photos").upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("quote-photos").getPublicUrl(path);
        newPhotos.push(urlData.publicUrl);
      }
      setDeliveryPhotos(prev => [...prev, ...newPhotos]);
      toast({ title: `${newPhotos.length} photo(s) uploaded` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error uploading photo", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removePhoto(index: number) {
    setDeliveryPhotos(prev => prev.filter((_, i) => i !== index));
  }

  async function handleResend() {
    if (!quote) return;
    setIsResending(true);
    try {
      const { data: existing } = await supabase
        .from("outbound_quotes")
        .select("id, status")
        .eq("quote_id", quote.id)
        .order("created_at", { ascending: false })
        .limit(1);

      let outboundId: string;
      if (existing && existing.length > 0) {
        outboundId = existing[0].id;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) throw new Error("Not authenticated");
        const record = await createOutboundQuote({
          customer_name: quote.customer_name || "Customer",
          customer_phone: quote.customer_phone || undefined,
          customer_email: quote.customer_email || undefined,
          address_text: quote.delivery_address || undefined,
          zip: quote.zip_code,
          customer_type: quote.user_type || "homeowner",
          material_category: quote.material_type,
          size_yd: quote.user_selected_size_yards || quote.recommended_size_yards || 10,
          tier: "CORE" as any,
          customer_price: quote.subtotal,
          included_days: quote.rental_days || 7,
          included_tons: getIncludedTonsText(quote.user_selected_size_yards || 10),
          overage_rule_text: "$65/ton over included weight",
          same_day_flag: false,
          quote_id: quote.id,
        }, userId);
        outboundId = record.id;
      }

      const channels: ("SMS" | "EMAIL")[] = [];
      if (quote.customer_phone) channels.push("SMS");
      if (quote.customer_email) channels.push("EMAIL");
      if (channels.length === 0) {
        toast({ title: "No phone or email on this quote", variant: "destructive" });
        return;
      }

      const result = await sendOutboundQuote(outboundId, channels);
      if (result.success) {
        toast({ title: `Quote resent via ${channels.join(" & ")}` });
      } else {
        toast({ title: result.error || "Failed to resend", variant: "destructive" });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: err.message || "Error resending quote", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  }

  async function handleSendContract() {
    if (!quote || !id) return;
    setIsSendingContract(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("send-quote-contract", {
        body: { quoteId: id },
      });
      if (err) throw err;
      if (data?.success) {
        toast({ title: `Contract sent via ${(data.channels as string[])?.join(" & ").toUpperCase() || "pending"}` });
      } else {
        toast({ title: data?.error || "Failed to send contract", variant: "destructive" });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: err.message || "Error sending contract", variant: "destructive" });
    } finally {
      setIsSendingContract(false);
    }
  }

  async function handleMarkConverted() {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status: "converted", converted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Quote marked as converted" });
      fetchQuote();
    } catch (err) {
      console.error(err);
      toast({ title: "Error converting quote", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) return null;

  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
  const sizeYd = quote.user_selected_size_yards || quote.recommended_size_yards;

  return (
    <div className="max-w-4xl mx-auto space-y-5 py-4 px-4 sm:px-0">
      {/* ─── HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/sales/quotes")}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Quote {quote.display_id || quote.id.slice(0, 8)}
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Created {format(new Date(quote.created_at), "PPP")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleSendContract} disabled={isSendingContract}>
            {isSendingContract ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <ScrollText className="w-4 h-4 mr-1.5" />}
            Contract
          </Button>
          <Button variant="outline" size="sm" onClick={handleResend} disabled={isResending}>
            {isResending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
            Send Quote
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* ─── DISPATCH READINESS ──────────────────────────── */}
      <DispatchReadyCheck quote={quote} deliveryDate={deliveryDate} deliveryAddress={deliveryAddress} />

      <div className="grid md:grid-cols-2 gap-5">
        {/* ─── 1. CUSTOMER INFORMATION ─────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Name</p>
                <p className="font-medium">{quote.customer_name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Company</p>
                <p className="font-medium">{quote.company_name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="font-medium">{quote.customer_phone || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium truncate">{quote.customer_email || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Type</p>
                <p className="font-medium capitalize">{quote.user_type || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Lead Source</p>
                <p className="font-medium">{quote.utm_source || "Direct"}</p>
              </div>
            </div>
            {/* Quick Contact Actions */}
            <Separator />
            <div className="flex items-center gap-2 flex-wrap">
              {quote.customer_phone && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${quote.customer_phone}`}>
                      <Phone className="w-3.5 h-3.5 mr-1" /> Call
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`sms:${quote.customer_phone}`}>
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> SMS
                    </a>
                  </Button>
                </>
              )}
              {quote.customer_email && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${quote.customer_email}`}>
                    <Mail className="w-3.5 h-3.5 mr-1" /> Email
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── 2. JOB SITE DETAILS ─────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Job Site Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Textarea
                placeholder="Full delivery address..."
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">ZIP</p>
                <p className="font-medium">{quote.zip_code || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Distance</p>
                <p className="font-medium">{quote.distance_miles ? `${quote.distance_miles.toFixed(1)} mi` : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Placement</p>
                <p className="font-medium capitalize">{quote.placement_type || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Gate Code</p>
                <p className="font-medium">{quote.gate_code || "—"}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Placement / Access Notes</Label>
              <Textarea
                placeholder="Gate code, placement instructions, access notes..."
                value={deliveryInstructions}
                onChange={e => setDeliveryInstructions(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── 3. DUMPSTER DETAILS ─────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" /> Dumpster Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Material Type</p>
                <p className="font-medium capitalize">{quote.material_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Rental Duration</p>
                <p className="font-medium">{quote.rental_days} days</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Included Tons</p>
                <p className="font-medium">{getIncludedTonsText(sizeYd || 10)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Heavy Material</p>
                <p className="font-medium">{quote.is_heavy_material ? "Yes" : "No"}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Dumpster Size (yards)</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size..." />
                </SelectTrigger>
                <SelectContent>
                  {DUMPSTER_SIZES.map(s => (
                    <SelectItem key={s} value={String(s)}>
                      {s} Yard {s === (quote.recommended_size_yards) ? "(Recommended)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {quote.recommended_size_yards && selectedSize && Number(selectedSize) !== quote.recommended_size_yards && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠ AI recommended {quote.recommended_size_yards}yd
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── 4. DELIVERY SCHEDULING ──────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4" /> Delivery Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Delivery Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !deliveryDate && "text-muted-foreground")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {deliveryDate ? format(deliveryDate, "PPP") : "Select date..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={date => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time Window
              </Label>
              <Select value={deliveryTimeWindow} onValueChange={setDeliveryTimeWindow}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time window..." />
                </SelectTrigger>
                <SelectContent>
                  {TIME_WINDOWS.map(tw => (
                    <SelectItem key={tw} value={tw}>{tw}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Driver Notes</Label>
              <Textarea
                placeholder="Notes for the driver..."
                value={salesNotes}
                onChange={e => setSalesNotes(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 5. PRICING BREAKDOWN (full width) ─────────── */}
      <PricingBreakdown quote={quote} />

      {/* ─── 6. SALES ACTIONS ──────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4" /> Sales Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quote.customer_phone && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`tel:${quote.customer_phone}`}>
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Call
                </a>
              </Button>
            )}
            {quote.customer_phone && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`sms:${quote.customer_phone}`}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> SMS
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={handleResend} disabled={isResending}>
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send Quote
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={handleSendContract} disabled={isSendingContract}>
              <ScrollText className="w-3.5 h-3.5 mr-1.5" /> Contract
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Collect Payment
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/sales/orders/new?quoteId=${id}`)}>
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Create Order
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Truck className="w-3.5 h-3.5 mr-1.5" /> Schedule
            </Button>
            {quote.status !== "converted" && (
              <Button variant="default" size="sm" className="w-full" onClick={handleMarkConverted}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Convert
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        {/* ─── 7. SALES NOTES ────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <StickyNote className="w-4 h-4" /> Sales Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Customer Intent</Label>
              <Select value={customerIntent} onValueChange={setCustomerIntent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intent level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready_to_book">Ready to Book</SelectItem>
                  <SelectItem value="comparing_prices">Comparing Prices</SelectItem>
                  <SelectItem value="planning_ahead">Planning Ahead</SelectItem>
                  <SelectItem value="just_browsing">Just Browsing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Conversation Notes</Label>
              <Textarea
                placeholder="Key details from customer conversations..."
                value={salesNotes}
                onChange={e => setSalesNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Billing Instructions</Label>
              <Textarea
                placeholder="Card on file, PO number, billing contact..."
                value={billingInstructions}
                onChange={e => setBillingInstructions(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── 8. PHOTOS ─────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4" /> Photos & Attachments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliveryPhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {deliveryPhotos.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-28 object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="w-full"
            >
              {uploadingPhoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
              {uploadingPhoto ? "Uploading..." : "Add Photos"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
