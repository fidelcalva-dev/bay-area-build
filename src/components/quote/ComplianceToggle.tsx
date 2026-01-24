/**
 * Compliance Toggle - Quote flow component
 * Asks if the job is permit/compliance related (contractor/WMP)
 */
import { useState } from 'react';
import { HardHat, Home, Building2, FileCheck, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  CITY_COMPLIANCE_INFO, 
  type ProjectType 
} from '@/lib/certifiedFacilityService';

interface ComplianceToggleProps {
  projectType: ProjectType;
  complianceRequired: boolean;
  city?: string;
  onProjectTypeChange: (type: ProjectType) => void;
  onComplianceChange: (required: boolean) => void;
}

export function ComplianceToggle({
  projectType,
  complianceRequired,
  city,
  onProjectTypeChange,
  onComplianceChange,
}: ComplianceToggleProps) {
  const cityInfo = city ? CITY_COMPLIANCE_INFO[city] : null;
  
  // Auto-enable compliance for contractors
  const handleProjectTypeChange = (type: ProjectType) => {
    onProjectTypeChange(type);
    if (type === 'contractor') {
      onComplianceChange(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Project Type Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">What type of project is this?</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={projectType === 'homeowner' ? 'default' : 'outline'}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3",
              projectType === 'homeowner' && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleProjectTypeChange('homeowner')}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Homeowner</span>
          </Button>
          <Button
            type="button"
            variant={projectType === 'contractor' ? 'default' : 'outline'}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3",
              projectType === 'contractor' && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleProjectTypeChange('contractor')}
          >
            <HardHat className="w-5 h-5" />
            <span className="text-xs">Contractor</span>
          </Button>
          <Button
            type="button"
            variant={projectType === 'business' ? 'default' : 'outline'}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3",
              projectType === 'business' && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleProjectTypeChange('business')}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs">Business</span>
          </Button>
        </div>
      </div>

      {/* Compliance Toggle (for homeowners who may have permit jobs) */}
      {projectType === 'homeowner' && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-amber-600" />
                <div>
                  <Label htmlFor="compliance-toggle" className="text-sm font-medium cursor-pointer">
                    Is this a permit/compliance job?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable for building permits, WRRP, or recycling requirements
                  </p>
                </div>
              </div>
              <Switch
                id="compliance-toggle"
                checked={complianceRequired}
                onCheckedChange={onComplianceChange}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Info Banner */}
      {(complianceRequired || projectType === 'contractor') && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <FileCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-emerald-900">Certified Facilities Recommended</h4>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                    Compliance
                  </Badge>
                </div>
                <p className="text-sm text-emerald-800">
                  {cityInfo?.guidance || 
                    'For permit compliance, use city-approved recycling facilities and keep weight tickets for project records.'}
                </p>
                {cityInfo && (
                  <div className="mt-2 text-xs text-emerald-700">
                    Program: {cityInfo.programName}
                    {cityInfo.usesGreenHalo && (
                      <span className="ml-2">• Uses Green Halo for reporting</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standard Disposal Note (non-compliance homeowners) */}
      {projectType === 'homeowner' && !complianceRequired && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Standard disposal will be used. 
            <button 
              type="button"
              onClick={() => onComplianceChange(true)}
              className="text-primary hover:underline ml-1"
            >
              Request recycling support
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

export default ComplianceToggle;
