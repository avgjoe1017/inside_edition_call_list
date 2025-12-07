/**
 * React Query hooks for markets
 * Handles server state for markets with automatic caching and invalidation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  GetMarketsResponse,
  GetMarketResponse,
  UpdateMarketRequest,
  UpdateMarketResponse,
  SetPrimaryPhoneResponse,
  DeletePhoneResponse,
} from "@/shared/contracts";

// Query keys
export const marketKeys = {
  all: ["markets"] as const,
  lists: () => [...marketKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...marketKeys.lists(), filters] as const,
  details: () => [...marketKeys.all, "detail"] as const,
  detail: (id: string) => [...marketKeys.details(), id] as const,
};

/**
 * Fetch all markets
 */
export function useMarketsQuery() {
  return useQuery({
    queryKey: marketKeys.lists(),
    queryFn: async () => {
      const response = await api.get<GetMarketsResponse>("/api/markets");
      return response.markets;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single market by ID
 */
export function useMarketQuery(marketId: string) {
  return useQuery({
    queryKey: marketKeys.detail(marketId),
    queryFn: async () => {
      const response = await api.get<GetMarketResponse>(`/api/markets/${marketId}`);
      return response;
    },
    enabled: !!marketId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update market mutation
 */
export function useUpdateMarketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId, data }: { marketId: string; data: UpdateMarketRequest }) => {
      return api.put<UpdateMarketResponse>(`/api/markets/${marketId}`, data);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch markets list
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
      // Update the specific market in cache
      queryClient.setQueryData(marketKeys.detail(variables.marketId), data);
    },
  });
}

/**
 * Set primary phone mutation
 */
export function useSetPrimaryPhoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId, phoneId }: { marketId: string; phoneId: string }) => {
      return api.patch<SetPrimaryPhoneResponse>(
        `/api/markets/${marketId}/phones/${phoneId}/primary`
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch markets list
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
      // Update the specific market in cache
      queryClient.setQueryData(marketKeys.detail(variables.marketId), data);
    },
  });
}

/**
 * Delete phone mutation
 */
export function useDeletePhoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId, phoneId }: { marketId: string; phoneId: string }) => {
      return api.delete<DeletePhoneResponse>(`/api/markets/${marketId}/phones/${phoneId}`);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch markets list
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
      // Update the specific market in cache
      queryClient.setQueryData(marketKeys.detail(variables.marketId), data);
    },
  });
}
