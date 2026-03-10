import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface DispatchIntelligence {
  activeRuns: number;
  completedRunsToday: number;
  activeDrivers: number;
  totalDrivers: number;
  driverUtilization: number;
  activeTrucks: number;
  totalTrucks: number;
  truckUtilization: number;
  totalDumpFees: number;
  avgDumpFee: number;
  totalRevenue: number;
  avgRevenuePerRun: number;
  runsByType: { type: string; count: number }[];
  runsByStatus: { status: string; count: number }[];
  dumpTicketCount: number;
  avgWeight: number;
}

export function useDispatchIntelligence() {
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['dispatch-intelligence', today],
    queryFn: async (): Promise<DispatchIntelligence> => {
      const [runsRes, driversRes, trucksRes, dumpTicketsRes, ordersRes] = await Promise.all([
        supabase.from('runs').select('id, run_type, status, dump_fee, assigned_driver_id, assigned_truck_id').eq('scheduled_date', today),
        supabase.from('drivers').select('id, is_active').eq('is_active', true),
        supabase.from('trucks').select('id, is_active, truck_status').eq('is_active', true),
        supabase.from('dump_tickets' as any).select('id, weight, dump_fee').gte('created_at', `${today}T00:00:00`),
        supabase.from('orders').select('id, total_price').eq('status', 'COMPLETED').gte('created_at', `${today}T00:00:00`),
      ]);

      const runs = runsRes.data || [];
      const drivers = driversRes.data || [];
      const trucks = trucksRes.data || [];
      const dumpTickets = (dumpTicketsRes.data || []) as any[];
      const orders = ordersRes.data || [];

      const activeRuns = runs.filter((r: any) => !['COMPLETED', 'CANCELLED'].includes(r.status)).length;
      const completedRuns = runs.filter((r: any) => r.status === 'COMPLETED').length;

      const activeDriverIds = new Set(runs.filter((r: any) => r.assigned_driver_id && !['COMPLETED', 'CANCELLED'].includes(r.status)).map((r: any) => r.assigned_driver_id));
      const activeTruckIds = new Set(runs.filter((r: any) => r.assigned_truck_id && !['COMPLETED', 'CANCELLED'].includes(r.status)).map((r: any) => r.assigned_truck_id));

      const totalDumpFees = dumpTickets.reduce((s: number, t: any) => s + (Number(t.dump_fee) || 0), 0);
      const totalRevenue = orders.reduce((s: number, o: any) => s + (Number(o.total_price) || 0), 0);
      const weights = dumpTickets.filter((t: any) => t.weight).map((t: any) => Number(t.weight));

      // Runs by type
      const typeMap: Record<string, number> = {};
      const statusMap: Record<string, number> = {};
      runs.forEach((r: any) => {
        typeMap[r.run_type] = (typeMap[r.run_type] || 0) + 1;
        statusMap[r.status] = (statusMap[r.status] || 0) + 1;
      });

      return {
        activeRuns,
        completedRunsToday: completedRuns,
        activeDrivers: activeDriverIds.size,
        totalDrivers: drivers.length,
        driverUtilization: drivers.length > 0 ? (activeDriverIds.size / drivers.length) * 100 : 0,
        activeTrucks: activeTruckIds.size,
        totalTrucks: trucks.length,
        truckUtilization: trucks.length > 0 ? (activeTruckIds.size / trucks.length) * 100 : 0,
        totalDumpFees,
        avgDumpFee: dumpTickets.length > 0 ? totalDumpFees / dumpTickets.length : 0,
        totalRevenue,
        avgRevenuePerRun: completedRuns > 0 ? totalRevenue / completedRuns : 0,
        runsByType: Object.entries(typeMap).map(([type, count]) => ({ type, count })),
        runsByStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
        dumpTicketCount: dumpTickets.length,
        avgWeight: weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0,
      };
    },
    refetchInterval: 30000,
  });
}
