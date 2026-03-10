import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DriverStatus {
  id: string;
  name: string;
  phone: string;
  is_owner_operator: boolean;
  truck_number: string | null;
  truck_id: string | null;
  current_run_status: string | null;
  current_run_type: string | null;
  current_run_id: string | null;
  current_customer: string | null;
}

export interface TruckStatus {
  id: string;
  truck_number: string;
  truck_type: string;
  plate_number: string | null;
  is_active: boolean;
  current_driver: string | null;
  inspection_status: string | null;
}

export function useFleetStatus(date: string) {
  return useQuery({
    queryKey: ['control-tower-fleet', date],
    queryFn: async () => {
      const [driversRes, trucksRes, runsRes, assignmentsRes] = await Promise.all([
        supabase.from('drivers').select('id, name, phone, is_owner_operator').eq('is_active', true).order('name'),
        supabase.from('trucks').select('id, truck_number, truck_type, plate_number, is_active').eq('is_active', true).order('truck_number'),
        supabase.from('runs').select('id, status, run_type, assigned_driver_id, customer_name').eq('scheduled_date', date).not('status', 'in', '("COMPLETED","CANCELLED")'),
        supabase.from('driver_truck_assignments' as any).select('driver_id, truck_id, trucks:truck_id(truck_number)').eq('is_active', true),
      ]);

      const runs = runsRes.data || [];
      const assignments = (assignmentsRes.data || []) as any[];

      const drivers: DriverStatus[] = (driversRes.data || []).map((d: any) => {
        const activeRun = runs.find((r: any) => r.assigned_driver_id === d.id);
        const assignment = assignments.find((a: any) => a.driver_id === d.id);
        return {
          id: d.id,
          name: d.name,
          phone: d.phone,
          is_owner_operator: d.is_owner_operator || false,
          truck_number: assignment?.trucks?.truck_number || null,
          truck_id: assignment?.truck_id || null,
          current_run_status: activeRun?.status || null,
          current_run_type: activeRun?.run_type || null,
          current_run_id: activeRun?.id || null,
          current_customer: activeRun?.customer_name || null,
        };
      });

      const trucks: TruckStatus[] = (trucksRes.data || []).map((t: any) => {
        const assignment = assignments.find((a: any) => a.truck_id === t.id);
        const driver = assignment ? (driversRes.data || []).find((d: any) => d.id === assignment.driver_id) : null;
        return {
          id: t.id,
          truck_number: t.truck_number,
          truck_type: t.truck_type,
          plate_number: t.plate_number,
          is_active: t.is_active,
          current_driver: driver?.name || null,
          inspection_status: null,
        };
      });

      return { drivers, trucks };
    },
    refetchInterval: 30000,
  });
}
