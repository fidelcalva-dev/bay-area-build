import { useState, useEffect } from 'react';
import { getEventLog, type GA4EventLogEntry } from '@/lib/analytics/ga4';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bug } from 'lucide-react';

const CONVERSION_EVENTS = ['quote_submitted', 'schedule_selected', 'payment_completed', 'click_call'];

export default function GA4DebugPanel() {
  const [events, setEvents] = useState<GA4EventLogEntry[]>([]);

  const refresh = () => setEvents(getEventLog());

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout title="GA4 Debug Panel" hideChat>
      <div className="container-wide py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bug className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">GA4 Event Debug</h1>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Last {events.length} events fired in this session. Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs">?ga_debug=1</code> to any URL to see console logs.
        </p>

        {events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No events captured yet</p>
            <p className="text-sm mt-1">Navigate the site to trigger events</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((evt, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">{evt.eventName}</span>
                    {CONVERSION_EVENTS.includes(evt.eventName) && (
                      <Badge variant="default" className="text-[10px]">CONVERSION</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(evt.params, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
