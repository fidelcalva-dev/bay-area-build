import { useState, useEffect } from 'react';
import { Phone, PhoneOff, User, Package, Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { formatPhoneDisplay } from '@/lib/phoneUtils';
import type { CallEvent } from '@/hooks/useTelephony';

interface ActiveCallPanelProps {
  call: CallEvent;
  onEndCall: () => void;
  onSaveNotes: (notes: string) => void;
}

export function ActiveCallPanel({ call, onEndCall, onSaveNotes }: ActiveCallPanelProps) {
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState(call.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Timer
  useEffect(() => {
    const startTime = call.answered_at ? new Date(call.answered_at).getTime() : Date.now();
    
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [call.answered_at]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await onSaveNotes(notes);
    setIsSaving(false);
  };

  const callerName = call.caller_name || call.contact?.full_name || 'Unknown';
  const callerNumber = formatPhoneDisplay(
    call.direction === 'INBOUND' ? call.from_number : call.to_number
  );

  return (
    <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Active Call
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(duration)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Caller Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{callerName}</p>
            <p className="text-sm text-muted-foreground">{callerNumber}</p>
          </div>
          <Badge variant={call.direction === 'INBOUND' ? 'default' : 'secondary'}>
            {call.direction}
          </Badge>
        </div>

        {/* Contact/Order Info */}
        {(call.contact || call.order) && (
          <div className="bg-background rounded-lg p-3 space-y-2">
            {call.contact && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{call.contact.full_name}</span>
                {call.contact.billing_email && (
                  <span className="text-muted-foreground">
                    ({call.contact.billing_email})
                  </span>
                )}
              </div>
            )}
            {call.order && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>Order: {call.order.id.slice(0, 8)}...</span>
                <Badge variant="secondary" className="text-xs">
                  {call.order.status}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="w-4 h-4" />
            Call Notes
          </div>
          <Textarea
            placeholder="Add notes about this call..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveNotes}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>

        {/* End Call */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={onEndCall}
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          End Call
        </Button>
      </CardContent>
    </Card>
  );
}
