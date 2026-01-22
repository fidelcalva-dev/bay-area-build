import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContractStatus, getContractStatusInfo } from '@/lib/contractService';

interface ContractStatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

const ICONS = {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Circle: AlertCircle,
};

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  const info = getContractStatusInfo(status);
  const Icon = ICONS[info.icon as keyof typeof ICONS] || AlertCircle;

  return (
    <Badge variant="outline" className={`${info.color} ${className || ''}`}>
      <Icon className="w-3 h-3 mr-1" />
      {info.label}
    </Badge>
  );
}
