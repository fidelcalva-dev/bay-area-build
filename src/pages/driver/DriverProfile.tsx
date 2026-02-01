/**
 * Driver Profile Page - Status, settings, and payouts overview
 */
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  User, Truck, DollarSign, Phone, Mail, Clock, 
  CheckCircle2, Loader2, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';

type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  is_owner_operator: boolean;
  assigned_yard_id: string | null;
  truck_type: string | null;
}

interface PayoutSummary {
  total: number;
  pending: number;
  runsCompleted: number;
}

export default function DriverProfile() {
  const { toast } = useToast();
  const { user, driverId, isOwnerOperator, signOut } = useAdminAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [status, setStatus] = useState<DriverStatus>('OFFLINE');
  const [payouts, setPayouts] = useState<PayoutSummary>({ total: 0, pending: 0, runsCompleted: 0 });

  useEffect(() => {
    if (driverId) {
      fetchDriverInfo();
      fetchStatus();
      if (isOwnerOperator) fetchPayouts();
    }
  }, [driverId, isOwnerOperator]);

  async function fetchDriverInfo() {
    if (!driverId) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', driverId)
      .maybeSingle();
    
    if (data) setDriverInfo(data as DriverInfo);
    setIsLoading(false);
  }

  async function fetchStatus() {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('agent_availability')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data?.status) setStatus(data.status as DriverStatus);
  }

  async function fetchPayouts() {
    if (!driverId) return;
    
    const { data } = await supabase
      .from('driver_payouts')
      .select('total_payout, status')
      .eq('driver_id', driverId)
      .gte('created_at', format(startOfMonth(new Date()), 'yyyy-MM-dd'))
      .lte('created_at', format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    
    if (data) {
      setPayouts({
        total: data.reduce((sum, p) => sum + (p.total_payout || 0), 0),
        pending: data.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.total_payout || 0), 0),
        runsCompleted: data.length,
      });
    }
  }

  async function updateStatus(newStatus: DriverStatus) {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('agent_availability')
      .upsert({
        user_id: user.id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    
    if (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    } else {
      setStatus(newStatus);
      toast({ title: `Status updated to ${newStatus}` });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusColors: Record<DriverStatus, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    BUSY: 'bg-yellow-100 text-yellow-800',
    OFFLINE: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{driverInfo?.name || 'Driver'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusColors[status]}>{status}</Badge>
                {isOwnerOperator && (
                  <Badge variant="secondary">Owner Operator</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {driverInfo?.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {driverInfo.phone}
              </div>
            )}
            {driverInfo?.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {driverInfo.email}
              </div>
            )}
            {driverInfo?.truck_type && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4" />
                {driverInfo.truck_type}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Control */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Availability Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="available">Available for runs</Label>
            <Switch
              id="available"
              checked={status === 'AVAILABLE'}
              onCheckedChange={(checked) => updateStatus(checked ? 'AVAILABLE' : 'OFFLINE')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="busy">Busy (on break)</Label>
            <Switch
              id="busy"
              checked={status === 'BUSY'}
              onCheckedChange={(checked) => updateStatus(checked ? 'BUSY' : 'AVAILABLE')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payouts (Owner Operators) */}
      {isOwnerOperator && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              This Month's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  ${payouts.total.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  ${payouts.pending.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {payouts.runsCompleted}
                </p>
                <p className="text-xs text-muted-foreground">Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={signOut}
      >
        Sign Out
      </Button>
    </div>
  );
}
