/**
 * React Query hooks for call logs
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { GetCallLogsResponse } from "@/shared/contracts";

export const callLogKeys = {
  all: ["callLogs"] as const,
  lists: () => [...callLogKeys.all, "list"] as const,
};

/**
 * Fetch all call logs
 */
export function useCallLogsQuery() {
  return useQuery({
    queryKey: callLogKeys.lists(),
    queryFn: async () => {
      const response = await api.get<GetCallLogsResponse>("/api/call-logs");
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds - call logs change frequently
  });
}
