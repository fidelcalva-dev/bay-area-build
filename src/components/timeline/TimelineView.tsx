import { useState, useEffect } from 'react';
import { Loader2, History, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimelineEventItem } from './TimelineEventItem';
import type { TimelineEvent, TimelineEventType } from '@/lib/timelineService';

interface TimelineViewProps {
  events: TimelineEvent[];
  isLoading: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  title?: string;
  showFilters?: boolean;
}

const EVENT_FILTER_OPTIONS: { type: TimelineEventType; label: string }[] = [
  { type: 'CALL', label: 'Calls' },
  { type: 'SMS', label: 'SMS' },
  { type: 'EMAIL', label: 'Email' },
  { type: 'ORDER', label: 'Orders' },
  { type: 'PAYMENT', label: 'Payments' },
  { type: 'DELIVERY', label: 'Deliveries' },
  { type: 'PICKUP', label: 'Pickups' },
  { type: 'NOTE', label: 'Notes' },
];

export function TimelineView({
  events,
  isLoading,
  onRefresh,
  onLoadMore,
  hasMore,
  title = 'Timeline',
  showFilters = true,
}: TimelineViewProps) {
  const [activeFilters, setActiveFilters] = useState<TimelineEventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>(events);

  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => activeFilters.includes(e.event_type)));
    }
  }, [events, activeFilters]);

  const toggleFilter = (type: TimelineEventType) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="w-4 h-4" />
          {title}
        </h3>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {EVENT_FILTER_OPTIONS.map(({ type, label }) => (
            <Badge
              key={type}
              variant={activeFilters.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleFilter(type)}
            >
              {label}
            </Badge>
          ))}
          {activeFilters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => setActiveFilters([])}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No events to display</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
            
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <TimelineEventItem key={event.id} event={event} />
              ))}
            </div>
          </div>

          {hasMore && onLoadMore && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Load more
              </Button>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
