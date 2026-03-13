import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Save, Loader2, Calendar, MapPin, Clock,
  FileText, Camera, Trash2, ImageIcon, Send, ScrollText, CreditCard,
  Phone, MessageSquare, Mail, User, Building2, Package, Weight,
  DollarSign, CheckCircle2, XCircle, AlertTriangle, Truck, Pencil,
  ShieldCheck, StickyNote, Zap, Eye, Ban, CircleDot, Info, Copy
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sendOutboundQuote, createOutboundQuote, getIncludedTonsText } from "@/services/outboundQuoteService";
import { addTimelineNote } from "@/lib/timelineService";

// ─── Constants ────────────────────────────────────────────
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

const DELIVERY_PREFERENCES = [
  { value: "specific_date", label: "Specific Date" },
  { value: "asap", label: "ASAP / Earliest Available" },
  { value: "flexible", label: "Flexible — Any Day This Week" },
  { value: "call_to_confirm", label: "Call to Confirm" },
];

// ─── Sales Readiness Badge ────────────────────────────────
type ReadinessLevel = "ready" | "follow_up" | "missing";

function getReadiness(quote: any, deliveryDate: Date | undefined, deliveryAddress: string, deliveryPref: string): { level: ReadinessLevel; label: string; missing: string[] } {
  const missing: string[] = [];
  if (!quote.customer_name) missing.push("Customer name");
  if (!quote.customer_phone) missing.push("Phone");
  if (!deliveryAddress || deliveryAddress.length < 6) missing.push("Service address");
  if (!quote.material_type) missing.push("Material type");
  const sizeYd = quote.user_selected_size_yards || quote.recommended_size_yards;
  if (!sizeYd) missing.push("Dumpster size");
  if (!quote.subtotal) missing.push("Price");
  const hasDeliveryIntent = !!deliveryDate || deliveryPref === "asap" || deliveryPref === "flexible" || deliveryPref === "call_to_confirm";
  if (!hasDeliveryIntent) missing.push("Delivery preference");

  if (missing.length === 0) return { level: "ready", label: "Ready to Schedule", missing };
  if (missing.length <= 2) return { level: "follow_up", label: "Needs Follow-Up", missing };
  return { level: "missing", label: "Missing Info", missing };
}

