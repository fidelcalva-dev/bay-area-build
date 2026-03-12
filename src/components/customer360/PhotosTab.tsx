/**
 * Customer 360 - Photos Tab
 * Shows all proof photos: delivery, pickup, dump tickets, issues
 * Pulls from run_checkpoints and orders
 */
import { useState, useEffect } from 'react';
import { Camera, FileText, Loader2, ExternalLink, Truck, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PhotoRecord {
  id: string;
  type: 'placement' | 'pickup' | 'dump_ticket' | 'material' | 'issue' | 'delivery' | 'other';
  url: string;
  label: string;
  date: string;
  orderId?: string;
  runId?: string;
}

interface Props {
  customerId: string;
}

export function PhotosTab({ customerId }: Props) {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const collected: PhotoRecord[] = [];

      // 1. Get photos from orders (placement, pickup, dump ticket)
      const { data: orders } = await supabase
        .from('orders')
        .select('id, placement_photo_url, pickup_photo_url, dump_ticket_url, created_at, actual_delivery_at, actual_pickup_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (orders) {
        orders.forEach((o: any) => {
          if (o.placement_photo_url) {
            collected.push({
              id: `${o.id}-placement`,
              type: 'placement',
              url: o.placement_photo_url,
              label: 'Placement Photo',
              date: o.actual_delivery_at || o.created_at,
              orderId: o.id,
            });
          }
          if (o.pickup_photo_url) {
            collected.push({
              id: `${o.id}-pickup`,
              type: 'pickup',
              url: o.pickup_photo_url,
              label: 'Pickup Photo',
              date: o.actual_pickup_at || o.created_at,
              orderId: o.id,
            });
          }
          if (o.dump_ticket_url) {
            collected.push({
              id: `${o.id}-dump`,
              type: 'dump_ticket',
              url: o.dump_ticket_url,
              label: 'Dump Ticket',
              date: o.actual_pickup_at || o.created_at,
              orderId: o.id,
            });
          }
        });
      }

      // 2. Get photos from run checkpoints for this customer's runs
      const { data: runs } = await supabase
        .from('runs')
        .select('id, order_id')
        .eq('customer_id', customerId);

      if (runs && runs.length > 0) {
        const runIds = runs.map((r: any) => r.id);
        const { data: checkpoints } = await supabase
          .from('run_checkpoints')
          .select('id, run_id, checkpoint_type, photo_urls, completed_at')
          .in('run_id', runIds)
          .not('photo_urls', 'is', null);

        if (checkpoints) {
          checkpoints.forEach((cp: any) => {
            const urls = (cp.photo_urls || []) as string[];
            const run = runs.find((r: any) => r.id === cp.run_id);
            urls.forEach((url, i) => {
              const typeMap: Record<string, PhotoRecord['type']> = {
                DELIVERY_POD: 'delivery',
                PICKUP_POD: 'pickup',
                DUMP_TICKET: 'dump_ticket',
                MATERIAL_CLOSEUP: 'material',
                FILL_LINE_PHOTO: 'other',
                CONTAMINATION_PHOTO: 'issue',
                SWAP_PICKUP_POD: 'pickup',
                SWAP_DELIVERY_POD: 'delivery',
                OVERFILL_PHOTO: 'issue',
              };
              collected.push({
                id: `${cp.id}-${i}`,
                type: typeMap[cp.checkpoint_type] || 'other',
                url,
                label: cp.checkpoint_type.replace(/_/g, ' '),
                date: cp.completed_at || new Date().toISOString(),
                runId: cp.run_id,
                orderId: run?.order_id,
              });
            });
          });
        }
      }

      // Deduplicate by URL
      const seen = new Set<string>();
      const unique = collected.filter(p => {
        if (seen.has(p.url)) return false;
        seen.add(p.url);
        return true;
      });

      unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPhotos(unique);
      setIsLoading(false);
    }
    load();
  }, [customerId]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const typeFilters = ['all', 'delivery', 'placement', 'pickup', 'dump_ticket', 'material', 'issue'];
  const filtered = filter === 'all' ? photos : photos.filter(p => p.type === filter);

  const TYPE_ICONS: Record<string, React.ReactNode> = {
    delivery: <Truck className="w-3.5 h-3.5" />,
    placement: <Package className="w-3.5 h-3.5" />,
    pickup: <Package className="w-3.5 h-3.5" />,
    dump_ticket: <FileText className="w-3.5 h-3.5" />,
    material: <Camera className="w-3.5 h-3.5" />,
    issue: <AlertTriangle className="w-3.5 h-3.5" />,
    other: <Camera className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {typeFilters.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'
            }`}
          >
            {t === 'all' ? `All (${photos.length})` : `${t.replace(/_/g, ' ')} (${photos.filter(p => p.type === t).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Camera className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No photos yet</p>
            <p className="text-sm mt-1">Delivery photos, site images, and dump tickets will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(photo => (
            <div
              key={photo.id}
              className="group relative rounded-xl border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => window.open(photo.url, '_blank')}
            >
              <img
                src={photo.url}
                alt={photo.label}
                className="w-full h-36 md:h-44 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] gap-1 bg-background/80 backdrop-blur-sm">
                    {TYPE_ICONS[photo.type]}
                    {photo.label}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(photo.date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
