import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import {
  getCompensationPlans,
  getCompensationEarnings,
  getCompensationAdjustments,
  getCompensationAuditLog,
  getCompensationStats,
  getUserCompensationSummary,
  getPendingEarnings,
  approveEarnings,
  voidEarning,
  markEarningsAsPaid,
  createAdjustment,
  getCompensationMode,
  setCompensationMode,
  triggerKpiEvaluation
} from "@/services/compensationService";
import type { EarningStatus, AdjustmentType } from "@/types/compensation";
import { toast } from "sonner";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useCompensationPlans(activeOnly = true) {
  return useQuery({
    queryKey: ["compensation-plans", activeOnly],
    queryFn: () => getCompensationPlans(activeOnly),
    staleTime: 5 * 60 * 1000
  });
}

export function useCompensationEarnings(filters?: {
  userId?: string;
  period?: string;
  status?: EarningStatus;
  role?: AppRole;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["compensation-earnings", filters],
    queryFn: () => getCompensationEarnings(filters),
    refetchInterval: 30000
  });
}

export function usePendingEarnings() {
  return useQuery({
    queryKey: ["compensation-earnings", "pending"],
    queryFn: getPendingEarnings,
    refetchInterval: 30000
  });
}

export function useCompensationAdjustments(filters?: {
  userId?: string;
  period?: string;
  status?: EarningStatus;
  type?: AdjustmentType;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["compensation-adjustments", filters],
    queryFn: () => getCompensationAdjustments(filters),
    refetchInterval: 30000
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["compensation-stats"] });
      toast.success("Adjustment created");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useCompensationAuditLog(filters?: {
  targetUserId?: string;
  actorUserId?: string;
  action?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["compensation-audit-log", filters],
    queryFn: () => getCompensationAuditLog(filters)
  });
}

export function useCompensationStats(period?: string) {
  return useQuery({
    queryKey: ["compensation-stats", period],
    queryFn: () => getCompensationStats(period),
    refetchInterval: 60000
  });
}

export function useUserCompensationSummary(userId: string, period?: string) {
  return useQuery({
    queryKey: ["user-compensation-summary", userId, period],
    queryFn: () => getUserCompensationSummary(userId, period),
    enabled: !!userId
  });
}

export function useApproveEarnings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (earningIds: string[]) => approveEarnings(earningIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-earnings"] });
      toast.success("Earnings approved");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useVoidEarning() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ earningId, reason }: { earningId: string; reason: string }) =>
      voidEarning(earningId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-earnings"] });
      toast.success("Earning voided");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useMarkEarningsAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (earningIds: string[]) => markEarningsAsPaid(earningIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-earnings"] });
      toast.success("Marked as paid");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useCompensationMode() {
  return useQuery({
    queryKey: ["compensation-mode"],
    queryFn: getCompensationMode,
    staleTime: 60000
  });
}

export function useSetCompensationMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mode: "DRY_RUN" | "LIVE") => setCompensationMode(mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-mode"] });
      toast.success("Mode updated");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}

export function useTriggerKpiEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (period: "weekly" | "monthly") => triggerKpiEvaluation(period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-adjustments"] });
      toast.success("KPI evaluation triggered");
    },
    onError: (error: Error) => toast.error(error.message)
  });
}
