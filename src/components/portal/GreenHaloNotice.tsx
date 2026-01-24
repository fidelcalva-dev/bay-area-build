/**
 * GreenHaloNotice - Customer-facing informational component
 * Shows when an order requires Green Halo certified disposal
 */
import { Leaf, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GreenHaloNoticeProps {
  isRequired?: boolean;
  className?: string;
}

export function GreenHaloNotice({ isRequired, className }: GreenHaloNoticeProps) {
  if (!isRequired) return null;

  return (
    <Alert className={`border-green-200 bg-green-50 ${className || ''}`}>
      <Leaf className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800 text-sm">
        <strong>Green Halo™ Compliance:</strong> For recycling and diversion compliance, 
        your material will be processed at an approved certified facility.
      </AlertDescription>
    </Alert>
  );
}

/**
 * SpecialDisposalNotice - For customer-requested specific facilities
 */
interface SpecialDisposalNoticeProps {
  hasSpecialRequest?: boolean;
  className?: string;
}

export function SpecialDisposalNotice({ hasSpecialRequest, className }: SpecialDisposalNoticeProps) {
  if (!hasSpecialRequest) return null;

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className || ''}`}>
      <Info className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 text-sm">
        <strong>Special Disposal Request:</strong> Dump fee at cost plus handling fee may apply 
        for customer-requested facilities.
      </AlertDescription>
    </Alert>
  );
}
