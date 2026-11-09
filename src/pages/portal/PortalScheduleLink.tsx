// CAL 010 — Customer schedule page opened from a secure link (/portal/schedule?t=...).
// Opening the page only reads a summary. The order is created only after the
// customer reviews the details and presses "Confirm order". Retrying returns the
// same order. The link authorizes this quote only; it does not prove identity.
import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, Clock, Loader2, Phone, Truck, AlertCircle, Sun, Sunrise, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { BUSINESS_INFO } from '@/lib/seo';
import logoCalsan from '@/assets/logo-calsan.webp';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quote-schedule-link`;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const WINDOWS = [
  { id: 'morning', label: 'Morning', time: '8 AM - 12 PM', Icon: Sunrise },
  { id: 'midday', label: 'Midday', time: '12 PM - 3 PM', Icon: Sun },
  { id: 'afternoon', label: 'Afternoon', time: '3 PM - 6 PM', Icon: Sunset },
] as const;

interface Preview {
  expires_at: string;
  confirmed: boolean;
  order_id: string | null;
  requested_delivery_date: string | null;
  requested_delivery_window: string | null;
  earliest_date: string;
  quote: {
    first_name: string | null;
    size_yards: number | null;
    material_type: string | null;
    delivery_address: string | null;
    zip_code: string | null;
    subtotal: number | null;
    rental_days: number | null;
  };
}

async function callLink(body: Record<string, unknown>) {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const LINK_ERRORS: Record<string, string> = {
  link_expired: 'This scheduling link has expired.',
  link_revoked: 'This scheduling link is no longer active.',
  invalid_link: 'This scheduling link is not valid.',
};

// Business days from a YYYY-MM-DD start (Sundays skipped), as YYYY-MM-DD strings.
function businessDays(startIso: string, count: number): string[] {
  const out: string[] = [];
  const d = new Date(`${startIso}T12:00:00Z`);
  while (out.length < count) {
    if (d.getUTCDay() !== 0) out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function formatDay(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}

export default function PortalScheduleLink({ token }: { token: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<string | null>(null);
  const [win, setWin] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ orderId: string; date: string | null; window: string | null } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await callLink({ action: 'preview', token });
        if (!alive) return;
        if (!r.ok) {
          setLoadError(LINK_ERRORS[r.data?.code] || 'We could not load this link right now. Please try again.');
          return;
        }
        setPreview(r.data as Preview);
        if (r.data.confirmed && r.data.order_id) {
          setResult({ orderId: r.data.order_id, date: r.data.requested_delivery_date, window: r.data.requested_delivery_window });
        }
      } catch {
        if (alive) setLoadError('We could not load this link right now. Please check your connection and try again.');
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const days = useMemo(() => (preview ? businessDays(preview.earliest_date, 14) : []), [preview]);

  const confirm = async () => {
    if (!date || !win || !agreed) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await callLink({ action: 'confirm', token, delivery_date: date, delivery_window: win, confirm: true });
      if (!r.ok || !r.data?.orderId) {
        setSubmitError(LINK_ERRORS[r.data?.code] || r.data?.error || 'We could not confirm your order. Please try again or call us.');
        return;
      }
      setResult({ orderId: r.data.orderId, date: r.data.delivery_date ?? date, window: r.data.delivery_window ?? win });
    } catch {
      // Uncertain outcome: pressing the button again is safe, it returns the same order.
      setSubmitError('Connection problem. Press "Confirm order" again; you will not be charged or booked twice.');
    } finally {
      setSubmitting(false);
    }
  };

  const phone = (
    <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="inline-flex items-center gap-1 font-semibold text-primary">
      <Phone className="w-4 h-4" /> {BUSINESS_INFO.phone.salesFormatted}
    </a>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (loadError || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-3">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-foreground font-medium">{loadError}</p>
          <p className="text-sm text-muted-foreground">Call us and we will send you a new link: {phone}</p>
        </Card>
      </div>
    );
  }

  const q = preview.quote;
  const windowLabel = (id: string | null) => WINDOWS.find((w) => w.id === id)?.label ?? id ?? '';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-foreground">Schedule Delivery</p>
            <p className="text-xs text-muted-foreground">Review and confirm your order</p>
          </div>
          <img src={logoCalsan} alt="Calsan" className="h-8 w-auto rounded" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {q.size_yards ? `${q.size_yards} Yard Dumpster` : 'Dumpster rental'}
                  </p>
                  {q.first_name && <p className="text-xs text-muted-foreground">For {q.first_name}</p>}
                </div>
              </div>
              {q.subtotal != null && (
                <p className="font-bold text-foreground">${Number(q.subtotal).toLocaleString()}</p>
              )}
            </div>
            {q.delivery_address && <p className="text-xs text-muted-foreground">Delivery: {q.delivery_address}</p>}
            {q.rental_days && <p className="text-xs text-muted-foreground">{q.rental_days}-day rental</p>}
          </CardContent>
        </Card>

        {result ? (
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <p className="font-bold text-foreground text-lg">Order confirmed</p>
              <p className="text-sm text-muted-foreground">
                Reference {result.orderId.slice(0, 8).toUpperCase()}
                {result.date && <> · Requested delivery {formatDay(result.date, { weekday: 'short', month: 'short', day: 'numeric' })}</>}
                {result.window && <> ({windowLabel(result.window)})</>}
              </p>
              <p className="text-sm text-muted-foreground">
                Our team will confirm the delivery time and send your payment details. Questions? {phone}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section>
              <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Choose delivery date
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDate(d)}
                    aria-pressed={date === d}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all',
                      date === d ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/40',
                    )}
                  >
                    <p className={cn('font-semibold text-sm', date === d ? 'text-primary' : 'text-foreground')}>
                      {formatDay(d, { weekday: 'short' })}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDay(d, { month: 'short', day: 'numeric' })}</p>
                  </button>
                ))}
              </div>
            </section>

            {date && (
              <section>
                <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Preferred time window
                </h2>
                <div className="space-y-2">
                  {WINDOWS.map(({ id, label, time, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setWin(id)}
                      aria-pressed={win === id}
                      className={cn(
                        'w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left',
                        win === id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/40',
                      )}
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className={cn('font-semibold text-sm', win === id ? 'text-primary' : 'text-foreground')}>{label}</p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {date && win && (
              <label className="flex items-start gap-3 text-sm text-foreground">
                <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
                <span>
                  I reviewed the details above and want to book this dumpster for{' '}
                  {formatDay(date, { weekday: 'long', month: 'long', day: 'numeric' })} ({windowLabel(win)}).
                </span>
              </label>
            )}

            {submitError && (
              <p role="alert" className="text-sm text-destructive">{submitError}</p>
            )}

            <Button
              size="lg"
              className="w-full h-14 rounded-xl text-base font-semibold"
              disabled={!date || !win || !agreed || submitting}
              onClick={confirm}
            >
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Confirming...</> : 'Confirm order'}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Delivery times are estimated windows. We will confirm the exact time closer to your date.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
