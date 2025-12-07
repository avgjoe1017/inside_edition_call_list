/**
 * React Query hooks for alert logs
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { GetAlertLogsResponse, GetAlertLogResponse } from "@/shared/contracts";

export const alertLogKeys = {
  all: ["alertLogs"] as const,
  lists: () => [...alertLogKeys.all, "list"] as const,
  details: () => [...alertLogKeys.all, "detail"] as const,
  detail: (id: string) => [...alertLogKeys.details(), id] as const,
};

/**
 * Fetch all alert logs
 */
export function useAlertLogsQuery() {
  return useQuery({
    queryKey: alertLogKeys.lists(),
    queryFn: async () => {
      const response = await api.get<GetAlertLogsResponse>("/api/alert-logs");
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds - alert logs change frequently
  });
}

/**
 * Fetch a single alert log with delivery details
 */
export function useAlertLogQuery(alertId: string) {
  return useQuery({
    queryKey: alertLogKeys.detail(alertId),
    queryFn: async () => {
      const response = await api.get<GetAlertLogResponse>(`/api/alert-logs/${alertId}`);
      return response;
    },
    enabled: !!alertId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
