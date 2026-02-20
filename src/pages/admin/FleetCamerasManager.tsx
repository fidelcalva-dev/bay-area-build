/**
 * Admin Fleet Cameras — manage providers, devices, and device-truck mappings
 * /admin/fleet/cameras
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Camera, Plus, Trash2, Loader2, Settings, Wifi, WifiOff,
  Truck, RefreshCw, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

interface Provider {
  id: string;
  name: string;
  api_base_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface Device {
  id: string;
  provider_id: string | null;
  truck_id: string;
  device_serial: string;
  device_model: string | null;
  mount_position: string;
  firmware_version: string | null;
  is_active: boolean;
  last_heartbeat_at: string | null;
  installed_at: string;
  trucks?: { truck_number: string };
  camera_providers?: { name: string };
}

interface TruckOption {
  id: string;
  truck_number: string;
}

export default function FleetCamerasManager() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [trucks, setTrucks] = useState<TruckOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Provider dialog
  const [providerDialog, setProviderDialog] = useState(false);
  const [editProvider, setEditProvider] = useState<Partial<Provider>>({});

  // Device dialog
  const [deviceDialog, setDeviceDialog] = useState(false);
  const [editDevice, setEditDevice] = useState<Partial<Device>>({});

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setIsLoading(true);
    try {
      const pQ: AnyQuery = supabase.from('camera_providers');
      const dQ: AnyQuery = supabase.from('camera_devices');
      const tQ: AnyQuery = supabase.from('trucks');
      const [pRes, dRes, tRes] = await Promise.all([
        pQ.select('*').order('name'),
        dQ.select('*, trucks(truck_number), camera_providers(name)').order('created_at', { ascending: false }),
        tQ.select('id, truck_number').eq('status', 'ACTIVE').order('truck_number'),
      ]);
      setProviders(pRes.data || []);
      setDevices(dRes.data || []);
      setTrucks(tRes.data || []);
    } catch { /* silent */ } finally { setIsLoading(false); }
  }

  async function saveProvider() {
    try {
      if (editProvider.id) {
        const q: AnyQuery = supabase.from('camera_providers');
        await q.update({
          name: editProvider.name,
          api_base_url: editProvider.api_base_url,
          is_active: editProvider.is_active,
        }).eq('id', editProvider.id);
      } else {
        const q: AnyQuery = supabase.from('camera_providers');
        await q.insert({
          name: editProvider.name,
          api_base_url: editProvider.api_base_url || null,
          is_active: true,
        });
      }
      toast.success('Provider saved');
      setProviderDialog(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function saveDevice() {
    try {
      const payload = {
        provider_id: editDevice.provider_id || null,
        truck_id: editDevice.truck_id,
        device_serial: editDevice.device_serial,
        device_model: editDevice.device_model || null,
        mount_position: editDevice.mount_position || 'FRONT',
        firmware_version: editDevice.firmware_version || null,
        is_active: editDevice.is_active ?? true,
      };
      if (editDevice.id) {
        const q: AnyQuery = supabase.from('camera_devices');
        await q.update(payload).eq('id', editDevice.id);
      } else {
        const q: AnyQuery = supabase.from('camera_devices');
        await q.insert(payload);
      }
      toast.success('Device saved');
      setDeviceDialog(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function deleteDevice(id: string) {
    if (!confirm('Delete this device?')) return;
    const q: AnyQuery = supabase.from('camera_devices');
    await q.delete().eq('id', id);
    toast.success('Device deleted');
    fetchAll();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="w-6 h-6" /> Fleet Cameras
          </h1>
          <p className="text-muted-foreground">Manage camera providers and device-truck mappings</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="devices">
        <TabsList>
          <TabsTrigger value="devices" className="gap-1"><Camera className="w-4 h-4" /> Devices ({devices.length})</TabsTrigger>
          <TabsTrigger value="providers" className="gap-1"><Settings className="w-4 h-4" /> Providers ({providers.length})</TabsTrigger>
        </TabsList>

        {/* DEVICES TAB */}
        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Camera Devices</CardTitle>
              <Button size="sm" onClick={() => { setEditDevice({ is_active: true, mount_position: 'FRONT' }); setDeviceDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Device
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Heartbeat</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No devices configured yet
                      </TableCell>
                    </TableRow>
                  ) : devices.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm">{d.device_serial}</TableCell>
                      <TableCell>{d.device_model || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Truck className="w-3 h-3" />
                          {d.trucks?.truck_number || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>{d.camera_providers?.name || '—'}</TableCell>
                      <TableCell className="text-xs">{d.mount_position}</TableCell>
                      <TableCell>
                        {d.is_active ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                            <Wifi className="w-3 h-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <WifiOff className="w-3 h-3" /> Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {d.last_heartbeat_at ? format(new Date(d.last_heartbeat_at), 'MMM d, h:mm a') : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                            onClick={() => { setEditDevice(d); setDeviceDialog(true); }}>
                            <Settings className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                            onClick={() => deleteDevice(d.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROVIDERS TAB */}
        <TabsContent value="providers" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Camera Providers</CardTitle>
              <Button size="sm" onClick={() => { setEditProvider({ is_active: true }); setProviderDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Provider
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map(p => (
                  <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => { setEditProvider(p); setProviderDialog(true); }}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{p.name}</h3>
                        <Badge variant={p.is_active ? 'default' : 'secondary'}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.api_base_url || 'No API URL configured'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {format(new Date(p.created_at), 'MMM d, yyyy')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {providers.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No providers configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PROVIDER DIALOG */}
      <Dialog open={providerDialog} onOpenChange={setProviderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProvider.id ? 'Edit' : 'Add'} Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editProvider.name || ''} onChange={e => setEditProvider(p => ({ ...p, name: e.target.value }))} placeholder="Samsara" />
            </div>
            <div>
              <Label>API Base URL</Label>
              <Input value={editProvider.api_base_url || ''} onChange={e => setEditProvider(p => ({ ...p, api_base_url: e.target.value }))} placeholder="https://api.samsara.com" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editProvider.is_active ?? true} onCheckedChange={v => setEditProvider(p => ({ ...p, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProviderDialog(false)}>Cancel</Button>
            <Button onClick={saveProvider} disabled={!editProvider.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DEVICE DIALOG */}
      <Dialog open={deviceDialog} onOpenChange={setDeviceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDevice.id ? 'Edit' : 'Add'} Camera Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Device Serial *</Label>
              <Input value={editDevice.device_serial || ''} onChange={e => setEditDevice(p => ({ ...p, device_serial: e.target.value }))} placeholder="CAM-001-XYZ" />
            </div>
            <div>
              <Label>Device Model</Label>
              <Input value={editDevice.device_model || ''} onChange={e => setEditDevice(p => ({ ...p, device_model: e.target.value }))} placeholder="CM31" />
            </div>
            <div>
              <Label>Truck *</Label>
              <Select value={editDevice.truck_id || ''} onValueChange={v => setEditDevice(p => ({ ...p, truck_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select truck" /></SelectTrigger>
                <SelectContent>
                  {trucks.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.truck_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Provider</Label>
              <Select value={editDevice.provider_id || ''} onValueChange={v => setEditDevice(p => ({ ...p, provider_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mount Position</Label>
              <Select value={editDevice.mount_position || 'FRONT'} onValueChange={v => setEditDevice(p => ({ ...p, mount_position: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRONT">Front</SelectItem>
                  <SelectItem value="REAR">Rear</SelectItem>
                  <SelectItem value="CABIN">Cabin</SelectItem>
                  <SelectItem value="SIDE_LEFT">Side Left</SelectItem>
                  <SelectItem value="SIDE_RIGHT">Side Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Firmware Version</Label>
              <Input value={editDevice.firmware_version || ''} onChange={e => setEditDevice(p => ({ ...p, firmware_version: e.target.value }))} placeholder="v2.1.0" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editDevice.is_active ?? true} onCheckedChange={v => setEditDevice(p => ({ ...p, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeviceDialog(false)}>Cancel</Button>
            <Button onClick={saveDevice} disabled={!editDevice.device_serial || !editDevice.truck_id}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
