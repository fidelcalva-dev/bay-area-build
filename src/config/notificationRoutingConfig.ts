// ══════════════════════════════════════════════════════════════
// NOTIFICATION ROUTING CONFIG — Canonical role-based event routing
// Maps commercial milestones + operational events to roles/channels.
// Admin UI reads/writes this config. Notification dispatcher uses it.
// ══════════════════════════════════════════════════════════════

export type NotificationRole =
  | 'sales'
  | 'customer_service'
  | 'logistics'
  | 'dispatch'
  | 'driver'
  | 'billing'
  | 'admin';

export type NotificationChannel = 'in_app' | 'email' | 'sms';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface NotificationRoutingRule {
  eventName: string;
  label: string;
  description: string;
  roles: NotificationRole[];
  channels: NotificationChannel[];
  priority: NotificationPriority;
  enabled: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

// ── Canonical Routing Rules ──────────────────────────────────
export const NOTIFICATION_ROUTING_RULES: NotificationRoutingRule[] = [
  // ─── Sales Events ────────────────────────
  {
    eventName: 'lead_created',
    label: 'Lead Created',
    description: 'New lead captured from any channel',
    roles: ['sales', 'admin'],
    channels: ['in_app', 'email'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },
  {
    eventName: 'quote_started',
    label: 'Quote Started',
    description: 'Customer began a quote flow',
    roles: ['sales'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'quote_ready',
    label: 'Quote Ready',
    description: 'Quote calculation complete, ready for review',
    roles: ['sales', 'admin'],
    channels: ['in_app', 'email'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },

  // ─── Contract Events ────────────────────
  {
    eventName: 'contract_sent',
    label: 'Contract Sent',
    description: 'Contract sent to customer',
    roles: ['sales', 'admin'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'contract_viewed',
    label: 'Contract Viewed',
    description: 'Customer opened the contract',
    roles: ['sales', 'customer_service'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'contract_signed',
    label: 'Contract Signed',
    description: 'Customer signed the contract',
    roles: ['sales', 'billing', 'admin'],
    channels: ['in_app', 'email'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },

  // ─── Payment Events ─────────────────────
  {
    eventName: 'payment_link_sent',
    label: 'Payment Link Sent',
    description: 'Payment link sent to customer',
    roles: ['billing', 'sales'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'payment_received',
    label: 'Payment Received',
    description: 'Customer payment confirmed',
    roles: ['billing', 'sales', 'dispatch', 'admin'],
    channels: ['in_app', 'email'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },
  {
    eventName: 'payment_overdue',
    label: 'Payment Overdue',
    description: 'Payment past due date',
    roles: ['billing', 'admin'],
    channels: ['in_app', 'email'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },

  // ─── Operations Events ──────────────────
  {
    eventName: 'order_ready_for_dispatch',
    label: 'Order Ready for Dispatch',
    description: 'Order fully paid and ready to schedule',
    roles: ['dispatch', 'logistics', 'admin'],
    channels: ['in_app', 'email'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },
  {
    eventName: 'placement_pending_review',
    label: 'Placement Pending Review',
    description: 'Placement photo or location needs review',
    roles: ['logistics', 'dispatch'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'placement_approved',
    label: 'Placement Approved',
    description: 'Placement location approved',
    roles: ['dispatch', 'driver'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'driver_issue_reported',
    label: 'Driver Issue Reported',
    description: 'Driver flagged an issue at the site',
    roles: ['dispatch', 'logistics', 'customer_service', 'admin'],
    channels: ['in_app', 'email', 'sms'],
    priority: 'CRITICAL',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 5,
  },

  // ─── Billing Events ─────────────────────
  {
    eventName: 'extra_approved',
    label: 'Extra Charge Approved',
    description: 'Additional charge approved for order',
    roles: ['billing', 'sales'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'invoice_ready',
    label: 'Invoice Ready',
    description: 'Invoice generated and ready to send',
    roles: ['billing', 'admin'],
    channels: ['in_app', 'email'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },

  // ─── Customer Service Events ────────────
  {
    eventName: 'customer_reply',
    label: 'Customer Reply',
    description: 'Customer responded via any channel',
    roles: ['customer_service', 'sales'],
    channels: ['in_app'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'follow_up_needed',
    label: 'Follow-Up Needed',
    description: 'Automated follow-up reminder triggered',
    roles: ['customer_service', 'sales'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'schedule_request',
    label: 'Schedule Request',
    description: 'Customer requested a delivery schedule',
    roles: ['customer_service', 'logistics'],
    channels: ['in_app'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },

  // ─── Driver Events ──────────────────────
  {
    eventName: 'new_assignment',
    label: 'New Assignment',
    description: 'New delivery/pickup assigned to driver',
    roles: ['driver'],
    channels: ['in_app', 'sms'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },
  {
    eventName: 'route_changed',
    label: 'Route Changed',
    description: 'Driver route has been modified',
    roles: ['driver'],
    channels: ['in_app', 'sms'],
    priority: 'HIGH',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 3,
  },
  {
    eventName: 'dispatch_note_added',
    label: 'Dispatch Note Added',
    description: 'Dispatcher added a note to the run',
    roles: ['driver'],
    channels: ['in_app'],
    priority: 'NORMAL',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },

  // ─── System Events ──────────────────────
  {
    eventName: 'system_notification_failure',
    label: 'Notification Failure',
    description: 'A notification failed to deliver',
    roles: ['admin'],
    channels: ['in_app', 'email'],
    priority: 'CRITICAL',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 5,
  },
  {
    eventName: 'webhook_failure',
    label: 'Webhook / Integration Failure',
    description: 'External integration webhook failed',
    roles: ['admin'],
    channels: ['in_app', 'email'],
    priority: 'CRITICAL',
    enabled: true,
    retryOnFailure: true,
    maxRetries: 5,
  },

  // ─── Heavy Material Events ──────────────
  {
    eventName: 'heavy_material_selected',
    label: 'Heavy Material Selected',
    description: 'Customer selected heavy material in quote flow',
    roles: ['sales'],
    channels: ['in_app'],
    priority: 'LOW',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
  {
    eventName: 'heavy_material_quote_calculated',
    label: 'Heavy Material Quote Calculated',
    description: 'Heavy material price breakdown calculated',
    roles: ['sales'],
    channels: ['in_app'],
    priority: 'LOW',
    enabled: true,
    retryOnFailure: false,
    maxRetries: 0,
  },
];

// ── Lookup Helpers ───────────────────────────────────────────

export function getRoutingRule(eventName: string): NotificationRoutingRule | undefined {
  return NOTIFICATION_ROUTING_RULES.find(r => r.eventName === eventName);
}

export function getRulesForRole(role: NotificationRole): NotificationRoutingRule[] {
  return NOTIFICATION_ROUTING_RULES.filter(r => r.roles.includes(role) && r.enabled);
}

export function getRulesForEvent(eventName: string): NotificationRoutingRule | undefined {
  return NOTIFICATION_ROUTING_RULES.find(r => r.eventName === eventName && r.enabled);
}

export function getEnabledRules(): NotificationRoutingRule[] {
  return NOTIFICATION_ROUTING_RULES.filter(r => r.enabled);
}

export function getCriticalRules(): NotificationRoutingRule[] {
  return NOTIFICATION_ROUTING_RULES.filter(r => r.priority === 'CRITICAL' && r.enabled);
}

export const ALL_ROLES: NotificationRole[] = [
  'sales', 'customer_service', 'logistics', 'dispatch', 'driver', 'billing', 'admin',
];

export const ALL_CHANNELS: NotificationChannel[] = ['in_app', 'email', 'sms'];

export const ROLE_LABELS: Record<NotificationRole, string> = {
  sales: 'Sales',
  customer_service: 'Customer Service',
  logistics: 'Logistics',
  dispatch: 'Dispatch',
  driver: 'Driver',
  billing: 'Billing / Collections',
  admin: 'Admin',
};

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: 'In-App',
  email: 'Email',
  sms: 'SMS',
};

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  LOW: 'text-muted-foreground',
  NORMAL: 'text-foreground',
  HIGH: 'text-amber-600',
  CRITICAL: 'text-destructive',
};
