// PDF Quote Export Button + Share Options for Master Calculator

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Download, Share2, Copy, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { PricingTier, TierPricing } from '@/services/pricingTierService';
import type { LiveLoadState } from './LiveLoadPanel';
import type { SelectedExtra } from './ExtrasLibraryPanel';

interface QuotePdfExportProps {
  // Customer info
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceAddress?: string;
  // Service details
  dumpsterSize: number;
  materialCategory: string;
  serviceType: string;
  // Pricing
  selectedTier?: PricingTier;
  tierPricing?: TierPricing;
  // Extras
  liveLoad?: LiveLoadState;
  selectedExtras?: SelectedExtra[];
  // Meta
  userRole: string;
}

function formatDate(): string {
  return new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getIncludedTons(size: number): string {
  if (size <= 10) return '0.5-1.0';
  if (size <= 20) return '2.0';
  return `${Math.floor(size / 10)}.0`;
}

function getMaterialLabel(cat: string): string {
  const map: Record<string, string> = {
    DEBRIS: 'General Debris',
    HEAVY: 'Heavy (Concrete, Dirt)',
    DEBRIS_HEAVY: 'Mixed Heavy',
    CLEAN_RECYCLING: 'Clean Recycling',
  };
  return map[cat] || cat;
}

function getServiceLabel(type: string): string {
  const map: Record<string, string> = {
    DELIVERY: 'Delivery',
    PICKUP: 'Pickup',
    SWAP: 'Swap',
  };
  return map[type] || type;
}

export function QuotePdfExport({
  customerName,
  customerPhone,
  customerEmail,
  serviceAddress,
  dumpsterSize,
  materialCategory,
  serviceType,
  selectedTier,
  tierPricing,
  liveLoad,
  selectedExtras = [],
  userRole,
}: QuotePdfExportProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const extrasTotal = selectedExtras.reduce((sum, e) => {
    if (e.unitPrice != null) return sum + e.unitPrice * e.quantity;
    return sum;
  }, 0);
  const liveLoadCharge = liveLoad?.enabled ? liveLoad.extraCharge : 0;
  const basePrice = tierPricing?.customer_price ?? 0;
  const grandTotal = basePrice + extrasTotal + liveLoadCharge;
  const hasPending = selectedExtras.some(e => e.unitPrice == null);

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      // Render the hidden quote card to an image, then trigger download
      const dataUrl = await toPng(printRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `Quote_${dumpsterSize}yd_${selectedTier || 'draft'}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({ title: 'Quote Downloaded', description: 'Quote image saved successfully.' });
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast({ title: 'Download Failed', description: 'Could not generate the quote image.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [dumpsterSize, selectedTier, toast]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link Copied', description: 'Calculator link copied to clipboard.' });
  };

  return (
    <>
      {/* Download + Share Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isGenerating || !tierPricing}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {isGenerating ? 'Generating...' : 'Download Quote'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={!tierPricing}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send via SMS
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Mail className="h-4 w-4 mr-2" />
              Send via Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Portal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hidden Printable Quote Card */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        <div
          ref={printRef}
          style={{
            width: '680px',
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: '#0F4C3A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', fontWeight: 'bold', fontSize: '20px', marginBottom: '12px',
              }}>
                C
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0' }}>
                Calsan -- Dumpster Rental Quote
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Generated: {formatDate()}
              </p>
            </div>
            {selectedTier && (
              <div style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                backgroundColor: selectedTier === 'CORE' ? '#0F4C3A' : selectedTier === 'PREMIUM' ? '#D97706' : '#3B82F6',
                color: '#ffffff',
              }}>
                {selectedTier} Tier
              </div>
            )}
          </div>

          {/* Customer Info */}
          {(customerName || customerPhone || customerEmail || serviceAddress) && (
            <div style={{
              padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb',
              marginBottom: '20px', fontSize: '13px',
            }}>
              <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>Customer</p>
              {customerName && <p style={{ margin: '2px 0' }}>{customerName}</p>}
              {customerPhone && <p style={{ margin: '2px 0', color: '#6b7280' }}>{customerPhone}</p>}
              {customerEmail && <p style={{ margin: '2px 0', color: '#6b7280' }}>{customerEmail}</p>}
              {serviceAddress && <p style={{ margin: '6px 0 0 0', color: '#374151' }}>Service: {serviceAddress}</p>}
            </div>
          )}

          {/* Service Details */}
          <div style={{
            padding: '16px', borderRadius: '10px', backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb', marginBottom: '20px',
          }}>
            <p style={{ fontWeight: '600', marginBottom: '10px', fontSize: '13px' }}>Service Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#6b7280' }}>Container: </span>
                <span style={{ fontWeight: '500' }}>{dumpsterSize} Yard</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Material: </span>
                <span style={{ fontWeight: '500' }}>{getMaterialLabel(materialCategory)}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Service: </span>
                <span style={{ fontWeight: '500' }}>{getServiceLabel(serviceType)}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Included: </span>
                <span style={{ fontWeight: '500' }}>{getIncludedTons(dumpsterSize)} ton, 7 days</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div style={{
            padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '20px',
          }}>
            <p style={{ fontWeight: '600', marginBottom: '10px', fontSize: '13px' }}>Pricing</p>
            <div style={{ fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{dumpsterSize}yd Dumpster Rental</span>
                <span style={{ fontWeight: '600' }}>${basePrice.toFixed(0)}</span>
              </div>

              {/* Live Load */}
              {liveLoad?.enabled && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Live Load ({liveLoad.estimatedMinutes} min est.)</span>
                  <span style={{ fontWeight: '600' }}>
                    {liveLoadCharge > 0 ? `+$${liveLoadCharge.toFixed(0)}` : 'Included'}
                  </span>
                </div>
              )}

              {/* Extras */}
              {selectedExtras.map(ext => (
                <div key={ext.catalogItem.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>
                    {ext.catalogItem.name}
                    {ext.quantity > 1 ? ` (x${ext.quantity})` : ''}
                  </span>
                  <span style={{ fontWeight: '600' }}>
                    {ext.unitPrice != null ? `+$${(ext.unitPrice * ext.quantity).toFixed(0)}` : 'TBD'}
                  </span>
                </div>
              ))}

              {/* Separator */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700' }}>
                <span>Estimated Total</span>
                <span>${grandTotal.toFixed(0)}{hasPending ? '*' : ''}</span>
              </div>
              {hasPending && (
                <p style={{ fontSize: '11px', color: '#D97706', marginTop: '4px' }}>
                  * Some items are pending final pricing.
                </p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div style={{
            padding: '14px', borderRadius: '10px', backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb', marginBottom: '20px', fontSize: '11px', color: '#6b7280',
          }}>
            <p style={{ fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Terms & Conditions</p>
            <ul style={{ paddingLeft: '16px', margin: 0, lineHeight: '1.6' }}>
              <li>Overage rate: $165/ton beyond included weight</li>
              <li>Extra rental days: $35/day beyond included period</li>
              {liveLoad?.enabled && (
                <li>
                  Live Load includes 30 minutes on site. Additional time billed at $180/hr in 15-minute increments.
                </li>
              )}
              <li>Prohibited items: tires, batteries, paint, hazardous materials</li>
              <li>Prices based on ZIP and availability; subject to final confirmation</li>
            </ul>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
            <p style={{ margin: '0 0 4px 0' }}>Calsan -- Bay Area Dumpster Rentals</p>
            <p style={{ margin: 0 }}>bayareabin.com -- (510) 555-0100</p>
          </div>
        </div>
      </div>
    </>
  );
}
