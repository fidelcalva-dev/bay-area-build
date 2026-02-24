import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Save, Loader2, Calendar, MapPin, Clock, 
  FileText, Camera, Trash2, ImageIcon, Send, ScrollText, CreditCard
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sendOutboundQuote, createOutboundQuote, getIncludedTonsText } from "@/services/outboundQuoteService";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  saved: { label: "Saved", color: "bg-blue-100 text-blue-800" },
  pinned: { label: "Pinned", color: "bg-purple-100 text-purple-800" },
  scheduled: { label: "Scheduled", color: "bg-green-100 text-green-800" },
  converted: { label: "Converted", color: "bg-emerald-100 text-emerald-800" },
  expired: { label: "Expired", color: "bg-red-100 text-red-800" },
};

const TIME_WINDOWS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "Any time",
];

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

      // Populate editable fields
      if (data.delivery_date) setDeliveryDate(new Date(data.delivery_date + "T00:00:00"));
      setDeliveryAddress(data.delivery_address || "");
      setDeliveryInstructions(data.delivery_instructions || "");
      setDeliveryTimeWindow(data.delivery_time_window || "");
      setBillingInstructions(data.billing_instructions || "");
      setDeliveryPhotos(data.delivery_photos || []);
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
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Quote updated successfully" });
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
      setDeliveryPhotos((prev) => [...prev, ...newPhotos]);
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
    setDeliveryPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleResend() {
    if (!quote) return;
    setIsResending(true);
    try {
      // Check for existing outbound quote linked to this quote
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
        // Create a new outbound quote from this quote's data
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

      // Determine channels
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
        const channels = (data.channels as string[]) || [];
        toast({ title: `Contract sent via ${channels.join(" & ").toUpperCase() || "pending"}` });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) return null;

  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {quote.customer_name || "No name"} · {quote.customer_phone || "No phone"} · {quote.zip_code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSendContract} disabled={isSendingContract}>
            {isSendingContract ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScrollText className="w-4 h-4 mr-2" />}
            Send Contract
          </Button>
          <Button variant="outline" onClick={handleResend} disabled={isResending}>
            {isResending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Reenviar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      {/* Quote Summary (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" /> Quote Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Material</p>
              <p className="font-medium">{quote.material_type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-medium">{quote.user_selected_size_yards || quote.recommended_size_yards || "—"} yd</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rental</p>
              <p className="font-medium">{quote.rental_days} days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimate</p>
              <p className="font-medium">${quote.estimated_min?.toFixed(0)} – ${quote.estimated_max?.toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Delivery Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delivery Date */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
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
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Window */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Time Window
            </Label>
            <Select value={deliveryTimeWindow} onValueChange={setDeliveryTimeWindow}>
              <SelectTrigger>
                <SelectValue placeholder="Select time window..." />
              </SelectTrigger>
              <SelectContent>
                {TIME_WINDOWS.map((tw) => (
                  <SelectItem key={tw} value={tw}>{tw}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Full Delivery Address
            </Label>
            <Textarea
              placeholder="Enter full delivery address..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={2}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <Label>Delivery Instructions</Label>
            <Textarea
              placeholder="Gate code, placement instructions, special notes..."
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows={3}
            />
          </div>

          {/* Billing Instructions */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Billing Instructions
            </Label>
            <Textarea
              placeholder="Card on file info, billing contact, PO number, payment method notes..."
              value={billingInstructions}
              onChange={(e) => setBillingInstructions(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Payment method, card details, or billing contact for this order.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4" /> Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Attach photos of the property, driveway, or customer ID for reference.
          </p>

          {/* Photo Grid */}
          {deliveryPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {deliveryPhotos.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover" />
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

          {/* Upload Button */}
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
            {uploadingPhoto ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4 mr-2" />
            )}
            {uploadingPhoto ? "Uploading..." : "Add Photos"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
