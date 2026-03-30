import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CleanupAnnouncementCapture() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({ title: 'Ingresa tu teléfono', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'CLEANUP_WEBSITE',
          source_page: '/',
          source_module: 'cleanup_announcement_strip',
          brand: 'CALSAN_CD_WASTE_REMOVAL',
          service_line: 'CLEANUP',
          lead_intent: 'QUOTE_REQUEST',
          name: name.trim() || null,
          phone: phone.trim(),
          message: 'Interested in construction cleanup services — from homepage announcement.',
          raw_payload: {
            entry_point: 'homepage_cleanup_announcement',
          },
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: 'Info received! Our team will reach out shortly.' });
    } catch (err) {
      console.error('Cleanup announcement lead error:', err);
      toast({ title: 'Error submitting — please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-accent/10 border-b border-accent/20">
        <div className="container-wide py-3 flex items-center justify-center gap-2 text-center">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-foreground">
            Thanks! Our cleanup team will contact you soon.
          </p>
          <Link to="/cleanup" className="text-xs font-semibold text-primary hover:underline ml-2">
            Learn More →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent/10 border-b border-accent/20">
      <div className="container-wide py-3 flex flex-col lg:flex-row items-center justify-between gap-3 text-center lg:text-left">
        <div className="shrink-0">
          <p className="text-sm font-semibold text-foreground">
            <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded mr-2">NEW</span>
            Construction Cleanup Division Now Available
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Calsan C&D Waste Removal — active jobsites, final cleanups, demolition debris & recurring contractor cleanup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-sm w-full sm:w-36 bg-card"
          />
          <Input
            type="tel"
            placeholder="Phone number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="h-9 text-sm w-full sm:w-40 bg-card"
          />
          <Button type="submit" size="sm" disabled={loading} className="h-9 text-xs font-bold whitespace-nowrap">
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Get Info
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </form>

        <div className="flex gap-2 shrink-0">
          <Link to="/cleanup" className="text-xs font-semibold text-primary hover:underline">Learn More →</Link>
          <Link to="/cleanup/quote" className="text-xs font-semibold text-accent hover:underline">Get Cleanup Quote →</Link>
        </div>
      </div>
    </div>
  );
}
