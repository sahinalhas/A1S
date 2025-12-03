/**
 * AI Recommendations Hook
 * AI önerileri için ortak veri çekme hook'u
 */

import { useQuery } from '@tanstack/react-query';

export interface AIRecommendationOptions {
 queryKey: string[];
 queryFn: () => Promise<any>;
 refetchInterval?: number;
 enabled?: boolean;
}

export interface AIRecommendationResult<T> {
 data: T | undefined;
 isLoading: boolean;
 isError: boolean;
 error: Error | null;
 refetch: () => void;
 isRefetching: boolean;
}

/**
 * AI önerileri için genel hook
 */
export function useAIRecommendations<T = any>({
 queryKey,
 queryFn,
 refetchInterval,
 enabled = true,
}: AIRecommendationOptions): AIRecommendationResult<T> {
 const query = useQuery({
 queryKey,
 queryFn,
 refetchInterval,
 enabled,
 });

 return {
 data: query.data,
 isLoading: query.isLoading,
 isError: query.isError,
 error: query.error as Error | null,
 refetch: query.refetch,
 isRefetching: query.isRefetching,
 };
}
