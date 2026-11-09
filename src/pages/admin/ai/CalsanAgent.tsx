/**
 * CAL 011 — Agente Calsan (modo consulta).
 * Read-only assistant for office staff. The server checks the role, runs only fixed
 * query tools as the signed-in user, and returns sources with a cutoff time.
 * Conversations are kept only in this screen (not stored).
 */
import { useState } from 'react';
import { Loader2, Send, Database, ShieldCheck, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

type Source = { table: string; ids: string[]; fetched_at: string; note?: string };
type Turn = { role: 'user' | 'assistant'; text: string; sources?: Source[]; cutoff?: string; error?: boolean };

const SUGGESTIONS = [
  '¿Qué órdenes recientes no tienen cliente asignado?',
  '¿Cuáles son mis tareas abiertas?',
  '¿Qué facturas tienen saldo pendiente?',
  '¿Qué conexiones están activas?',
];

const CONNECTIONS = [
  { name: 'Datos locales de la plataforma', status: 'Activo', tone: 'default' as const },
  { name: 'GoHighLevel', status: 'No verificada', tone: 'secondary' as const },
  { name: 'Authorize.net', status: 'No verificada', tone: 'secondary' as const },
  { name: 'TrashLab', status: 'Pendiente de conexión', tone: 'outline' as const },
];

function fmtTime(iso?: string) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-US', {
    timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(iso));
}

function recordLink(table: string, id: string): string | null {
  if (table === 'quotes') return `/sales/quotes/${id}`;
  if (table === 'orders') return `/admin/orders/${id}`;
  return null;
}

export default function CalsanAgent() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const history = turns.filter((t) => !t.error).map((t) => ({ role: t.role, text: t.text }));
    setTurns((prev) => [...prev, { role: 'user', text: q }]);
    setQuestion('');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calsan-agent', { body: { question: q, history } });
      if (error) {
        let msg = 'No se pudo completar la consulta.';
        try {
          const ctx = (error as { context?: Response }).context;
          const b = ctx && typeof ctx.json === 'function' ? await ctx.json() : null;
          if (b?.error) msg = b.error;
        } catch { /* keep default */ }
        setTurns((prev) => [...prev, { role: 'assistant', text: msg, error: true }]);
        return;
      }
      setTurns((prev) => [...prev, { role: 'assistant', text: data.answer, sources: data.sources, cutoff: data.cutoff }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Agente Calsan</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Modo consulta: solo lee datos que tu rol puede ver. No envía mensajes, no cobra y no cambia registros.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Link2 className="w-4 h-4" /> Fuentes de datos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {CONNECTIONS.map((c) => (
            <Badge key={c.name} variant={c.tone} className="font-normal">{c.name}: {c.status}</Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          {turns.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ejemplos:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => ask(s)} disabled={loading}>{s}</Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3" aria-live="polite">
            {turns.map((t, i) => (
              <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`rounded-lg px-3 py-2 max-w-[90%] text-sm whitespace-pre-wrap ${
                  t.role === 'user' ? 'bg-primary text-primary-foreground'
                    : t.error ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'}`}>
                  {t.text}
                  {t.sources && t.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/60 text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1"><Database className="w-3 h-3" /> Corte: {fmtTime(t.cutoff)}</div>
                      {t.sources.map((s, j) => (
                        <div key={j}>
                          Fuente: {s.table}{s.note ? ` — ${s.note}` : ''}
                          {s.ids.length > 0 && (
                            <span> · {s.ids.slice(0, 5).map((id) => {
                              const href = recordLink(s.table, id);
                              return href
                                ? <a key={id} href={href} className="underline mr-1">{id.slice(0, 8)}</a>
                                : <span key={id} className="mr-1">{id.slice(0, 8)}</span>;
                            })}{s.ids.length > 5 ? `+${s.ids.length - 5}` : ''}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Consultando…
              </div>
            )}
          </div>

          <form className="flex gap-2 items-end" onSubmit={(e) => { e.preventDefault(); ask(question); }}>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Pregunta sobre cotizaciones, órdenes, facturas o tareas…"
              aria-label="Pregunta para el Agente Calsan"
              rows={2}
              maxLength={2000}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(question); } }}
            />
            <Button type="submit" disabled={loading || !question.trim()} aria-label="Enviar pregunta">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">La conversación no se guarda al salir de esta pantalla.</p>
        </CardContent>
      </Card>
    </div>
  );
}
