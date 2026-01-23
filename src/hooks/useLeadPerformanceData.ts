// Lead Performance Data Hook
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, startOfWeek, startOfMonth, differenceInMinutes } from 'date-fns';

export interface LeadMetrics {
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  newLeads: number;
  existingCustomers: number;
  conversionRate: number;
  avgFirstResponseMinutes: number;
}

export interface SalesMetrics {
  assigned: number;
  avgResponseMinutes: number;
  contactedWithin15Min: number;
  contactedWithin15MinPercent: number;
  converted: number;
  convertedPercent: number;
  timedOut: number;
  timedOutPercent: number;
}

export interface CSMetrics {
  fromTimeout: number;
  existingCustomer: number;
  converted: number;
  convertedPercent: number;
  avgFollowupMinutes: number;
}

export interface FunnelData {
  leadsIn: number;
  aiQualified: number;
  salesAssigned: number;
  salesClosed: number;
  salesTimeout: number;
  csRecovered: number;
  lost: number;
}

export interface LeadAlert {
  id: string;
  type: 'waiting_long' | 'cs_backlog' | 'after_hours';
  message: string;
  leadId?: string;
  leadName?: string;
  minutesWaiting?: number;
  severity: 'warning' | 'critical';
}

export interface LeadListItem {
  id: string;
  name: string;
  phone: string;
  assignedAt: Date;
  minutesSinceAssigned: number;
  status: 'waiting' | 'contacted' | 'converted' | 'timeout';
  assignmentType: 'sales' | 'cs';
  source?: string;
  city?: string;
}

export interface LeadPerformanceFilters {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  startDate?: Date;
  endDate?: Date;
  source?: string;
  city?: string;
  assignedTo?: string;
}

