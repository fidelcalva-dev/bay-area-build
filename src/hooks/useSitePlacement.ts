import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  OrderSitePlacement, 
  DumpsterDimensions, 
  TruckDimensions, 
  TruckType,
  PlacementCreatorRole,
  RectangleGeometry,
  DEFAULT_DUMPSTER_DIMENSIONS,
  DEFAULT_TRUCK_DIMENSIONS,
} from '@/types/sitePlacement';

interface UseSitePlacementOptions {
  orderId: string;
  autoLoad?: boolean;
}

interface SavePlacementParams {
  mapCenterLat: number;
  mapCenterLng: number;
  mapZoom: number;
  dumpsterSizeYd: number;
  dumpsterRectJson: RectangleGeometry;
  truckType: TruckType;
  truckRectJson: RectangleGeometry;
  placementNotes?: string;
  imageStoragePath?: string;
  creatorRole: PlacementCreatorRole;
}

export function useSitePlacement({ orderId, autoLoad = true }: UseSitePlacementOptions) {
  const { toast } = useToast();
  const [placement, setPlacement] = useState<OrderSitePlacement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlacement = useCallback(async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('order_site_placement')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setPlacement({
          ...data,
          dumpster_rect_json: data.dumpster_rect_json as unknown as RectangleGeometry,
          truck_rect_json: data.truck_rect_json as unknown as RectangleGeometry,
        } as OrderSitePlacement);
      }
    } catch (err) {
      console.error('Error fetching placement:', err);
      setError('Failed to load placement data');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const savePlacement = useCallback(async (params: SavePlacementParams): Promise<{ success: boolean; placementId?: string; error?: string }> => {
    if (!orderId) return { success: false, error: 'No order ID' };
    
    setIsSaving(true);
    
    try {
      // Check if placement exists
      const { data: existing } = await supabase
        .from('order_site_placement')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();
      
      let data;
      let saveError;
      
      // Prepare JSONB-compatible objects
      const dumpsterJson = JSON.parse(JSON.stringify(params.dumpsterRectJson));
      const truckJson = JSON.parse(JSON.stringify(params.truckRectJson));
      
      if (existing) {
        // Update existing
        const result = await supabase
          .from('order_site_placement')
          .update({
            map_center_lat: params.mapCenterLat,
            map_center_lng: params.mapCenterLng,
            map_zoom: params.mapZoom,
            dumpster_size_yd: params.dumpsterSizeYd,
            dumpster_rect_json: dumpsterJson,
            truck_type: params.truckType,
            truck_rect_json: truckJson,
            placement_notes: params.placementNotes || null,
            image_storage_path: params.imageStoragePath || null,
            created_by_role: params.creatorRole,
          })
          .eq('order_id', orderId)
          .select()
          .single();
        data = result.data;
        saveError = result.error;
      } else {
        // Insert new - use RPC function which handles the insert properly
        const { data: rpcData, error: rpcError } = await supabase.rpc('save_order_placement', {
          p_order_id: orderId,
          p_map_center_lat: params.mapCenterLat,
          p_map_center_lng: params.mapCenterLng,
          p_map_zoom: params.mapZoom,
          p_dumpster_size_yd: params.dumpsterSizeYd,
          p_dumpster_rect_json: dumpsterJson,
          p_truck_type: params.truckType,
          p_truck_rect_json: truckJson,
          p_placement_notes: params.placementNotes || null,
          p_image_storage_path: params.imageStoragePath || null,
          p_creator_role: params.creatorRole,
        });
        
        if (rpcError) throw rpcError;
        
        // Fetch the newly created record
        const fetchResult = await supabase
          .from('order_site_placement')
          .select('*')
          .eq('id', rpcData)
          .single();
        data = fetchResult.data;
        saveError = fetchResult.error;
      }
      
      if (saveError) throw saveError;
      
      setPlacement({
        ...data,
        dumpster_rect_json: data.dumpster_rect_json as unknown as RectangleGeometry,
        truck_rect_json: data.truck_rect_json as unknown as RectangleGeometry,
      } as OrderSitePlacement);
      
      toast({ title: 'Placement saved successfully' });
      
      return { success: true, placementId: data.id };
    } catch (err) {
      console.error('Error saving placement:', err);
      const errorMsg = 'Failed to save placement';
      toast({ title: errorMsg, variant: 'destructive' });
      return { success: false, error: errorMsg };
    } finally {
      setIsSaving(false);
    }
  }, [orderId, toast]);

  const uploadPlacementImage = useCallback(async (blob: Blob): Promise<string | null> => {
    if (!orderId) return null;
    
    try {
      const fileName = `${orderId}/${Date.now()}_placement.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order-placements')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });
      
      if (uploadError) throw uploadError;
      
      return uploadData.path;
    } catch (err) {
      console.error('Error uploading placement image:', err);
      toast({ title: 'Failed to upload placement image', variant: 'destructive' });
      return null;
    }
  }, [orderId, toast]);

  const getSignedImageUrl = useCallback(async (path: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('order-placements')
        .createSignedUrl(path, 3600); // 1 hour expiry
      
      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoLoad && orderId) {
      fetchPlacement();
    }
  }, [autoLoad, orderId, fetchPlacement]);

  return {
    placement,
    isLoading,
    isSaving,
    error,
    fetchPlacement,
    savePlacement,
    uploadPlacementImage,
    getSignedImageUrl,
  };
}

export function useDimensions() {
  const [dumpsterDimensions, setDumpsterDimensions] = useState<DumpsterDimensions[]>([]);
  const [truckDimensions, setTruckDimensions] = useState<TruckDimensions[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDimensions() {
      try {
        const [dumpsterRes, truckRes] = await Promise.all([
          supabase.from('dumpster_dimensions').select('*').eq('is_active', true).order('size_yd'),
          supabase.from('truck_dimensions').select('*').eq('is_active', true),
        ]);
        
        if (dumpsterRes.data) setDumpsterDimensions(dumpsterRes.data as DumpsterDimensions[]);
        if (truckRes.data) setTruckDimensions(truckRes.data as TruckDimensions[]);
      } catch (err) {
        console.error('Error fetching dimensions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDimensions();
  }, []);

  const getDumpsterDimension = useCallback((sizeYd: number) => {
    return dumpsterDimensions.find(d => d.size_yd === sizeYd);
  }, [dumpsterDimensions]);

  const getTruckDimension = useCallback((truckType: TruckType) => {
    return truckDimensions.find(t => t.truck_type === truckType);
  }, [truckDimensions]);

  return {
    dumpsterDimensions,
    truckDimensions,
    isLoading,
    getDumpsterDimension,
    getTruckDimension,
  };
}
