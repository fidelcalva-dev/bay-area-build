import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ARInvoice {
  id: string;
  invoice_number: string;
  order_id: string;
  customer_id: string | null;
  amount_due: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  due_date: string | null;
  issue_date: string | null;
  created_at: string;
  collections_flagged: boolean;
  dispute_reason: string | null;
  days_past_due: number;
  aging_bucket: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_city?: string;
  delivery_zip?: string;
}

export interface ARBucketSummary {
  bucket: string;
  bucketLabel: string;
  totalBalance: number;
  invoiceCount: number;
  sortOrder: number;
}

export interface ARTopDebtor {
  customerId: string | null;
  customerName: string;
  customerPhone: string | null;
  totalBalance: number;
  invoiceCount: number;
  oldestDaysPastDue: number;
  worstBucket: string;
}

export interface ARFilters {
  yardId?: string;
  customerType?: string;
  bucket?: string;
  startDate?: Date;
  endDate?: Date;
}

function calculateDaysPastDue(dueDate: string | null, balanceDue: number): number {
  if (balanceDue <= 0 || !dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function getAgingBucket(daysPastDue: number): { bucket: string; label: string; sortOrder: number } {
  if (daysPastDue === 0) return { bucket: 'current', label: 'Current', sortOrder: 0 };
  if (daysPastDue <= 7) return { bucket: '0-7', label: '1-7 Days', sortOrder: 1 };
  if (daysPastDue <= 30) return { bucket: '8-30', label: '8-30 Days', sortOrder: 2 };
  if (daysPastDue <= 60) return { bucket: '31-60', label: '31-60 Days', sortOrder: 3 };
  if (daysPastDue <= 90) return { bucket: '61-90', label: '61-90 Days', sortOrder: 4 };
  return { bucket: '90+', label: '90+ Days', sortOrder: 5 };
}

export function useARAgingData(filters?: ARFilters) {
  const [invoices, setInvoices] = useState<ARInvoice[]>([]);
  const [bucketSummary, setBucketSummary] = useState<ARBucketSummary[]>([]);
  const [topDebtors, setTopDebtors] = useState<ARTopDebtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch invoices with order/quote data
      const { data: rawInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          orders (
            id,
            status,
            assigned_yard_id,
            quotes (
              customer_name,
              customer_email,
              customer_phone,
              delivery_address,
              zip_code,
              user_type
            )
          )
        `)
        .gt('balance_due', 0)
        .order('due_date', { ascending: true });

      if (invoicesError) throw invoicesError;

      // Process invoices with aging calculations
      const processedInvoices: ARInvoice[] = (rawInvoices || []).map((inv) => {
        // Default due_date to issue_date + 7 days if missing
        let effectiveDueDate = inv.due_date;
        if (!effectiveDueDate && inv.issue_date) {
          const issue = new Date(inv.issue_date);
          issue.setDate(issue.getDate() + 7);
          effectiveDueDate = issue.toISOString().split('T')[0];
        } else if (!effectiveDueDate) {
          const created = new Date(inv.created_at);
          created.setDate(created.getDate() + 7);
          effectiveDueDate = created.toISOString().split('T')[0];
        }

        const daysPastDue = calculateDaysPastDue(effectiveDueDate, inv.balance_due);
        const bucketInfo = getAgingBucket(daysPastDue);
        const quote = inv.orders?.quotes;

        // Extract city from delivery_address (e.g., "123 Main St, Oakland, CA 94601")
        const addressParts = quote?.delivery_address?.split(',') || [];
        const deliveryCity = addressParts.length >= 2 ? addressParts[addressParts.length - 2]?.trim() : undefined;

        return {
          id: inv.id,
          invoice_number: inv.invoice_number,
          order_id: inv.order_id,
          customer_id: inv.customer_id,
          amount_due: inv.amount_due,
          amount_paid: inv.amount_paid,
          balance_due: inv.balance_due,
          payment_status: inv.payment_status,
          due_date: effectiveDueDate,
          issue_date: inv.issue_date,
          created_at: inv.created_at,
          collections_flagged: inv.collections_flagged || false,
          dispute_reason: inv.dispute_reason,
          days_past_due: daysPastDue,
          aging_bucket: bucketInfo.bucket,
          customer_name: quote?.customer_name || 'Unknown',
          customer_phone: quote?.customer_phone || undefined,
          customer_email: quote?.customer_email || undefined,
          delivery_city: deliveryCity,
          delivery_zip: quote?.zip_code || undefined,
        };
      });

      // Apply filters
      let filteredInvoices = processedInvoices;
      
      if (filters?.bucket && filters.bucket !== 'all') {
        filteredInvoices = filteredInvoices.filter(inv => inv.aging_bucket === filters.bucket);
      }

      // Calculate bucket summary
      const bucketMap = new Map<string, ARBucketSummary>();
      const bucketOrder = [
        { bucket: 'current', label: 'Current', sortOrder: 0 },
        { bucket: '0-7', label: '1-7 Days', sortOrder: 1 },
        { bucket: '8-30', label: '8-30 Days', sortOrder: 2 },
        { bucket: '31-60', label: '31-60 Days', sortOrder: 3 },
        { bucket: '61-90', label: '61-90 Days', sortOrder: 4 },
        { bucket: '90+', label: '90+ Days', sortOrder: 5 },
      ];

      // Initialize all buckets
      bucketOrder.forEach(b => {
        bucketMap.set(b.bucket, {
          bucket: b.bucket,
          bucketLabel: b.label,
          totalBalance: 0,
          invoiceCount: 0,
          sortOrder: b.sortOrder,
        });
      });

      // Populate from all processed invoices (not filtered)
      processedInvoices.forEach(inv => {
        const existing = bucketMap.get(inv.aging_bucket);
        if (existing) {
          existing.totalBalance += inv.balance_due;
          existing.invoiceCount += 1;
        }
      });

      const summaryArray = Array.from(bucketMap.values())
        .filter(b => b.invoiceCount > 0)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      // Calculate top debtors
      const debtorMap = new Map<string, {
        customerId: string | null;
        customerName: string;
        customerPhone: string | null;
        totalBalance: number;
        invoiceCount: number;
        oldestDaysPastDue: number;
        worstBucketOrder: number;
        worstBucket: string;
      }>();

      processedInvoices.forEach(inv => {
        const key = inv.customer_phone || inv.customer_id || inv.customer_name;
        const existing = debtorMap.get(key);
        const bucketInfo = getAgingBucket(inv.days_past_due);

        if (existing) {
          existing.totalBalance += inv.balance_due;
          existing.invoiceCount += 1;
          if (inv.days_past_due > existing.oldestDaysPastDue) {
            existing.oldestDaysPastDue = inv.days_past_due;
          }
          if (bucketInfo.sortOrder > existing.worstBucketOrder) {
            existing.worstBucketOrder = bucketInfo.sortOrder;
            existing.worstBucket = bucketInfo.bucket;
          }
        } else {
          debtorMap.set(key, {
            customerId: inv.customer_id,
            customerName: inv.customer_name || 'Unknown',
            customerPhone: inv.customer_phone || null,
            totalBalance: inv.balance_due,
            invoiceCount: 1,
            oldestDaysPastDue: inv.days_past_due,
            worstBucketOrder: bucketInfo.sortOrder,
            worstBucket: bucketInfo.bucket,
          });
        }
      });

      const debtorsArray: ARTopDebtor[] = Array.from(debtorMap.values())
        .map(d => ({
          customerId: d.customerId,
          customerName: d.customerName,
          customerPhone: d.customerPhone,
          totalBalance: d.totalBalance,
          invoiceCount: d.invoiceCount,
          oldestDaysPastDue: d.oldestDaysPastDue,
          worstBucket: d.worstBucket,
        }))
        .sort((a, b) => b.totalBalance - a.totalBalance)
        .slice(0, 20);

      setInvoices(filteredInvoices);
      setBucketSummary(summaryArray);
      setTopDebtors(debtorsArray);
    } catch (err) {
      console.error('Failed to fetch AR data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch AR data');
    } finally {
      setLoading(false);
    }
  }, [filters?.bucket]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAR = bucketSummary.reduce((sum, b) => sum + b.totalBalance, 0);
  const overdueAR = bucketSummary
    .filter(b => b.bucket !== 'current')
    .reduce((sum, b) => sum + b.totalBalance, 0);
  const criticalAR = bucketSummary
    .filter(b => ['61-90', '90+'].includes(b.bucket))
    .reduce((sum, b) => sum + b.totalBalance, 0);

  return {
    invoices,
    bucketSummary,
    topDebtors,
    loading,
    error,
    refetch: fetchData,
    totalAR,
    overdueAR,
    criticalAR,
  };
}