export function useLeadPerformanceData(filters: LeadPerformanceFilters) {
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        return { start: startOfDay(now), end: now };
      case 'week':
        return { start: startOfWeek(now), end: now };
      case 'month':
        return { start: startOfMonth(now), end: now };
      case 'custom':
        return { 
          start: filters.startDate || startOfMonth(now), 
          end: filters.endDate || now 
        };
      default:
        return { start: startOfDay(now), end: now };
    }
  }, [filters.dateRange, filters.startDate, filters.endDate]);

  // Fetch leads and events
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch leads
        let leadsQuery = supabase
          .from('sales_leads')
          .select('*')
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())
          .order('created_at', { ascending: false });

        if (filters.source) {
          leadsQuery = leadsQuery.eq('lead_source', filters.source);
        }
        if (filters.assignedTo) {
          leadsQuery = leadsQuery.eq('assigned_to', filters.assignedTo);
        }

        const { data: leadsData, error: leadsError } = await leadsQuery;
        if (leadsError) throw leadsError;

        // Fetch events for these leads
        const leadIds = (leadsData || []).map(l => l.id);
        let eventsData: any[] = [];
        
        if (leadIds.length > 0) {
          const { data: evData, error: evError } = await supabase
            .from('lead_events')
            .select('*')
            .in('lead_id', leadIds)
            .order('created_at', { ascending: true });
          
          if (evError) throw evError;
          eventsData = evData || [];
        }

        // Transform leads to list items
        const now = new Date();
        const transformedLeads: LeadListItem[] = (leadsData || []).map(lead => {
          const assignedAt = lead.assigned_at ? new Date(lead.assigned_at) : new Date(lead.created_at);
          const leadEvents = eventsData.filter(e => e.lead_id === lead.id);
          
          // Determine status
          let status: LeadListItem['status'] = 'waiting';
          if (lead.lead_status === 'converted') {
            status = 'converted';
          } else if (leadEvents.some(e => e.event_type === 'lead_sales_timeout')) {
            status = 'timeout';
          } else if (leadEvents.some(e => e.event_type.includes('contacted'))) {
            status = 'contacted';
          }

          return {
            id: lead.id,
            name: lead.customer_name || 'Unknown',
            phone: lead.customer_phone || '',
            assignedAt,
            minutesSinceAssigned: differenceInMinutes(now, assignedAt),
            status,
            assignmentType: (lead.assignment_type as 'sales' | 'cs') || 'sales',
            source: lead.lead_source || undefined,
            city: undefined, // Would need to join with quotes
          };
        });

        setLeads(transformedLeads);
        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching lead performance data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange, filters.source, filters.assignedTo]);

  // Calculate global metrics
  const globalMetrics = useMemo((): LeadMetrics => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const totalToday = leads.filter(l => l.assignedAt >= todayStart).length;
    const totalWeek = leads.filter(l => l.assignedAt >= weekStart).length;
    const totalMonth = leads.filter(l => l.assignedAt >= monthStart).length;

    const newLeads = leads.filter(l => l.assignmentType === 'sales').length;
    const existingCustomers = leads.filter(l => l.assignmentType === 'cs').length;

    const converted = leads.filter(l => l.status === 'converted').length;
    const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0;

    // Calculate avg first response time from events
    const responseEvents = events.filter(e => 
      e.event_type === 'lead_contacted' || e.event_type.includes('response')
    );
    
    let avgFirstResponseMinutes = 0;
    if (responseEvents.length > 0) {
      const responseTimes = responseEvents.map(e => {
        const lead = leads.find(l => l.id === e.lead_id);
        if (lead) {
          return differenceInMinutes(new Date(e.created_at), lead.assignedAt);
        }
        return 0;
      }).filter(t => t > 0);
      
      if (responseTimes.length > 0) {
        avgFirstResponseMinutes = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }
    }

    return {
      totalToday,
      totalWeek,
      totalMonth,
      newLeads,
      existingCustomers,
      conversionRate,
      avgFirstResponseMinutes,
    };
  }, [leads, events]);

  // Calculate sales metrics
  const salesMetrics = useMemo((): SalesMetrics => {
    const salesLeads = leads.filter(l => l.assignmentType === 'sales');
    const assigned = salesLeads.length;

    // Avg response time
    const respondedLeads = salesLeads.filter(l => l.status === 'contacted' || l.status === 'converted');
    const avgResponseMinutes = respondedLeads.length > 0
      ? respondedLeads.reduce((acc, l) => acc + Math.min(l.minutesSinceAssigned, 60), 0) / respondedLeads.length
      : 0;

    // Contacted within 15 min (estimate based on current waiting time for non-waiting leads)
    const contactedWithin15Min = salesLeads.filter(l => 
      (l.status === 'contacted' || l.status === 'converted') && l.minutesSinceAssigned <= 15
    ).length;
    const contactedWithin15MinPercent = assigned > 0 ? (contactedWithin15Min / assigned) * 100 : 0;

    // Converted by sales
    const converted = salesLeads.filter(l => l.status === 'converted').length;
    const convertedPercent = assigned > 0 ? (converted / assigned) * 100 : 0;

    // Timed out to CS
    const timedOut = salesLeads.filter(l => l.status === 'timeout').length;
    const timedOutPercent = assigned > 0 ? (timedOut / assigned) * 100 : 0;

    return {
      assigned,
      avgResponseMinutes,
      contactedWithin15Min,
      contactedWithin15MinPercent,
      converted,
      convertedPercent,
      timedOut,
      timedOutPercent,
    };
  }, [leads]);

  // Calculate CS metrics
  const csMetrics = useMemo((): CSMetrics => {
    const csLeads = leads.filter(l => l.assignmentType === 'cs');
    
    // From timeout (has timeout event)
    const fromTimeout = leads.filter(l => l.status === 'timeout').length;
    
    // Existing customer leads (assigned directly to CS)
    const existingCustomer = csLeads.length - fromTimeout;

    // Converted by CS
    const converted = csLeads.filter(l => l.status === 'converted').length;
    const convertedPercent = csLeads.length > 0 ? (converted / csLeads.length) * 100 : 0;

    // Avg follow-up time
    const avgFollowupMinutes = csLeads.length > 0
      ? csLeads.reduce((acc, l) => acc + l.minutesSinceAssigned, 0) / csLeads.length
      : 0;

    return {
      fromTimeout,
      existingCustomer,
      converted,
      convertedPercent,
      avgFollowupMinutes,
    };
  }, [leads]);

  // Calculate funnel data
  const funnelData = useMemo((): FunnelData => {
    const leadsIn = leads.length;
    const aiQualified = leads.length; // All leads are AI qualified in this flow
    const salesAssigned = leads.filter(l => l.assignmentType === 'sales').length;
    const salesClosed = leads.filter(l => l.assignmentType === 'sales' && l.status === 'converted').length;
    const salesTimeout = leads.filter(l => l.status === 'timeout').length;
    const csRecovered = leads.filter(l => l.assignmentType === 'cs' && l.status === 'converted').length;
    const lost = leads.filter(l => 
      l.status === 'waiting' && l.minutesSinceAssigned > 60 * 24 // Waiting > 24 hours
    ).length;

    return {
      leadsIn,
      aiQualified,
      salesAssigned,
      salesClosed,
      salesTimeout,
      csRecovered,
      lost,
    };
  }, [leads]);

  // Generate alerts
  const alerts = useMemo((): LeadAlert[] => {
    const alertList: LeadAlert[] = [];

    // Sales leads waiting > 10 minutes
    const longWaiting = leads.filter(l => 
      l.assignmentType === 'sales' && 
      l.status === 'waiting' && 
      l.minutesSinceAssigned > 10
    );

    longWaiting.forEach(lead => {
      alertList.push({
        id: `waiting-${lead.id}`,
        type: 'waiting_long',
        message: `${lead.name} waiting ${lead.minutesSinceAssigned} min`,
        leadId: lead.id,
        leadName: lead.name,
        minutesWaiting: lead.minutesSinceAssigned,
        severity: lead.minutesSinceAssigned > 15 ? 'critical' : 'warning',
      });
    });

    // CS backlog (more than 5 waiting CS leads)
    const csBacklog = leads.filter(l => l.assignmentType === 'cs' && l.status === 'waiting');
    if (csBacklog.length > 5) {
      alertList.push({
        id: 'cs-backlog',
        type: 'cs_backlog',
        message: `CS has ${csBacklog.length} leads waiting`,
        severity: csBacklog.length > 10 ? 'critical' : 'warning',
      });
    }

    // Check for after-hours (6am-9pm Pacific)
    const now = new Date();
    const pacificHour = (now.getUTCHours() - 8 + 24) % 24; // Simplified PST
    const isAfterHours = pacificHour < 6 || pacificHour >= 21;
    
    if (isAfterHours) {
      const pendingLeads = leads.filter(l => l.status === 'waiting');
      if (pendingLeads.length > 0) {
        alertList.push({
          id: 'after-hours',
          type: 'after_hours',
          message: `${pendingLeads.length} leads pending (after hours)`,
          severity: 'warning',
        });
      }
    }

    return alertList.sort((a, b) => 
      a.severity === 'critical' && b.severity !== 'critical' ? -1 : 1
    );
  }, [leads]);

  // Get leads by assignment type
  const salesLeads = useMemo(() => 
    leads.filter(l => l.assignmentType === 'sales'),
  [leads]);

  const csLeads = useMemo(() => 
    leads.filter(l => l.assignmentType === 'cs'),
  [leads]);

  return {
    isLoading,
    error,
    leads,
    salesLeads,
    csLeads,
    globalMetrics,
    salesMetrics,
    csMetrics,
    funnelData,
    alerts,
  };
}
