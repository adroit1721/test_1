import { useEffect } from 'react';
import { subscribeToBackendUpdates } from '../utils/apiClient';

export function useRealtimeSync() {
  useEffect(() => {
    // Connect to real-time updates and fallback heartbeat
    const unsubscribe = subscribeToBackendUpdates();
    return () => {
      unsubscribe();
    };
  }, []);
}

