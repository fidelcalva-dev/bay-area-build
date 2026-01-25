import { useState, useEffect } from 'react';
import { Phone, PhoneOff, User, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPhoneDisplay } from '@/lib/phoneUtils';
import type { CallEvent } from '@/hooks/useTelephony';

interface IncomingCallModalProps {
  call: CallEvent | null;
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({ call, onAnswer, onDecline }: IncomingCallModalProps) {
  const [ringCount, setRingCount] = useState(0);

  useEffect(() => {
    if (!call) {
      setRingCount(0);
      return;
    }

    const interval = setInterval(() => {
      setRingCount((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [call]);

  if (!call) return null;

  const callerName = call.caller_name || call.contact?.full_name || 'Unknown Caller';
  const callerNumber = formatPhoneDisplay(call.from_number);

  return (
    <Dialog open={!!call} onOpenChange={() => onDecline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Incoming Call
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Caller Info */}
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{callerName}</h3>
            <p className="text-muted-foreground">{callerNumber}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ringing... ({ringCount}s)
            </p>
          </div>

          {/* Contact/Order Info */}
          {(call.contact || call.order) && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              {call.contact && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Existing Customer: {call.contact.full_name}
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    Customer
                  </Badge>
                </div>
              )}
              {call.order && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Order: {call.order.id.slice(0, 8)}...
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {call.order.status}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onDecline}
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              variant="default"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onAnswer}
            >
              <Phone className="w-4 h-4 mr-2" />
              Answer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
