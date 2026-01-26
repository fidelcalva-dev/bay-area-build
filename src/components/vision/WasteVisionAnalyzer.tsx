/**
 * Waste Vision AI Analyzer Component
 * Photo-based debris analysis with material detection, hazard flags,
 * and dumpster size recommendations
 */
import { useState, useRef, useCallback } from 'react';
import { 
  Camera, Upload, X, AlertTriangle, CheckCircle, 
  Loader2, Trash2, Leaf, Scale, Box, Info,
  ChevronRight, RefreshCw, Phone, FileWarning
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

interface MaterialDetection {
  id: string;
  label: string;
  confidence: number;
  estimated_volume_pct?: number;
}

interface HazardDetection {
  id: string;
  label: string;
  confidence: number;
  note?: string;
}

interface AnalysisResult {
  success: boolean;
  analysisId?: string;
  materials: MaterialDetection[];
  hazards: HazardDetection[];
  volume_cy: { low: number; high: number };
  weight_tons: { low: number; high: number };
  pickup_loads: { low: number; high: number };
  recommended_flow: {
    waste_type: 'heavy' | 'mixed';
    recommended_size: number;
    alternate_sizes: number[];
    fit_confidence: 'safe' | 'tight' | 'risk' | 'overflow';
    notes: string[];
  };
  green_halo: {
    eligible: boolean;
    note?: string;
  };
  hazard_review_required: boolean;
  overall_confidence: 'high' | 'medium' | 'low';
  disclaimers: string[];
  error?: string;
}

interface WasteVisionAnalyzerProps {
  onApplyToQuote?: (result: AnalysisResult) => void;
  onSendToCS?: (result: AnalysisResult) => void;
  showQuoteButton?: boolean;
  className?: string;
}

type ReferenceObject = 'none' | 'pickup' | 'door' | 'person' | 'bucket';

// ============================================================
// HELPERS
// ============================================================

const REFERENCE_OPTIONS: { value: ReferenceObject; label: string; description: string }[] = [
  { value: 'none', label: 'No reference', description: 'Estimate without scale reference' },
  { value: 'pickup', label: 'Pickup truck', description: 'Truck bed visible (~2 cubic yards)' },
  { value: 'door', label: 'Standard door', description: 'Door visible (~7 ft tall)' },
  { value: 'person', label: 'Person', description: 'Person in frame (~5.5 ft)' },
  { value: 'bucket', label: '5-gallon bucket', description: 'Bucket visible (~0.02 cy)' },
];

const CONFIDENCE_COLORS = {
  high: 'bg-green-500',
  medium: 'bg-amber-500',
  low: 'bg-red-500',
};

const FIT_STATUS_CONFIG = {
  safe: { color: 'text-green-600 bg-green-100', label: 'Good Fit', icon: CheckCircle },
  tight: { color: 'text-amber-600 bg-amber-100', label: 'Tight Fit', icon: AlertTriangle },
  risk: { color: 'text-orange-600 bg-orange-100', label: 'May Overflow', icon: AlertTriangle },
  overflow: { color: 'text-red-600 bg-red-100', label: 'Likely Overflow', icon: X },
};

function formatRange(low: number, high: number, unit: string, decimals = 1): string {
  if (low === high) return `${low.toFixed(decimals)} ${unit}`;
  return `${low.toFixed(decimals)}–${high.toFixed(decimals)} ${unit}`;
}

async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// COMPONENT
// ============================================================

export function WasteVisionAnalyzer({
  onApplyToQuote,
  onSendToCS,
  showQuoteButton = true,
  className,
}: WasteVisionAnalyzerProps) {
  const [images, setImages] = useState<{ file: File; preview: string; label?: string }[]>([]);
  const [referenceObject, setReferenceObject] = useState<ReferenceObject>('none');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo label options
  const PHOTO_LABELS = [
    { value: 'pile', label: 'Pile', description: 'Overall debris pile' },
    { value: 'closeup', label: 'Close-up', description: 'Detail shot of materials' },
    { value: 'jobsite', label: 'Jobsite', description: 'Full work area view' },
  ];

  // Update image label
  const updateImageLabel = (index: number, label: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, label } : img
    ));
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const newImages: { file: File; preview: string }[] = [];
    for (let i = 0; i < Math.min(files.length, 8 - images.length); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview });
      }
    }
    
    setImages(prev => [...prev, ...newImages]);
    setResult(null);
    setError(null);
  }, [images.length]);

  // Remove an image
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    setResult(null);
  }, []);

  // Analyze images
  const analyzeImages = async () => {
    if (images.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Convert images to base64
      const base64Images = await Promise.all(
        images.map(img => imageToBase64(img.file))
      );

      // Generate session ID for tracking
      const sessionId = `vision_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      // Call the edge function
      const { data, error: fnError } = await supabase.functions.invoke('analyze-waste', {
        body: {
          images: base64Images,
          referenceObject,
          sessionId,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Analysis failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze images');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset state
  const handleReset = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResult(null);
    setError(null);
    setReferenceObject('none');
  };

  // Apply results to quote
  const handleApplyToQuote = () => {
    if (result && onApplyToQuote) {
      onApplyToQuote(result);
    }
  };

  // Send to CS for review - updates analysis record and prompts contact
  const handleSendToCS = async () => {
    if (!result) return;
    
    setIsCreatingTicket(true);
    try {
      // Update the waste_vision_analyses record to flag for CS review
      if (result.analysisId) {
        await supabase
          .from('waste_vision_analyses')
          .update({
            hazard_review_status: 'pending',
            hazard_review_required: true,
            recommendation_notes: [
              ...(result.recommended_flow.notes || []),
              'Customer requested human review',
            ],
          })
          .eq('id', result.analysisId);
      }

      // Call the callback if provided
      if (onSendToCS) {
        onSendToCS(result);
      } else {
        // Default: show contact options
        const shouldCall = confirm(
          'Your analysis has been flagged for review.\n\n' +
          'Call our team now at (510) 680-2150?\n\n' +
          '(Click OK to call, Cancel to continue)'
        );
        if (shouldCall) {
          window.location.href = 'tel:+15106802150';
        }
      }
    } catch (err) {
      console.error('Error flagging for CS review:', err);
      // Fall back to phone call
      window.location.href = 'tel:+15106802150';
    } finally {
      setIsCreatingTicket(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          <Camera className="w-6 h-6 text-primary" />
          Waste Vision AI
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload photos of your debris for instant size recommendations
        </p>
      </div>

      {/* Upload Area */}
      {!result && (
        <Card>
          <CardContent className="pt-6">
            {/* Image Grid with Label Chips */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img 
                      src={img.preview} 
                      alt={`Debris photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Photo Label Chips */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="flex gap-1 flex-wrap">
                        {PHOTO_LABELS.map(labelOpt => (
                          <button
                            key={labelOpt.value}
                            onClick={() => updateImageLabel(idx, img.label === labelOpt.value ? '' : labelOpt.value)}
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full transition-all",
                              img.label === labelOpt.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-white/20 text-white hover:bg-white/30"
                            )}
                          >
                            {labelOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 8 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  "hover:border-primary hover:bg-primary/5",
                  images.length > 0 ? "border-muted" : "border-primary/30"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium text-foreground">
                  {images.length > 0 ? 'Add more photos' : 'Upload photos of your debris'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Up to 8 photos • JPG, PNG, HEIC
                </p>
              </div>
            )}

            {/* Reference Object Selector */}
            {images.length > 0 && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Scale Reference (Optional)
                </label>
                <Select value={referenceObject} onValueChange={(v) => setReferenceObject(v as ReferenceObject)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reference object" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERENCE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div>
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-muted-foreground text-xs ml-2">{opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Analyze Button */}
            {images.length > 0 && (
              <Button 
                onClick={analyzeImages} 
                disabled={isAnalyzing}
                className="w-full mt-4"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Analyze Debris
                  </>
                )}
              </Button>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Hazard Warning */}
          {result.hazard_review_required && (
            <Alert variant="destructive">
              <FileWarning className="h-4 w-4" />
              <AlertTitle>Hazard Review Required</AlertTitle>
              <AlertDescription>
                Potential hazardous materials detected. Please contact our team before booking.
                <div className="mt-2">
                  <a href="tel:+15106802150" className="font-medium underline flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Call (510) 680-2150
                  </a>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Recommendation Card */}
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recommended Size</CardTitle>
                <Badge variant="outline" className={cn(
                  "capitalize",
                  CONFIDENCE_COLORS[result.overall_confidence]?.replace('bg-', 'border-'),
                )}>
                  {result.overall_confidence} confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Size Recommendation */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {result.recommended_flow.recommended_size}
                  </div>
                  <div className="text-sm text-muted-foreground">yard</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={result.recommended_flow.waste_type === 'heavy' ? 'default' : 'secondary'}>
                      {result.recommended_flow.waste_type === 'heavy' ? 'Heavy Materials' : 'Mixed Debris'}
                    </Badge>
                    {(() => {
                      const fit = FIT_STATUS_CONFIG[result.recommended_flow.fit_confidence];
                      const Icon = fit.icon;
                      return (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", fit.color)}>
                          <Icon className="w-3 h-3" />
                          {fit.label}
                        </span>
                      );
                    })()}
                  </div>
                  {result.recommended_flow.alternate_sizes.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Also consider: {result.recommended_flow.alternate_sizes.join(', ')} yard
                    </p>
                  )}
                </div>
              </div>

              {/* Estimates Grid */}
              <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-border">
                <div className="text-center">
                  <Box className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <div className="font-semibold text-sm">
                    {formatRange(result.volume_cy.low, result.volume_cy.high, 'cy')}
                  </div>
                  <div className="text-xs text-muted-foreground">Volume</div>
                </div>
                <div className="text-center">
                  <Scale className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <div className="font-semibold text-sm">
                    {formatRange(result.weight_tons.low, result.weight_tons.high, 'T')}
                  </div>
                  <div className="text-xs text-muted-foreground">Weight</div>
                </div>
                <div className="text-center">
                  <Trash2 className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <div className="font-semibold text-sm">
                    {result.pickup_loads.low}–{result.pickup_loads.high}
                  </div>
                  <div className="text-xs text-muted-foreground">Pickup loads</div>
                </div>
              </div>

              {/* Green Halo Badge */}
              {result.green_halo.eligible && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <div className="text-sm">
                    <span className="font-medium text-green-700 dark:text-green-400">
                      Green Halo Eligible
                    </span>
                    {result.green_halo.note && (
                      <span className="text-green-600 dark:text-green-500 ml-1">
                        — {result.green_halo.note}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {result.recommended_flow.notes.length > 0 && (
                <div className="space-y-1">
                  {result.recommended_flow.notes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Info className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materials Detected */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Materials Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
                  >
                    <span className="text-sm font-medium">{mat.label}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      mat.confidence >= 0.7 ? 'bg-green-100 text-green-700' :
                      mat.confidence >= 0.4 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {Math.round(mat.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hazards Detected */}
          {result.hazards.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Potential Hazards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.hazards.map((haz) => (
                    <div
                      key={haz.id}
                      className="flex items-start gap-2 p-2 bg-destructive/10 rounded-lg"
                    >
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                      <div>
                        <span className="font-medium text-sm">{haz.label}</span>
                        {haz.note && (
                          <p className="text-xs text-muted-foreground">{haz.note}</p>
                        )}
                      </div>
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {Math.round(haz.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  ⚠️ These are potential hazards only, not a diagnosis. 
                  Contact our team for guidance on proper disposal.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Disclaimers */}
          <div className="text-xs text-muted-foreground space-y-1 px-2">
            {result.disclaimers?.map((disclaimer, idx) => (
              <p key={idx}>• {disclaimer}</p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showQuoteButton && !result.hazard_review_required && (
              <Button onClick={handleApplyToQuote} className="flex-1">
                Apply to Quote
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            {(result.hazard_review_required || result.overall_confidence === 'low') && (
              <Button 
                onClick={handleSendToCS} 
                variant="outline" 
                className="flex-1"
                disabled={isCreatingTicket}
              >
                {isCreatingTicket ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Customer Service
                  </>
                )}
              </Button>
            )}
            <Button onClick={handleReset} variant="ghost">
              <RefreshCw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WasteVisionAnalyzer;