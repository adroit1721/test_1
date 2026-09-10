import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchSiteSettingsFromApi, fetchCadetsFromApi, subscribeToBackendUpdates } from '../utils/apiClient';

/**
 * Hook to wire Server-Sent Events (SSE) and WebSockets directly into TanStack Query.
 * Any admin edit on another device immediately invalidates and refetches queries!
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = subscribeToBackendUpdates((event) => {
      if (event.collection === 'site_settings') {
        queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      } else if (event.collection === 'cadets') {
        queryClient.invalidateQueries({ queryKey: ['cadets'] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}

/**
 * Custom hook for fetching and caching site settings via TanStack Query
 */
export function useSiteSettingsQuery() {
  return {
    queryKey: ['site_settings'],
    queryFn: fetchSiteSettingsFromApi,
    staleTime: 1000 * 60 * 5,
  };
}

/**
 * Custom hook for fetching and caching cadets via TanStack Query
 */
export function useCadetsQuery() {
  return {
    queryKey: ['cadets'],
    queryFn: fetchCadetsFromApi,
    staleTime: 1000 * 60 * 5,
  };
}
