import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Truck, Phone, Circle } from 'lucide-react';
import type { DriverStatus, TruckStatus } from './useFleetStatus';

interface Props {
  drivers: DriverStatus[] | undefined;
  trucks: TruckStatus[] | undefined;
  isLoading: boolean;
}

function driverStatusLabel(d: DriverStatus): string {
  if (!d.current_run_status) return 'Available';
  switch (d.current_run_status) {
    case 'EN_ROUTE': return 'Driving';
    case 'ARRIVED': return d.current_run_type === 'DELIVERY' ? 'Delivering' : d.current_run_type === 'PICKUP' ? 'Picking Up' : 'On Site';
    case 'ASSIGNED': return 'Assigned';
    case 'PAUSED': return 'Paused';
    default: return d.current_run_status;
  }
}

function driverStatusColor(d: DriverStatus): string {
  if (!d.current_run_status) return 'bg-green-500';
  switch (d.current_run_status) {
    case 'EN_ROUTE': return 'bg-blue-500';
    case 'ARRIVED': return 'bg-orange-500';
    case 'ASSIGNED': return 'bg-yellow-500';
    case 'PAUSED': return 'bg-red-500';
    default: return 'bg-muted-foreground';
  }
}

export function FleetPanel({ drivers, trucks, isLoading }: Props) {
  const activeDrivers = (drivers || []).filter(d => d.current_run_id);
  const availableDrivers = (drivers || []).filter(d => !d.current_run_id);
  const assignedTrucks = (trucks || []).filter(t => t.current_driver);
  const freeTrucks = (trucks || []).filter(t => !t.current_driver);

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Fleet Status
        </h2>
        {/* Quick counts */}
        <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-green-500 text-green-500" />{availableDrivers.length} Free</span>
          <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-blue-500 text-blue-500" />{activeDrivers.length} Active</span>
          <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{(trucks || []).length} Trucks</span>
        </div>
      </div>

      <Tabs defaultValue="drivers" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border h-8">
          <TabsTrigger value="drivers" className="text-xs flex-1 h-7">Drivers ({(drivers || []).length})</TabsTrigger>
          <TabsTrigger value="trucks" className="text-xs flex-1 h-7">Trucks ({(trucks || []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
            ) : (
              <div className="divide-y divide-border">
                {(drivers || []).map(d => (
                  <div key={d.id} className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${driverStatusColor(d)}`} />
                      <span className="text-sm font-medium flex-1 truncate">{d.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{driverStatusLabel(d)}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      {d.truck_number && (
                        <span className="flex items-center gap-0.5">
                          <Truck className="w-3 h-3" />{d.truck_number}
                        </span>
                      )}
                      {d.phone && (
                        <span className="flex items-center gap-0.5">
                          <Phone className="w-3 h-3" />{d.phone}
                        </span>
                      )}
                    </div>
                    {d.current_customer && (
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {d.current_run_type?.replace(/_/g, ' ')} — {d.current_customer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trucks" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
            ) : (
              <div className="divide-y divide-border">
                {(trucks || []).map(t => (
                  <div key={t.id} className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t.truck_number}</span>
                      </div>
                      <Badge variant={t.current_driver ? 'secondary' : 'outline'} className="text-[10px]">
                        {t.current_driver ? 'In Use' : 'Available'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{t.truck_type}</span>
                      {t.plate_number && <span>{t.plate_number}</span>}
                      {t.current_driver && <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{t.current_driver}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
