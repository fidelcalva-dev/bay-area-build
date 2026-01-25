import { Circle, Phone, Clock, Moon, Power } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { AgentStatus } from '@/hooks/useTelephony';

interface AgentStatusSelectorProps {
  status: AgentStatus['status'];
  callsToday: number;
  onStatusChange: (status: AgentStatus['status']) => void;
  disabled?: boolean;
}

const statusConfig: Record<AgentStatus['status'], {
  label: string;
  color: string;
  icon: typeof Circle;
  bgColor: string;
}> = {
  ONLINE: {
    label: 'Online',
    color: 'text-green-500',
    icon: Circle,
    bgColor: 'bg-green-500/10',
  },
  BUSY: {
    label: 'On Call',
    color: 'text-yellow-500',
    icon: Phone,
    bgColor: 'bg-yellow-500/10',
  },
  AWAY: {
    label: 'Away',
    color: 'text-orange-500',
    icon: Clock,
    bgColor: 'bg-orange-500/10',
  },
  OFFLINE: {
    label: 'Offline',
    color: 'text-gray-500',
    icon: Power,
    bgColor: 'bg-gray-500/10',
  },
};

export function AgentStatusSelector({
  status,
  callsToday,
  onStatusChange,
  disabled,
}: AgentStatusSelectorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as AgentStatus['status'])}
        disabled={disabled || status === 'BUSY'}
      >
        <SelectTrigger className={`w-40 ${config.bgColor}`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span>{config.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ONLINE">
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-green-500 fill-green-500" />
              <span>Online - Ready for calls</span>
            </div>
          </SelectItem>
          <SelectItem value="AWAY">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Away - Temporarily unavailable</span>
            </div>
          </SelectItem>
          <SelectItem value="OFFLINE">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-gray-500" />
              <span>Offline - End shift</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Badge variant="outline" className="font-normal">
        {callsToday} call{callsToday !== 1 ? 's' : ''} today
      </Badge>
    </div>
  );
}
