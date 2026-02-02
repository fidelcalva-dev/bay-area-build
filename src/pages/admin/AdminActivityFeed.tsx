import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TimelineView } from '@/components/timeline';
import { getActivityFeed, type TimelineEvent, type TimelineEventType } from '@/lib/timelineService';
import { supabase } from '@/integrations/supabase/client';

const QUICK_FILTERS: { label: string; types: TimelineEventType[] }[] = [
  { label: 'Calls', types: ['CALL'] },
  { label: 'Orders', types: ['ORDER', 'DISPATCH'] },
  { label: 'Deliveries', types: ['DELIVERY', 'PICKUP', 'SWAP'] },
  { label: 'Payments', types: ['PAYMENT', 'BILLING'] },
  { label: 'Overdue', types: ['OVERDUE'] },
];

export default function AdminActivityFeed() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TimelineEventType[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    const { events: data } = await getActivityFeed({
      limit: 100,
      eventTypes: activeFilter || undefined,
    });
    setEvents(data);
    setIsLoading(false);
  }, [activeFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'timeline_events',
        },
        (payload) => {
          const newEvent = payload.new as TimelineEvent;
          if (newEvent.visibility === 'INTERNAL') {
            setEvents(prev => [newEvent, ...prev].slice(0, 100));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredEvents = searchTerm
    ? events.filter(e => 
        e.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.event_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : events;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Activity Feed
          </h1>
          <p className="text-muted-foreground">Real-time view of all business activity</p>
        </div>
        <Button variant="outline" onClick={loadEvents} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Live Events</CardTitle>
              <CardDescription>
                {events.length} events loaded
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-3 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Badge
              variant={activeFilter === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveFilter(null)}
            >
              All
            </Badge>
            {QUICK_FILTERS.map(({ label, types }) => (
              <Badge
                key={label}
                variant={JSON.stringify(activeFilter) === JSON.stringify(types) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setActiveFilter(types)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <TimelineView
            events={filteredEvents}
            isLoading={isLoading}
            onRefresh={loadEvents}
            showFilters={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
