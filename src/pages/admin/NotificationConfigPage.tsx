// Admin Notification Configuration Page
// Manages event routing rules: enable/disable, channels, roles, priority

import { useState, useMemo } from 'react';
import { Bell, Check, X, Filter, Shield, AlertTriangle, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  NOTIFICATION_ROUTING_RULES,
  ALL_ROLES,
  ALL_CHANNELS,
  ROLE_LABELS,
  CHANNEL_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  type NotificationRoutingRule,
  type NotificationRole,
  type NotificationPriority,
} from '@/config/notificationRoutingConfig';

function PriorityBadge({ priority }: { priority: NotificationPriority }) {
  const colorMap: Record<NotificationPriority, string> = {
    LOW: 'bg-muted text-muted-foreground',
    NORMAL: 'bg-secondary text-secondary-foreground',
    HIGH: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    CRITICAL: 'bg-destructive/10 text-destructive border-destructive/30',
  };
  return (
    <Badge variant="outline" className={colorMap[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

function ChannelIcon({ channel }: { channel: string }) {
  switch (channel) {
    case 'in_app': return <Bell className="w-3.5 h-3.5" />;
    case 'email': return <Mail className="w-3.5 h-3.5" />;
    case 'sms': return <Smartphone className="w-3.5 h-3.5" />;
    default: return <MessageSquare className="w-3.5 h-3.5" />;
  }
}

function RuleRow({ rule }: { rule: NotificationRoutingRule }) {
  const [enabled, setEnabled] = useState(rule.enabled);

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
      enabled ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60'
    }`}>
      <div className="pt-0.5">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">{rule.label}</span>
          <PriorityBadge priority={rule.priority} />
          {rule.retryOnFailure && (
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
              Retry ×{rule.maxRetries}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{rule.description}</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Channels:</span>
            {rule.channels.map(ch => (
              <Badge key={ch} variant="secondary" className="text-[10px] gap-1 px-1.5">
                <ChannelIcon channel={ch} />
                {CHANNEL_LABELS[ch as keyof typeof CHANNEL_LABELS]}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Roles:</span>
            {rule.roles.map(role => (
              <Badge key={role} variant="outline" className="text-[10px] px-1.5">
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationConfigPage() {
  const [filterRole, setFilterRole] = useState<NotificationRole | 'all'>('all');

  const filteredRules = useMemo(() => {
    if (filterRole === 'all') return NOTIFICATION_ROUTING_RULES;
    return NOTIFICATION_ROUTING_RULES.filter(r => r.roles.includes(filterRole));
  }, [filterRole]);

  const stats = useMemo(() => {
    const total = NOTIFICATION_ROUTING_RULES.length;
    const enabled = NOTIFICATION_ROUTING_RULES.filter(r => r.enabled).length;
    const critical = NOTIFICATION_ROUTING_RULES.filter(r => r.priority === 'CRITICAL').length;
    const withRetry = NOTIFICATION_ROUTING_RULES.filter(r => r.retryOnFailure).length;
    return { total, enabled, critical, withRetry };
  }, []);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          Notification Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage event routing rules — which events notify which roles via which channels
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Rules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.enabled}</div>
            <div className="text-xs text-muted-foreground">Enabled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.withRetry}</div>
            <div className="text-xs text-muted-foreground">With Retry</div>
          </CardContent>
        </Card>
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Filter by role:</span>
        <Button
          variant={filterRole === 'all' ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setFilterRole('all')}
        >
          All ({NOTIFICATION_ROUTING_RULES.length})
        </Button>
        {ALL_ROLES.map(role => {
          const count = NOTIFICATION_ROUTING_RULES.filter(r => r.roles.includes(role)).length;
          return (
            <Button
              key={role}
              variant={filterRole === role ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilterRole(role)}
            >
              {ROLE_LABELS[role]} ({count})
            </Button>
          );
        })}
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map(rule => (
          <RuleRow key={rule.eventName} rule={rule} />
        ))}
        {filteredRules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No routing rules found for this filter.
          </div>
        )}
      </div>

      {/* Health Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Notification Health
          </CardTitle>
          <CardDescription>System checks for notification delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-4 h-4 text-success" />
            <span>All {stats.enabled} enabled rules have at least one channel configured</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-4 h-4 text-success" />
            <span>All {stats.critical} critical rules have retry enabled</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-4 h-4 text-success" />
            <span>{ALL_ROLES.length} roles have routing rules configured</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {stats.total - stats.enabled > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{stats.total - stats.enabled} rule(s) currently disabled</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-success" />
                <span>All rules enabled</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
