import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Building2, 
  FileText, 
  Percent, 
  Play, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  getMarketTemplates,
  getYards,
  seedMarketPricing,
  type MarketTemplate,
  type Yard,
  type FacilitiesConfig,
  type SeedMarketResult,
} from '@/services/marketOnboardingService';

const WIZARD_STEPS = [
  { id: 'basics', title: 'Market Basics', icon: MapPin },
  { id: 'facilities', title: 'Facilities', icon: Building2 },
  { id: 'template', title: 'Template', icon: FileText },
  { id: 'adjustments', title: 'Adjustments', icon: Percent },
  { id: 'seed', title: 'Seed Pricing', icon: Play },
  { id: 'review', title: 'Review', icon: CheckCircle2 },
];

interface Adjustment {
  applies_to: string;
  adjustment_pct: number;
  reason: string;
}

export default function NewLocationWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedMarketResult | null>(null);

  // Data
  const [templates, setTemplates] = useState<MarketTemplate[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);

  // Form state
  const [marketCode, setMarketCode] = useState('');
  const [marketName, setMarketName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('CA');
  const [selectedYardId, setSelectedYardId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Facilities config
  const [facilities, setFacilities] = useState<FacilitiesConfig>({
    cnd_debris: { facility_name: '', cost_per_ton: 115 },
    green_waste: { facility_name: '', cost_per_ton: 80 },
    heavy_clean: { 
      facility_name: '', 
      cost_per_load_concrete: 150,
      cost_per_load_asphalt: 225,
      cost_per_load_soil: 100,
      environmental_fee: 15,
    },
  });

  // Adjustments
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [templatesData, yardsData] = await Promise.all([
      getMarketTemplates(),
      getYards(),
    ]);
    setTemplates(templatesData);
    setYards(yardsData);

    // Auto-select first template if available
    if (templatesData.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templatesData[0].id);
    }
  };

  const generateMarketCode = (cityName: string) => {
    const code = cityName
      .toUpperCase()
      .replace(/[^A-Z\s]/g, '')
      .split(' ')
      .map(w => w.slice(0, 3))
      .join('_')
      .slice(0, 15);
    return code || 'NEW_MARKET';
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    if (!marketCode || marketCode === generateMarketCode(city)) {
      setMarketCode(generateMarketCode(value));
    }
    if (!marketName) {
      setMarketName(`${value} Market`);
    }
  };

  const addAdjustment = () => {
    setAdjustments([
      ...adjustments,
      { applies_to: 'ALL', adjustment_pct: 0, reason: '' },
    ]);
  };

  const updateAdjustment = (index: number, field: keyof Adjustment, value: string | number) => {
    const updated = [...adjustments];
    updated[index] = { ...updated[index], [field]: value };
    setAdjustments(updated);
  };

  const removeAdjustment = (index: number) => {
    setAdjustments(adjustments.filter((_, i) => i !== index));
  };

  const handleSeedPricing = async () => {
    if (!selectedTemplateId) {
      toast({ title: 'Error', description: 'Please select a template', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await seedMarketPricing({
        market_code: marketCode.toLowerCase().replace(/\s+/g, '_'),
        market_name: marketName,
        city,
        state,
        yard_id: selectedYardId || undefined,
        template_id: selectedTemplateId,
        facilities,
        adjustments: adjustments.filter(a => a.adjustment_pct !== 0),
      });

      setSeedResult(result);
      
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setCurrentStep(5); // Move to review step
      } else {
        toast({ 
          title: 'Seeding completed with errors', 
          description: result.message, 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Seed error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to seed market pricing', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return marketCode && marketName && city;
      case 1:
        return facilities.cnd_debris.facility_name && 
               facilities.green_waste.facility_name && 
               facilities.heavy_clean.facility_name;
      case 2:
        return !!selectedTemplateId;
      case 3:
        return true; // Adjustments are optional
      case 4:
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., San Jose"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="CA"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marketCode">Market Code</Label>
                <Input
                  id="marketCode"
                  placeholder="e.g., SJ_SOUTH_BAY"
                  value={marketCode}
                  onChange={(e) => setMarketCode(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for this market
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketName">Market Name</Label>
                <Input
                  id="marketName"
                  placeholder="e.g., San Jose Market"
                  value={marketName}
                  onChange={(e) => setMarketName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yard">Associated Yard (Optional)</Label>
              <Select value={selectedYardId} onValueChange={setSelectedYardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a yard or leave empty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No yard selected</SelectItem>
                  {yards.map((yard) => (
                    <SelectItem key={yard.id} value={yard.id}>
                      {yard.name} - {yard.market || 'No market'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            {/* C&D / General Debris */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">C&D / General Debris</CardTitle>
                <CardDescription>Standard construction and demolition debris</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facility Name</Label>
                    <Input
                      placeholder="e.g., Blue Certified"
                      value={facilities.cnd_debris.facility_name}
                      onChange={(e) => setFacilities({
                        ...facilities,
                        cnd_debris: { ...facilities.cnd_debris, facility_name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost per Ton ($)</Label>
                    <Input
                      type="number"
                      value={facilities.cnd_debris.cost_per_ton}
                      onChange={(e) => setFacilities({
                        ...facilities,
                        cnd_debris: { ...facilities.cnd_debris, cost_per_ton: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Green Waste */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Green Waste / Clean Wood / Drywall</CardTitle>
                <CardDescription>Yard debris, clean wood, and clean drywall</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facility Name</Label>
                    <Input
                      placeholder="e.g., Blue Certified"
                      value={facilities.green_waste.facility_name}
                      onChange={(e) => setFacilities({
                        ...facilities,
                        green_waste: { ...facilities.green_waste, facility_name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost per Ton ($)</Label>
                    <Input
                      type="number"
                      value={facilities.green_waste.cost_per_ton}
                      onChange={(e) => setFacilities({
                        ...facilities,
                        green_waste: { ...facilities.green_waste, cost_per_ton: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Heavy Clean */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Heavy Clean Materials</CardTitle>
                <CardDescription>Concrete, asphalt, soil - priced per load</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Facility Name</Label>
                  <Input
                    placeholder="e.g., Argent Materials"
                    value={facilities.heavy_clean.facility_name}
                    onChange={(e) => setFacilities({
                      ...facilities,
                      heavy_clean: { ...facilities.heavy_clean, facility_name: e.target.value }
                    })}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Concrete ($/load)</Label>
                    <Input
                      type="number"
                      value={facilities.heavy_clean.cost_per_load_concrete}
                      onChange={(e) => setFacilities({
                        ...facilities,
                        heavy_clean: { ...facilities.heavy_clean, cost_per_load_concrete: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Asphalt ($/load)</Label>
                    <Input
                      type="number"
                      value={facilities.heavy_clean.cost_per_load_asphalt}
                      onChange={(e) => setFacilities({
                        ...facilities,
                        heavy_clean: { ...facilities.heavy_clean, cost_per_load_asphalt: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Soil ($/load)</Label>
                    <Input
                      type="number"
                      value={facilities.heavy_clean.cost_per_load_soil}
                      onChange={(e) => setFacilities({
                        ...facilities,
                        heavy_clean: { ...facilities.heavy_clean, cost_per_load_soil: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Env Fee ($/load)</Label>
                    <Input
                      type="number"
                      value={facilities.heavy_clean.environmental_fee}
                      onChange={(e) => setFacilities({
                        ...facilities,
                        heavy_clean: { ...facilities.heavy_clean, environmental_fee: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select Pricing Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplateId && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Template Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const template = templates.find(t => t.id === selectedTemplateId);
                    if (!template) return null;
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Included Days</p>
                          <p className="font-medium">{template.default_days_included}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Extra Ton Rate</p>
                          <p className="font-medium">${template.default_extra_ton_rate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Overdue Rate</p>
                          <p className="font-medium">${template.default_overdue_daily_rate}/day</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Same Day Fee</p>
                          <p className="font-medium">${template.default_same_day_fee}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CORE Markup</p>
                          <p className="font-medium">+{template.default_core_markup_pct}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">PREMIUM Markup</p>
                          <p className="font-medium">+{template.default_premium_markup_pct}%</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Market-Specific Adjustments</h3>
                <p className="text-sm text-muted-foreground">
                  Apply percentage adjustments to pricing for this market (optional)
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addAdjustment}>
                Add Adjustment
              </Button>
            </div>

            {adjustments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No adjustments configured. Click "Add Adjustment" to add one.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {adjustments.map((adj, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Applies To</Label>
                          <Select 
                            value={adj.applies_to} 
                            onValueChange={(v) => updateAdjustment(index, 'applies_to', v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">All Pricing</SelectItem>
                              <SelectItem value="STANDARD_DEBRIS">Standard Debris</SelectItem>
                              <SelectItem value="GREEN_WASTE">Green Waste</SelectItem>
                              <SelectItem value="HEAVY_BASE">Heavy Base</SelectItem>
                              <SelectItem value="GREEN_HALO">Green Halo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Adjustment (%)</Label>
                          <Input
                            type="number"
                            placeholder="+5 or -3"
                            value={adj.adjustment_pct}
                            onChange={(e) => updateAdjustment(index, 'adjustment_pct', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Reason</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., Higher facility costs"
                              value={adj.reason}
                              onChange={(e) => updateAdjustment(index, 'reason', e.target.value)}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeAdjustment(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ready to Seed Pricing</CardTitle>
                <CardDescription>
                  Review your configuration before generating pricing data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Market</p>
                    <p className="font-medium">{marketName} ({marketCode})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{city}, {state}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">C&D Facility</p>
                    <p className="font-medium">{facilities.cnd_debris.facility_name} (${facilities.cnd_debris.cost_per_ton}/ton)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Heavy Facility</p>
                    <p className="font-medium">{facilities.heavy_clean.facility_name}</p>
                  </div>
                </div>

                <Separator />

                <div className="text-sm">
                  <p className="font-medium mb-2">Will Generate:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>7 dump fee profiles (CND, Green, Wood, Drywall, Concrete, Asphalt, Soil)</li>
                    <li>15 standard debris prices (5 sizes x 3 tiers)</li>
                    <li>24 heavy material rates (4 sizes x 2 categories x 3 materials)</li>
                    <li>Version control record (DRAFT status)</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSeedPricing} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Seeding Pricing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Seed Market Pricing
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {seedResult && (
              <Card className={seedResult.success ? 'border-green-500' : 'border-amber-500'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {seedResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    Seeding Complete
                  </CardTitle>
                  <CardDescription>{seedResult.message}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{seedResult.results.dump_fee_profiles_created}</p>
                      <p className="text-xs text-muted-foreground">Dump Fees</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{seedResult.results.market_size_pricing_created}</p>
                      <p className="text-xs text-muted-foreground">Size Prices</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{seedResult.results.heavy_material_rates_created}</p>
                      <p className="text-xs text-muted-foreground">Heavy Rates</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{seedResult.results.adjustments_applied}</p>
                      <p className="text-xs text-muted-foreground">Adjustments</p>
                    </div>
                  </div>

                  {seedResult.results.errors.length > 0 && (
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="font-medium text-destructive mb-2">Errors:</p>
                      <ul className="text-sm text-destructive list-disc list-inside">
                        {seedResult.results.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <p className="font-medium">Next Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Review generated pricing in the Location Pricing Manager</li>
                      <li>Adjust individual prices if needed</li>
                      <li>Mark version as REVIEWED when satisfied</li>
                      <li>Activate version to make it LIVE</li>
                    </ol>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/admin/pricing/locations')}
                    >
                      View Pricing Manager
                    </Button>
                    <Button onClick={() => navigate('/admin/markets')}>
                      Back to Markets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Location Setup</h1>
        <p className="text-muted-foreground">
          Add a new market with auto-seeded pricing
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isComplete ? 'bg-primary text-primary-foreground' : ''}
                      ${isCurrent ? 'bg-primary/20 text-primary border-2 border-primary' : ''}
                      ${!isComplete && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{WIZARD_STEPS[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < 4 && (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