function ReadinessBadge({ level, label, missing }: { level: ReadinessLevel; label: string; missing: string[] }) {
  const config = {
    ready: { bg: "bg-success/10 border-success/30", text: "text-success", Icon: ShieldCheck },
    follow_up: { bg: "bg-amber-100/80 border-amber-300/40 dark:bg-amber-900/20 dark:border-amber-700/40", text: "text-amber-700 dark:text-amber-400", Icon: AlertTriangle },
    missing: { bg: "bg-destructive/10 border-destructive/30", text: "text-destructive", Icon: XCircle },
  }[level];

  return (
    <div className={cn("rounded-xl border-2 p-4", config.bg)}>
      <div className="flex items-center gap-3">
        <config.Icon className={cn("w-6 h-6 shrink-0", config.text)} />
        <div className="min-w-0 flex-1">
          <p className={cn("font-bold text-lg", config.text)}>{label}</p>
          {missing.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Missing: {missing.join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Commercial Status Tracker ────────────────────────────
interface CommercialStatus {
  quoteSent: boolean;
  contractStatus: string | null;
  contractSentAt: string | null;
  paymentStatus: string | null;
  paymentSentAt: string | null;
  orderCreated: boolean;
  orderId: string | null;
}

function CommercialStatusCard({ status }: { status: CommercialStatus }) {
  const steps = [
    { label: "Quote Created", done: true, icon: FileText },
    { label: "Quote Sent", done: status.quoteSent, icon: Send },
    { label: "Contract", done: status.contractStatus === "signed", status: status.contractStatus, icon: ScrollText },
    { label: "Payment", done: status.paymentStatus === "paid" || status.paymentStatus === "completed", status: status.paymentStatus, icon: CreditCard },
    { label: "Order Created", done: status.orderCreated, icon: Package },
  ];

  // Dispatch handoff state
  const contractSigned = status.contractStatus === "signed";
  const paymentDone = status.paymentStatus === "paid" || status.paymentStatus === "completed";
  let handoffState: { label: string; color: string } = { label: "Missing Info", color: "bg-muted text-muted-foreground" };
  if (contractSigned && paymentDone) {
    handoffState = { label: "Ready for Dispatch", color: "bg-success/10 text-success border-success/30" };
  } else if (!contractSigned && status.contractStatus) {
    handoffState = { label: "Waiting on Contract", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
  } else if (contractSigned && !paymentDone) {
    handoffState = { label: "Waiting on Payment", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
  } else if (!contractSigned && !status.contractStatus) {
    handoffState = { label: "Missing Scheduling Info", color: "bg-muted text-muted-foreground" };
  }

  const getStepBadge = (step: typeof steps[0]) => {
    if (step.done) return <Badge className="bg-success/10 text-success border-success/30 text-[10px]">Done</Badge>;
    if (step.status === "pending") return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
    if (step.status === "sent" || step.status === "link_sent") return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[10px]">Sent</Badge>;
    if (step.status === "viewed" || step.status === "opened") return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-[10px]">Viewed</Badge>;
    if (step.status === "declined" || step.status === "failed" || step.status === "expired")
      return <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">{step.status}</Badge>;
    return <Badge variant="outline" className="text-[10px] text-muted-foreground">Not started</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-primary" /> Commercial Status
          </span>
          <Badge className={`text-[10px] ${handoffState.color}`}>
            {handoffState.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                )}
                <step.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={cn("text-sm", step.done ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
              </div>
              {getStepBadge(step)}
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

  const isGreenHalo = quote.is_green_halo;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Pricing Summary
          {isGreenHalo && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-[10px]">🌿 Green Halo</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <span className={cn("font-medium", r.value < 0 ? "text-success" : "text-foreground")}>
              {r.value === 0 && r.note ? (
                <span className="text-success">{r.note}</span>
              ) : r.value < 0 ? (
                `-$${Math.abs(r.value).toFixed(0)}`
              ) : (
                `$${r.value?.toFixed(0) || '0'}`
              )}
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between">
          <span className="font-semibold text-foreground">Estimated Total</span>
          <span className="font-bold text-lg text-foreground">
            ${quote.estimated_min?.toFixed(0)} – ${quote.estimated_max?.toFixed(0)}
          </span>
        </div>
        <div className="rounded-lg bg-muted/40 p-3 space-y-1">
          <p className="text-xs text-muted-foreground">
            Includes delivery, pickup, standard rental, and the pricing rules shown for your selected material.
          </p>
          <p className="text-xs text-muted-foreground">
            Overage: $65/ton beyond included weight · Extra days: $15/day
          </p>
          {quote.is_heavy_material && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              ⚠ Heavy material — fill-line rule applies. Overweight surcharges enforced.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recommended Script (inline mini version) ─────────────
function QuoteScriptWidget({ quote }: { quote: any }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const name = quote.customer_name || "there";
  const size = quote.user_selected_size_yards || quote.recommended_size_yards || "";
  const price = quote.subtotal ? `$${quote.subtotal.toFixed(0)}` : "";
  const isFollowUp = quote.status === "sent" || quote.status === "saved";

  const smsScript = isFollowUp
    ? `Hi ${name}, just following up on your dumpster quote${size ? ` (${size}yd)` : ''}${price ? ` at ${price}` : ''}. Ready to schedule? Reply YES or call (510) 680-2150.`
    : `Hi ${name}, this is Calsan Dumpsters Pro. We received your request${size ? ` for a ${size}yd dumpster` : ''}. We can deliver as early as tomorrow. Reply here or call (510) 680-2150.`;

  const callScript = isFollowUp
    ? `Hi ${name}, this is [REP] from Calsan Dumpsters Pro. Following up on the ${size ? size + 'yd ' : ''}quote${price ? ` at ${price}` : ''}. Any questions? I can schedule delivery for you right now.`
    : `Hi ${name}, this is [REP] from Calsan Dumpsters Pro. I see your request${size ? ` for a ${size}yd dumpster` : ''}. I can get one to you quickly — do you have a moment to confirm the details?`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Recommended Script
          </span>
          <Badge variant="outline" className="text-[10px]">{isFollowUp ? "Follow-Up" : "First Contact"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="p-2.5 rounded-lg bg-muted/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />SMS
            </span>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleCopy(smsScript, 'SMS script')}>
              <Copy className="w-3 h-3 mr-1" />Copy
            </Button>
          </div>
          <p className="text-xs leading-relaxed">{smsScript}</p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <Phone className="w-3 h-3" />
          {expanded ? "Hide" : "Show"} Call Script
        </button>
        {expanded && (
          <div className="p-2.5 rounded-lg bg-muted/30 space-y-1.5">
            <div className="flex items-center justify-end">
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleCopy(callScript, 'Call script')}>
                <Copy className="w-3 h-3 mr-1" />Copy
              </Button>
            </div>
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{callScript}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Add Note Dialog ──────────────────────────────────────
function AddNoteDialog({ quoteId, customerId, onAdded }: { quoteId: string; customerId?: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await addTimelineNote({
        entityType: 'QUOTE',
        entityId: quoteId,
        note: note.trim(),
        customerId: customerId || undefined,
      });
      toast({ title: "Note added" });
      setNote("");
      setOpen(false);
      onAdded();
    } catch {
      toast({ title: "Failed to add note", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-1.5">
          <StickyNote className="w-3.5 h-3.5" /> Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Enter note..."
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !note.trim()}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Send Payment Link Dialog ─────────────────────────────
function SendPaymentDialog({ quoteId, customerId, customerPhone, amount, onSent }: {
  quoteId: string; customerId?: string; customerPhone?: string; amount: number; onSent: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(amount > 0 ? amount.toFixed(2) : "");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function handleSend() {
    const num = parseFloat(payAmount);
    if (!num || num <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase
        .from("payment_requests" as "orders")
        .insert({
          customer_id: customerId,
          quote_id: quoteId,
          amount: num,
          status: "sent",
          sent_via: customerPhone ? "sms" : "email",
        } as never)
        .select()
        .single();

      if (error) throw error;

      // Timeline event
      if (customerId) {
        await supabase.from("timeline_events").insert({
          entity_type: "CUSTOMER" as const,
          entity_id: customerId,
          customer_id: customerId,
          event_type: "PAYMENT" as const,
          event_action: "SENT" as const,
          summary: `Payment link sent for $${num.toFixed(2)}`,
          details_json: { quote_id: quoteId, amount: num, event: "PAYMENT_LINK_SENT" },
        });
      }

      toast({ title: "Payment link sent", description: `$${num.toFixed(2)} payment request created` });
      setOpen(false);
      onSent();
    } catch {
      toast({ title: "Failed to send payment link", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-1.5">
          <CreditCard className="w-3.5 h-3.5" /> Payment Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Send Payment Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            {sending ? "Sending..." : "Send Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [deliveryPref, setDeliveryPref] = useState("specific_date");
  const [deliveryPhotos, setDeliveryPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSendingContract, setIsSendingContract] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [salesNotes, setSalesNotes] = useState("");
  const [customerIntent, setCustomerIntent] = useState("");

  // Commercial status
  const [commercialStatus, setCommercialStatus] = useState<CommercialStatus>({
    quoteSent: false, contractStatus: null, contractSentAt: null,
    paymentStatus: null, paymentSentAt: null, orderCreated: false, orderId: null,
  });

  useEffect(() => {
    if (id) {
      fetchQuote();
      fetchCommercialStatus();
    }
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

      if (data.preferred_delivery_window === "asap") setDeliveryPref("asap");
      else if (data.preferred_delivery_window === "flexible") setDeliveryPref("flexible");
      else if (data.preferred_delivery_window === "call_to_confirm") setDeliveryPref("call_to_confirm");
      else if (data.delivery_date) setDeliveryPref("specific_date");
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading quote", variant: "destructive" });
      navigate("/sales/quotes");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCommercialStatus() {
    try {
      const [outboundRes, contractsRes, paymentsRes, quoteDataRes] = await Promise.all([
        supabase.from("outbound_quotes")
          .select("id, status, created_at")
          .eq("quote_id", id!)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase.from("quote_contracts")
          .select("id, status, created_at")
          .eq("quote_id", id!)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase.from("payment_requests" as "orders")
          .select("id, status, created_at" as "*")
          .eq("quote_id" as "id", id!)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase.from("quotes")
          .select("order_id")
          .eq("id", id!)
          .single(),
      ]);

      const outbound = outboundRes.data;
      const contracts = contractsRes.data;
      const payments = (paymentsRes.data || []) as unknown as { id: string; status: string; created_at: string }[];

      setCommercialStatus({
        quoteSent: outbound && outbound.length > 0 && outbound[0].status !== "draft",
        contractStatus: contracts && contracts.length > 0 ? contracts[0].status : null,
        contractSentAt: contracts && contracts.length > 0 ? contracts[0].created_at : null,
        paymentStatus: payments.length > 0 ? payments[0].status : null,
        paymentSentAt: payments.length > 0 ? payments[0].created_at : null,
        orderCreated: !!quoteDataRes.data?.order_id,
        orderId: quoteDataRes.data?.order_id || null,
      });
    } catch (err) {
      console.error("Failed to fetch commercial status", err);
    }
  }

  async function handleSave() {
    if (!id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .update({
          delivery_date: deliveryPref === "specific_date" && deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : null,
          delivery_address: deliveryAddress || null,
          delivery_instructions: deliveryInstructions || null,
          delivery_time_window: deliveryTimeWindow || null,
          billing_instructions: billingInstructions || null,
          delivery_photos: deliveryPhotos,
          user_selected_size_yards: selectedSize ? Number(selectedSize) : null,
          scheduling_notes: salesNotes || null,
          preferred_delivery_window: deliveryPref !== "specific_date" ? deliveryPref : null,
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
        fetchCommercialStatus();
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
        fetchCommercialStatus();
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
      fetchCommercialStatus();
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
  const readiness = getReadiness(quote, deliveryDate, deliveryAddress, deliveryPref);

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-4 px-4 sm:px-0 pb-24 sm:pb-8">
      {/* ─── HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/sales/quotes")}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 flex-wrap">
              Quote {quote.display_id || quote.id.slice(0, 8)}
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Created {format(new Date(quote.created_at), "PPP")}
              {quote.project_type && <> · <span className="capitalize">{quote.project_type}</span></>}
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

      {/* ─── READINESS BADGE ─────────────────────────────── */}
      <ReadinessBadge level={readiness.level} label={readiness.label} missing={readiness.missing} />

      {/* ─── QUICK CONTACT (mobile-first) ────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {quote.customer_phone && (
          <>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`tel:${quote.customer_phone}`}><Phone className="w-3.5 h-3.5" /> Call</a>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`sms:${quote.customer_phone}`}><MessageSquare className="w-3.5 h-3.5" /> SMS</a>
            </Button>
          </>
        )}
        {quote.customer_email && (
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={`mailto:${quote.customer_email}`}><Mail className="w-3.5 h-3.5" /> Email</a>
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* ─── A. CUSTOMER INFORMATION ─────────────────── */}
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
                <p className="font-medium">{quote.customer_name || <span className="text-destructive">— Missing</span>}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Company</p>
                <p className="font-medium">{quote.company_name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="font-medium">{quote.customer_phone || <span className="text-destructive">— Missing</span>}</p>
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
          </CardContent>
        </Card>

        {/* ─── B. SERVICE ADDRESS ──────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Service Address
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
              <Label className="text-xs text-muted-foreground">Access / Placement Notes</Label>
              <Textarea
                placeholder="Gate code, placement instructions, access notes..."
                value={deliveryInstructions}
                onChange={e => setDeliveryInstructions(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── C. JOB DETAILS ─────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" /> Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Project Type</p>
                <p className="font-medium capitalize">{quote.project_type || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Material Type</p>
                <p className="font-medium capitalize">{quote.material_type || <span className="text-destructive">— Missing</span>}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Material Class</p>
                <p className="font-medium">{quote.heavy_material_class || (quote.is_heavy_material ? "Heavy" : "General")}</p>
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
                <p className="text-muted-foreground text-xs">Risk Flags</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {quote.is_heavy_material && <Badge variant="outline" className="text-[10px]">Heavy</Badge>}
                  {quote.is_trash_contaminated && <Badge variant="outline" className="text-[10px] text-amber-700">Contamination</Badge>}
                  {!quote.is_heavy_material && !quote.is_trash_contaminated && <span className="font-medium">None</span>}
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Dumpster Size (yards)</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className={cn(!selectedSize && "border-destructive")}>
                  <SelectValue placeholder="Select size..." />
                </SelectTrigger>
                <SelectContent>
                  {DUMPSTER_SIZES.map(s => (
                    <SelectItem key={s} value={String(s)}>
                      {s} Yard {s === quote.recommended_size_yards ? "(Recommended)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedSize && (
                <p className="text-xs text-destructive font-medium">⚠ Size is required before scheduling</p>
              )}
              {quote.recommended_size_yards && selectedSize && Number(selectedSize) !== quote.recommended_size_yards && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠ AI recommended {quote.recommended_size_yards}yd
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── E. DELIVERY READINESS ──────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4" /> Delivery Preference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Preference</Label>
              <Select value={deliveryPref} onValueChange={setDeliveryPref}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_PREFERENCES.map(dp => (
                    <SelectItem key={dp.value} value={dp.value}>{dp.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {deliveryPref === "specific_date" && (
              <>
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
              </>
            )}

            {deliveryPref !== "specific_date" && (
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-sm text-muted-foreground">
                  {deliveryPref === "asap" && "Customer wants earliest available delivery. Contact to confirm exact date."}
                  {deliveryPref === "flexible" && "Customer is flexible this week. Assign based on route optimization."}
                  {deliveryPref === "call_to_confirm" && "Customer requested a callback to confirm date and time."}
                </p>
              </div>
            )}

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

      {/* ─── D. PRICING SUMMARY (full width) ──────────── */}
      <PricingBreakdown quote={quote} />

      {/* ─── TRUST COPY ────────────────────────────────── */}
      <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-1.5">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-foreground font-medium">Need help confirming details?</p>
            <p className="text-xs text-muted-foreground">
              Our team can review your quote with you before scheduling. No hidden fees — the price shown includes delivery, pickup, and standard rental.
            </p>
          </div>
        </div>
      </div>

      {/* ─── NEXT BEST ACTION ──────────────────────────── */}
      <NextBestActionCard
        quote={quote}
        readiness={readiness}
        commercialStatus={commercialStatus}
        deliveryPref={deliveryPref}
        deliveryDate={deliveryDate}
        selectedSize={selectedSize}
        onResend={handleResend}
        onSendContract={handleSendContract}
        onMarkConverted={handleMarkConverted}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {/* ─── F. COMMERCIAL STATUS ───────────────────── */}
        <CommercialStatusCard status={commercialStatus} />

        {/* ─── RECOMMENDED SCRIPT ────────────────────── */}
        <QuoteScriptWidget quote={quote} />
      </div>

      {/* ─── SALES ACTIONS ─────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4" /> Sales Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleResend} disabled={isResending}>
              <Send className="w-3.5 h-3.5" /> Send Quote
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleSendContract} disabled={isSendingContract}>
              <ScrollText className="w-3.5 h-3.5" /> Send Contract
            </Button>
            <SendPaymentDialog
              quoteId={id!}
              customerId={quote.customer_id}
              customerPhone={quote.customer_phone}
              amount={quote.subtotal || 0}
              onSent={fetchCommercialStatus}
            />
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => navigate(`/sales/orders/new?quoteId=${id}`)}>
              <FileText className="w-3.5 h-3.5" /> Create Order
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-1.5" disabled title="Coming soon">
              <Truck className="w-3.5 h-3.5" /> Schedule Delivery
            </Button>
            <AddNoteDialog
              quoteId={id!}
              customerId={quote.customer_id}
              onAdded={() => toast({ title: "Note saved to timeline" })}
            />
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => navigate(`/sales/quotes/${id}`)}>
              <Pencil className="w-3.5 h-3.5" /> Edit Quote
            </Button>
            {quote.status !== "converted" && (
              <Button size="sm" className="w-full gap-1.5" onClick={handleMarkConverted}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Convert
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* ─── SALES NOTES ────────────────────────────── */}
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

        {/* ─── PHOTOS ────────────────────────────────── */}
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

      {/* ─── MOBILE STICKY SAVE BAR ─────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t border-border p-3 flex gap-2 z-50 safe-area-pb">
        <Button className="flex-1 gap-1.5" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
        {quote.customer_phone && (
          <Button variant="outline" size="icon" asChild>
            <a href={`tel:${quote.customer_phone}`}><Phone className="w-4 h-4" /></a>
          </Button>
        )}
        {quote.customer_phone && (
          <Button variant="outline" size="icon" asChild>
            <a href={`sms:${quote.customer_phone}`}><MessageSquare className="w-4 h-4" /></a>
          </Button>
        )}
      </div>
    </div>
  );
}
