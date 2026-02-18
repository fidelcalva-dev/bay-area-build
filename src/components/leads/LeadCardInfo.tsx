import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Eye, EyeOff, Loader2, Save, Lock } from "lucide-react";
import { toast } from "sonner";

interface LeadCardInfoProps {
  leadId: string;
}

interface CardData {
  id: string;
  card_holder_name: string | null;
  card_number: string;
  card_last_four: string;
  expiration_month: number;
  expiration_year: number;
  cvv: string;
  card_brand: string | null;
  can_view_full: boolean;
}

function detectCardBrand(num: string): string {
  const clean = num.replace(/\D/g, "");
  if (/^4/.test(clean)) return "Visa";
  if (/^5[1-5]/.test(clean)) return "Mastercard";
  if (/^3[47]/.test(clean)) return "Amex";
  if (/^6(?:011|5)/.test(clean)) return "Discover";
  return "Other";
}

export default function LeadCardInfo({ leadId }: LeadCardInfoProps) {
  const { user } = useAdminAuth();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    fetchCard();
  }, [leadId]);

  const fetchCard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lead_card_info_view" as any)
      .select("*")
      .eq("lead_id", leadId)
      .maybeSingle();

    if (!error && data) {
      setCardData(data as unknown as CardData);
    } else {
      setCardData(null);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const cleanNumber = cardNumber.replace(/\D/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      toast.error("Número de tarjeta inválido");
      return;
    }
    const month = parseInt(expMonth);
    const year = parseInt(expYear);
    if (month < 1 || month > 12) {
      toast.error("Mes de vigencia inválido");
      return;
    }
    if (year < 25 || year > 40) {
      toast.error("Año de vigencia inválido (use 2 dígitos, ej: 27)");
      return;
    }
    const cleanCvv = cvv.replace(/\D/g, "");
    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      toast.error("CVV inválido");
      return;
    }
    if (!user) return;

    setSaving(true);
    const lastFour = cleanNumber.slice(-4);
    const brand = detectCardBrand(cleanNumber);

    const { error } = await supabase.from("lead_card_info").upsert(
      {
        lead_id: leadId,
        card_holder_name: holderName.trim() || null,
        card_number_encrypted: cleanNumber,
        card_last_four: lastFour,
        expiration_month: month,
        expiration_year: 2000 + year,
        cvv_encrypted: cleanCvv,
        card_brand: brand,
        added_by: user.id,
      },
      { onConflict: "lead_id" }
    );

    if (error) {
      toast.error("Error al guardar tarjeta");
      console.error(error);
    } else {
      toast.success("Tarjeta guardada");
      setShowForm(false);
      setCardNumber("");
      setCvv("");
      fetchCard();
    }
    setSaving(false);
  };

  const formatCardDisplay = (num: string) => {
    return num.replace(/(.{4})/g, "$1 ").trim();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Card Info
          {cardData && !cardData.can_view_full && (
            <Badge variant="secondary" className="text-xs ml-auto">
              <Lock className="w-3 h-3 mr-1" /> Restricted
            </Badge>
          )}
          {cardData?.can_view_full && (
            <Badge variant="outline" className="text-xs ml-auto text-green-700 border-green-300">
              <Eye className="w-3 h-3 mr-1" /> Full Access
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {cardData && !showForm ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Titular</span>
              <span>{cardData.card_holder_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Número</span>
              <span className="font-mono">{formatCardDisplay(cardData.card_number)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vigencia</span>
              <span>
                {String(cardData.expiration_month).padStart(2, "0")}/
                {String(cardData.expiration_year).slice(-2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CVV</span>
              <span className="font-mono">{cardData.cvv}</span>
            </div>
            {cardData.card_brand && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marca</span>
                <Badge variant="outline">{cardData.card_brand}</Badge>
              </div>
            )}
            {cardData.can_view_full && (
              <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => {
                setHolderName(cardData.card_holder_name || "");
                setCardNumber(cardData.card_number.replace(/[*-\s]/g, ""));
                setExpMonth(String(cardData.expiration_month));
                setExpYear(String(cardData.expiration_year).slice(-2));
                setCvv(cardData.cvv === "***" ? "" : cardData.cvv);
                setShowForm(true);
              }}>
                Actualizar Tarjeta
              </Button>
            )}
          </>
        ) : showForm || !cardData ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Nombre del Titular</Label>
              <Input
                placeholder="John Doe"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Número de Tarjeta</Label>
              <Input
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))}
                maxLength={19}
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Mes</Label>
                <Input
                  placeholder="MM"
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  maxLength={2}
                  className="text-center"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Año</Label>
                <Input
                  placeholder="YY"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  maxLength={2}
                  className="text-center"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CVV</Label>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  type="password"
                  className="text-center"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Guardar
              </Button>
              {(cardData || showForm) && (
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {!cardData && !showForm && (
          <Button size="sm" variant="outline" className="w-full" onClick={() => setShowForm(true)}>
            <CreditCard className="w-4 h-4 mr-1" /> Agregar Tarjeta
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
