// ══════════════════════════════════════════════════════════════
// HEAVY PRICING MANAGER — V2 Service Cost + Dump Fee Model
// Canonical editor for heavy material pricing groups and rates
// Formula: total = service_cost + (size_yd × dump_fee_per_yard) + premiums
// ══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Scale, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  HEAVY_MATERIAL_GROUPS,
  HEAVY_SERVICE_COSTS,
  HEAVY_ALLOWED_SIZES,
  getFullPricingTable,
  type HeavySize,
  type HeavyMaterialGroup,
  type HeavyPriceBreakdown,
} from '@/config/heavyMaterialConfig';

export default function HeavyPricingManager() {
  const pricingTable = getFullPricingTable();
  const [expandedGroup, setExpandedGroup] = useState<HeavyMaterialGroup | null>('CLEAN_NO_1');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary" />
          Heavy Material Pricing — V2 Model
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Service Cost + Dump Fee per Yard. Sizes limited to 5, 8, and 10 yd only.
        </p>
      </div>

      {/* Formula Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-semibold text-foreground">
                Pricing Formula: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">total_price = service_cost + (size_yd × dump_fee_per_yard) + premiums</code>
              </p>
              <p className="text-muted-foreground">
                Service costs are fixed per size. Dump fees vary by material group. Premiums (rebar, Green Halo) are added on top.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Costs Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Service Costs by Size</CardTitle>
          <CardDescription>Fixed base service cost regardless of material group</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {HEAVY_ALLOWED_SIZES.map(size => (
              <div key={size} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium text-foreground">{size} yd</span>
                <span className="font-mono font-semibold text-foreground">${HEAVY_SERVICE_COSTS[size]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Material Groups + Pricing Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Material Groups & Pricing</h2>

        {HEAVY_MATERIAL_GROUPS.map(group => {
          const breakdowns = pricingTable[group.id];
          const isExpanded = expandedGroup === group.id;

          return (
            <Card key={group.id} className="overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{group.label}</CardTitle>
                        <CardDescription className="text-xs">{group.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        ${group.dumpFeePerYard}/yd
                      </Badge>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </button>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {/* Materials list */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Included Materials</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.materials.map(mat => (
                        <Badge key={mat} variant="secondary" className="text-xs">
                          {mat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Service Cost</TableHead>
                        <TableHead className="text-right">Dump Fee/yd</TableHead>
                        <TableHead className="text-right">Dump Fee Total</TableHead>
                        <TableHead className="text-right font-semibold">Total Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdowns.map((b: HeavyPriceBreakdown) => (
                        <TableRow key={b.size}>
                          <TableCell className="font-medium">{b.size} yd</TableCell>
                          <TableCell className="text-right font-mono">${b.serviceCost}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">${b.dumpFeePerYard}/yd</TableCell>
                          <TableCell className="text-right font-mono">${b.dumpFee}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-primary">${b.totalPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Premiums Reference */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Premiums & Surcharges
          </CardTitle>
          <CardDescription>Added on top of the base total when applicable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-foreground">Concrete with Rebar Premium</span>
              <Badge variant="outline" className="font-mono">+$50</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-foreground">Green Halo Compliance Premium</span>
              <Badge variant="outline" className="font-mono">+$75</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-foreground">Contamination Surcharge (standard)</span>
              <Badge variant="outline" className="font-mono">+$150</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-foreground">Contamination Surcharge (severe)</span>
              <Badge variant="outline" className="font-mono">+$300</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sizing Restriction Notice */}
      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-foreground">Heavy Material Size Restriction</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Heavy materials are strictly limited to <strong>5, 8, and 10 yard</strong> dumpsters only. 
              Sizes 20yd and above are automatically blocked for heavy material quotes. 
              The legacy 6-yard and 15-yard options have been permanently removed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
