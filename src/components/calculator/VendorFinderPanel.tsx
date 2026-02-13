// Vendor Finder Panel - shown when service is unavailable in-house

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Phone, Mail, Star, Clock, DollarSign, Send, UserPlus, CheckCircle2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Vendor {
  id: string;
  name: string;
  contact_phone: string;
  contact_email: string;
  coverage_zips: string[];
  coverage_cities: string[];
  equipment_types: string[];
  size_support: number[];
  material_support: string[];
  reliability_score: number;
  response_sla_minutes: number;
  is_active: boolean;
}

interface VendorRate {
  id: string;
  vendor_id: string;
  size_yd: number;
  material_category: string;
  base_cost: number;
  included_tons: number;
  overage_cost_per_ton: number;
  extra_day_cost: number;
}

interface VendorFinderPanelProps {
  zipCode: string;
  materialCategory: string;
  dumpsterSize: number;
  customerPrice: number;
  userRole: string;
}

export function VendorFinderPanel({
  zipCode,
  materialCategory,
  dumpsterSize,
  customerPrice,
  userRole,
}: VendorFinderPanelProps) {
  const [vendors, setVendors] = useState<(Vendor & { rate?: VendorRate })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [rfqNotes, setRfqNotes] = useState('');
  const [rfqSent, setRfqSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    searchVendors();
  }, [zipCode, materialCategory, dumpsterSize]);

  async function searchVendors() {
    setLoading(true);
    try {
      // Search vendors matching criteria
      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('priority_rank', { ascending: true });

      if (error) throw error;

      // Filter by coverage + capabilities
      const matched = (vendorData || [])
        .filter((v: any) => {
          const coversZip = !v.coverage_zips?.length || v.coverage_zips.includes(zipCode);
          const supportsSize = !v.size_support?.length || v.size_support.includes(dumpsterSize);
          const supportsMaterial = !v.material_support?.length || v.material_support.includes(materialCategory);
          return coversZip && supportsSize && supportsMaterial;
        })
        .map((v: any) => ({ ...v } as Vendor));

      // Fetch rates for matched vendors
      if (matched.length > 0) {
        const vendorIds = matched.map(v => v.id);
        const { data: rates } = await supabase
          .from('vendor_rates' as any)
          .select('*')
          .in('vendor_id', vendorIds)
          .eq('size_yd', dumpsterSize)
          .eq('material_category', materialCategory)
          .eq('is_active', true);

        const rateMap = new Map<string, VendorRate>();
        (rates || []).forEach((r: any) => rateMap.set(r.vendor_id, r));

        setVendors(matched.map(v => ({ ...v, rate: rateMap.get(v.id) })));
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error('Vendor search failed:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendRfq(vendorId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('vendor_quotes' as any)
        .insert([{
          vendor_id: vendorId,
          requested_by: user?.id,
          request_payload: {
            zip: zipCode,
            material: materialCategory,
            size: dumpsterSize,
            notes: rfqNotes,
          },
          status: 'REQUESTED',
        }] as never);

      setRfqSent(prev => new Set(prev).add(vendorId));
    } catch (err) {
      console.error('RFQ send failed:', err);
    }
  }

  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-100';
    if (score >= 60) return 'text-amber-700 bg-amber-100';
    return 'text-red-700 bg-red-100';
  };

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-5 w-5 text-amber-600" />
          Vendor Finder
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          In-house service unavailable. Searching partner vendors for this job.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="space-y-3">
            <Alert>
              <Search className="h-4 w-4" />
              <AlertDescription>
                No registered vendors found for this area/material. Use manual call list below.
              </AlertDescription>
            </Alert>
            <div className="p-3 rounded-lg border bg-background">
              <p className="text-sm font-medium mb-2">Manual Call Checklist</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>1. Check local hauler directory for ZIP {zipCode}</p>
                <p>2. Call known contacts for {materialCategory} capability</p>
                <p>3. Confirm {dumpsterSize}yd availability</p>
                <p>4. Get quote and enter below</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Add New Vendor
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map(vendor => {
              const margin = vendor.rate
                ? ((customerPrice - vendor.rate.base_cost) / customerPrice) * 100
                : null;
              const isSent = rfqSent.has(vendor.id);

              return (
                <div
                  key={vendor.id}
                  className={`p-3 rounded-lg border bg-background transition-all cursor-pointer ${
                    selectedVendor === vendor.id ? 'ring-2 ring-primary' : 'hover:border-primary/40'
                  }`}
                  onClick={() => setSelectedVendor(vendor.id === selectedVendor ? null : vendor.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{vendor.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {vendor.contact_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {vendor.contact_phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={`${getReliabilityColor(vendor.reliability_score)} border-0 text-[10px]`}>
                        <Star className="h-2.5 w-2.5 mr-0.5" />
                        {vendor.reliability_score}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                        {vendor.response_sla_minutes}m SLA
                      </Badge>
                    </div>
                  </div>

                  {/* Pricing if rate available */}
                  {vendor.rate && (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                      <div className="p-1.5 rounded bg-muted/50">
                        <p className="font-semibold">${vendor.rate.base_cost}</p>
                        <p className="text-muted-foreground">Vendor Pay</p>
                      </div>
                      <div className="p-1.5 rounded bg-muted/50">
                        <p className="font-semibold">${customerPrice}</p>
                        <p className="text-muted-foreground">Customer</p>
                      </div>
                      <div className={`p-1.5 rounded ${margin && margin >= 20 ? 'bg-green-50' : 'bg-amber-50'}`}>
                        <p className="font-semibold">{margin?.toFixed(1) || '--'}%</p>
                        <p className="text-muted-foreground">Margin</p>
                      </div>
                    </div>
                  )}

                  {/* Expanded actions */}
                  {selectedVendor === vendor.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <Textarea
                        placeholder="RFQ notes (optional)"
                        value={rfqNotes}
                        onChange={(e) => setRfqNotes(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                      <div className="flex gap-2">
                        {!isSent ? (
                          <Button size="sm" className="text-xs" onClick={() => sendRfq(vendor.id)}>
                            <Send className="h-3 w-3 mr-1" />
                            Send RFQ
                          </Button>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            RFQ Sent
                          </Badge>
                        )}
                        {vendor.contact_phone && (
                          <Button variant="outline" size="sm" className="text-xs" asChild>
                            <a href={`tel:${vendor.contact_phone}`}>
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </a>
                          </Button>
                        )}
                        {vendor.contact_email && (
                          <Button variant="outline" size="sm" className="text-xs" asChild>
                            <a href={`mailto:${vendor.contact_email}`}>
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
