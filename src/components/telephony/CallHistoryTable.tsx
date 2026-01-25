import { useState } from 'react';
import { format } from 'date-fns';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Voicemail, Clock, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPhoneDisplay } from '@/lib/phoneUtils';

interface CallRecord {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  from_number: string;
  to_number: string;
  call_status: string;
  duration_seconds: number;
  caller_name: string | null;
  started_at: string;
  notes: string | null;
  contact?: { full_name: string | null } | null;
}

interface CallHistoryTableProps {
  calls: CallRecord[];
  onCallBack: (phoneNumber: string) => void;
  onViewDetails: (callId: string) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Phone }> = {
  COMPLETED: { label: 'Completed', variant: 'default', icon: Phone },
  ANSWERED: { label: 'In Progress', variant: 'secondary', icon: Phone },
  RINGING: { label: 'Ringing', variant: 'outline', icon: Phone },
  MISSED: { label: 'Missed', variant: 'destructive', icon: PhoneMissed },
  VOICEMAIL: { label: 'Voicemail', variant: 'secondary', icon: Voicemail },
  FAILED: { label: 'Failed', variant: 'destructive', icon: PhoneMissed },
};

export function CallHistoryTable({ calls, onCallBack, onViewDetails }: CallHistoryTableProps) {
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDirectionIcon = (direction: string, status: string) => {
    if (status === 'MISSED') return PhoneMissed;
    if (status === 'VOICEMAIL') return Voicemail;
    return direction === 'INBOUND' ? PhoneIncoming : PhoneOutgoing;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No calls yet
            </TableCell>
          </TableRow>
        ) : (
          calls.map((call) => {
            const Icon = getDirectionIcon(call.direction, call.call_status);
            const statusInfo = statusConfig[call.call_status] || statusConfig.COMPLETED;
            const phoneNumber = call.direction === 'INBOUND' ? call.from_number : call.to_number;
            const callerName = call.caller_name || call.contact?.full_name;

            return (
              <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetails(call.id)}>
                <TableCell>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    call.direction === 'INBOUND' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {callerName ? (
                      <>
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{callerName}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Unknown</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatPhoneDisplay(phoneNumber)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDuration(call.duration_seconds)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(call.started_at), 'MMM d, h:mm a')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallBack(phoneNumber);
                    }}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
