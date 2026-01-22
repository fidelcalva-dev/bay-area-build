import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle2, Loader2, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logOrderEvent, logScheduleChange } from '@/lib/orderEventService';
import { useOfficeStatus } from '@/hooks/useOfficeStatus';
import { ContractBlocker } from '@/components/contracts';

interface Order {
  id: string;
  status: string;
  customer_id?: string | null;
  contracts_valid?: boolean;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  quotes?: {
    customer_name: string | null;
    customer_phone: string | null;
    customer_email?: string | null;
    delivery_address: string | null;
    rental_days?: number;
  };
}

interface Props {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmed: () => void;
}

const WINDOWS = [
  { value: 'morning', label: 'Morning (7-11 AM)' },
  { value: 'midday', label: 'Midday (11 AM-3 PM)' },
  { value: 'afternoon', label: 'Afternoon (3-6 PM)' },
];

export function ScheduleConfirmationDialog({ order, open, onOpenChange, onConfirmed }: Props) {
  const { toast } = useToast();
  const { isOpen: isOfficeOpen } = useOfficeStatus();
  
  // Contract validation state
  const [contractBlockers, setContractBlockers] = useState<string[]>([]);
  const [pendingContractId, setPendingContractId] = useState<string | null>(null);
  const [isSendingContract, setIsSendingContract] = useState(false);
  
  // Initialize with existing values or defaults
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    order.scheduled_delivery_date ? new Date(order.scheduled_delivery_date) : undefined
  );
  const [deliveryWindow, setDeliveryWindow] = useState<string>(
    order.scheduled_delivery_window || 'morning'
  );
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    order.scheduled_pickup_date ? new Date(order.scheduled_pickup_date) : undefined
  );
  const [pickupWindow, setPickupWindow] = useState<string>(
    order.scheduled_pickup_window || 'morning'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAfterHours = !isOfficeOpen;
  const hasContractBlockers = contractBlockers.length > 0;

  // Check contract status when dialog opens
  useEffect(() => {
    if (open && order.customer_id) {
      checkContractStatus();
    }
  }, [open, order.customer_id]);

  async function checkContractStatus() {
    if (!order.customer_id) return;

    const blockers: string[] = [];

    // Use type assertion to work around generated types not including contracts table yet
    const contractsTable = (supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> }).from('contracts');

    // Check for signed MSA
    const { data: signedMsa } = await contractsTable
      .select('id')
      .eq('customer_id', order.customer_id)
      .eq('contract_type', 'msa')
      .eq('status', 'signed')
      .limit(1)
      .single();

    if (!signedMsa) {
      blockers.push('Master Service Agreement signature required');
      
      // Get pending MSA for send button
      const { data: pendingMsa } = await contractsTable
        .select('id')
        .eq('customer_id', order.customer_id)
        .eq('contract_type', 'msa')
        .eq('status', 'pending')
        .limit(1)
        .single();
      
      if (pendingMsa) {
        setPendingContractId((pendingMsa as { id: string }).id);
      }
    }

    // Check for signed addendum for this address
    const serviceAddress = order.quotes?.delivery_address;
    if (serviceAddress) {
      const normalizedAddress = serviceAddress.toLowerCase().trim().replace(/\s+/g, ' ');
      
      const { data: signedAddendum } = await contractsTable
        .select('id')
        .eq('customer_id', order.customer_id)
        .eq('contract_type', 'addendum')
        .eq('status', 'signed')
        .eq('service_address_normalized', normalizedAddress)
        .limit(1)
        .single();

      if (!signedAddendum) {
        blockers.push('Service Addendum required for this address');
        
        // Get pending addendum
        const { data: pendingAddendum } = await contractsTable
          .select('id')
          .eq('customer_id', order.customer_id)
          .eq('contract_type', 'addendum')
          .eq('status', 'pending')
          .eq('service_address_normalized', normalizedAddress)
          .limit(1)
          .single();
        
        if (pendingAddendum) {
          setPendingContractId((pendingAddendum as { id: string }).id);
        }
      }
    }

    setContractBlockers(blockers);
  }

  async function handleSendContract(method: 'sms' | 'email') {
    if (!pendingContractId) return;
    
    setIsSendingContract(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.functions.invoke('send-contract', {
        body: {
          contractId: pendingContractId,
          method,
          phone: order.quotes?.customer_phone,
          email: order.quotes?.customer_email,
          actorId: user?.id,
          actorRole: 'cs',
        },
      });

      toast({ 
        title: 'Contract sent', 
        description: `Contract request sent via ${method.toUpperCase()}` 
      });
    } catch (err) {
      toast({ 
        title: 'Failed to send contract', 
        variant: 'destructive' 
      });
    } finally {
      setIsSendingContract(false);
    }
  }

  async function handleConfirm() {
    // Block if contracts not valid
    if (hasContractBlockers) {
      toast({ 
        title: 'Cannot confirm schedule', 
        description: 'Contract signatures are required before scheduling.',
        variant: 'destructive' 
      });
      return;
    }

    if (!deliveryDate || !deliveryWindow) {
      toast({ title: 'Please select delivery date and window', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryDateStr = format(deliveryDate, 'yyyy-MM-dd');
      const pickupDateStr = pickupDate ? format(pickupDate, 'yyyy-MM-dd') : null;

      // 1. Update order status to scheduled_confirmed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'scheduled_confirmed',
          scheduled_delivery_date: deliveryDateStr,
          scheduled_delivery_window: deliveryWindow,
          scheduled_pickup_date: pickupDateStr,
          scheduled_pickup_window: pickupWindow || null,
        } as Record<string, unknown>)
        .eq('id', order.id);

      if (updateError) throw updateError;

      // 2. Log to order_events
      await logOrderEvent({
        orderId: order.id,
        eventType: 'SCHEDULE_CONFIRMED',
        message: `Schedule confirmed: Delivery ${deliveryDateStr} (${deliveryWindow})${pickupDateStr ? `, Pickup ${pickupDateStr} (${pickupWindow})` : ''}`,
        beforeJson: {
          status: order.status,
          delivery_date: order.scheduled_delivery_date,
          delivery_window: order.scheduled_delivery_window,
          pickup_date: order.scheduled_pickup_date,
          pickup_window: order.scheduled_pickup_window,
        },
        afterJson: {
          status: 'scheduled_confirmed',
          delivery_date: deliveryDateStr,
          delivery_window: deliveryWindow,
          pickup_date: pickupDateStr,
          pickup_window: pickupWindow,
        },
      });

      // 3. Log to schedule_logs
      await logScheduleChange({
        orderId: order.id,
        action: 'confirmed',
        oldDate: order.scheduled_delivery_date,
        oldWindow: order.scheduled_delivery_window,
        newDate: deliveryDateStr,
        newWindow: deliveryWindow,
        reason: 'CS confirmed schedule',
      });

      // 4. Send confirmation SMS
      if (order.quotes?.customer_phone) {
        const { error: smsError } = await supabase.functions.invoke('send-schedule-confirmation', {
          body: {
            orderId: order.id,
            customerPhone: order.quotes.customer_phone,
            customerName: order.quotes.customer_name,
            deliveryDate: deliveryDateStr,
            deliveryWindow: deliveryWindow,
            pickupDate: pickupDateStr,
            pickupWindow: pickupWindow,
            language: 'en',
          },
        });

        if (smsError) {
          console.error('SMS error:', smsError);
          toast({ 
            title: 'Schedule confirmed but SMS failed', 
            description: 'Customer was not notified. Please contact manually.',
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Schedule confirmed ✅', 
            description: 'Customer has been notified via SMS.' 
          });
        }
      } else {
        toast({ 
          title: 'Schedule confirmed', 
          description: 'No phone number - customer not notified.' 
        });
      }

      onConfirmed();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Confirmation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({ 
        title: 'Failed to confirm schedule', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Confirm Schedule
          </DialogTitle>
          <DialogDescription>
            Confirm delivery and pickup times. Customer will receive an SMS notification.
          </DialogDescription>
        </DialogHeader>

        {/* Contract Blocker Alert */}
        {hasContractBlockers && (
          <ContractBlocker
            blockers={contractBlockers}
            onSendSMS={() => handleSendContract('sms')}
            onSendEmail={() => handleSendContract('email')}
            isSending={isSendingContract}
          />
        )}

        {isAfterHours && !hasContractBlockers && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>After hours confirmation. SMS will still be sent.</span>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Customer info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{order.quotes?.customer_name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{order.quotes?.customer_phone}</p>
            <p className="text-sm text-muted-foreground truncate">{order.quotes?.delivery_address}</p>
          </div>

          {/* Delivery Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Delivery Date <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !deliveryDate && 'text-muted-foreground'
                  )}
                >
                  {deliveryDate ? format(deliveryDate, 'EEEE, MMM d, yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Delivery Window */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Delivery Window <span className="text-destructive">*</span>
            </Label>
            <Select value={deliveryWindow} onValueChange={setDeliveryWindow}>
              <SelectTrigger>
                <SelectValue placeholder="Select window" />
              </SelectTrigger>
              <SelectContent>
                {WINDOWS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pickup Date (optional) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Pickup Date
              <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !pickupDate && 'text-muted-foreground'
                  )}
                >
                  {pickupDate ? format(pickupDate, 'EEEE, MMM d, yyyy') : 'Select date (optional)'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={pickupDate}
                  onSelect={setPickupDate}
                  disabled={(date) => date < (deliveryDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Pickup Window */}
          {pickupDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pickup Window
              </Label>
              <Select value={pickupWindow} onValueChange={setPickupWindow}>
                <SelectTrigger>
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  {WINDOWS.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || !deliveryDate || hasContractBlockers}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Confirm & Send SMS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
