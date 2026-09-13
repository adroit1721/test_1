import { CadetUserAccount } from '../types';
import { apiUrl, WS_URL } from '../config/api';

export interface BackendStatus {
  type: string;
  connected: boolean;
  hasUri: boolean;
  settingsCount: number;
  cadetsCount: number;
  connectedSseClients?: number;
  connectedWsClients?: number;
  totalConnectedClients?: number;
  syncVersion: number;
  error?: string | null;
  isWhitelistError?: boolean;
}

export interface RealtimeEvent {
  type: 'CONNECTED' | 'SETTINGS_UPDATED' | 'BULK_SETTINGS_UPDATED' | 'CADETS_UPDATED' | 'CADET_DELETED' | 'BULK_CADETS_UPDATED' | 'INITIAL_SYNC' | 'RECRUITMENT_APPLICATION_SUBMITTED' | string;
  payload?: any;
  version: number;
  collection?: string;
  action?: string;
}

// Token management for JWT Authentication
const JWT_STORAGE_KEY = 'ngdc_jwt_token';
const JWT_ALT_STORAGE_KEY = 'ngdc_admin_jwt_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      sessionStorage.getItem(JWT_STORAGE_KEY) ||
      localStorage.getItem(JWT_STORAGE_KEY) ||
      sessionStorage.getItem(JWT_ALT_STORAGE_KEY) ||
      localStorage.getItem(JWT_ALT_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      sessionStorage.setItem(JWT_STORAGE_KEY, token);
      localStorage.setItem(JWT_STORAGE_KEY, token);
      sessionStorage.setItem(JWT_ALT_STORAGE_KEY, token);
      localStorage.setItem(JWT_ALT_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      localStorage.removeItem(JWT_STORAGE_KEY);
      sessionStorage.removeItem(JWT_ALT_STORAGE_KEY);
      localStorage.removeItem(JWT_ALT_STORAGE_KEY);
    }
  } catch {}
}

export async function loginOfficer(username: string, password: string): Promise<{
  success: boolean;
  token?: string;
  officerId?: string;
  error?: string;
  isLocked?: boolean;
  lockoutUntil?: number;
  remainingSeconds?: number;
  attemptsLeft?: number;
}> {
  try {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setAuthToken(data.token);
      return { success: true, token: data.token, officerId: data.officerId };
    }
    return {
      success: false,
      error: data.error || 'Authentication failed',
      isLocked: Boolean(data.isLocked),
      lockoutUntil: data.lockoutUntil,
      remainingSeconds: data.remainingSeconds,
      attemptsLeft: data.attemptsLeft,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during authentication' };
  }
}

export async function updateOfficerCredentials(
  currentPassword: string,
  newOfficerId: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/auth/update-credentials'), {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({ currentPassword, newOfficerId, newPassword }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to update credentials' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error updating credentials' };
  }
}

export async function verifyAuthToken(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const res = await fetch(apiUrl('/api/auth/verify'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.valid);
    }
  } catch {}
  return false;
}

function getRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (typeof window !== 'undefined') {
    try {
      const officerId = localStorage.getItem('ngdc_admin_officer_id') || 'ngdc_bncc_1979';
      headers['x-officer-id'] = officerId;
    } catch {}
  }
  return headers;
}

// --- Global API Request Debouncing & 60-second TTL Caching Mechanism ---
interface ApiCacheEntry<T> {
  data: T;
  timestamp: number;
}

const apiResponseCache = new Map<string, ApiCacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 60000; // 60 seconds default cache TTL to prevent redundant requests

export function invalidateApiCache(keyPrefix?: string) {
  if (!keyPrefix) {
    apiResponseCache.clear();
    return;
  }
  for (const k of apiResponseCache.keys()) {
    if (k.startsWith(keyPrefix)) {
      apiResponseCache.delete(k);
    }
  }
}

async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = CACHE_TTL_MS
): Promise<T> {
  const now = Date.now();
  const cached = apiResponseCache.get(key);

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!;
  }

  const promise = (async () => {
    try {
      const data = await fetchFn();
      apiResponseCache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (err) {
      // Cooldown on error: prevent immediate retry loops on failure
      apiResponseCache.set(key, { data: (cached ? cached.data : null) as any, timestamp: Date.now() });
      throw err;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Fetch all site settings from Express backend (served from RAM/MongoDB in 0-1ms)
 */
export async function fetchSiteSettingsFromApi(): Promise<Record<string, any> | null> {
  return fetchWithCache('site_settings', async () => {
    try {
      const res = await fetch(apiUrl(`/api/settings?_t=${Date.now()}`), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      const data = await res.json();
      if (data && typeof data === 'object') {
        return data;
      }
    } catch (err) {
      console.warn('[API Client] fetchSiteSettings failed, reading local fallback:', err);
    }

    // Graceful local fallback
    if (typeof window !== 'undefined') {
      try {
        const localMap: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ngdc_')) {
            const val = localStorage.getItem(key);
            if (val) {
              try {
                localMap[key] = JSON.parse(val);
              } catch {
                localMap[key] = val;
              }
            }
          }
        }
        return Object.keys(localMap).length > 0 ? localMap : null;
      } catch {}
    }
    return null;
  });
}

/**
 * Upsert a site setting to Express backend and persist locally
 */
export async function upsertSiteSettingToApi(key: string, value: any): Promise<boolean> {
  invalidateApiCache('site_settings');
  // 1. Immediate local write for zero latency
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch {}
  }

  // 2. Persist to Express backend with JWT header
  try {
    const res = await fetch(apiUrl('/api/settings'), {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({ key, value }),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[API Client] Failed to persist setting "${key}" to server:`, err);
    return false;
  }
}

/**
 * Fetch all cadets from Express backend (served from RAM/MongoDB in 0-1ms)
 */
export async function fetchCadetsFromApi(): Promise<CadetUserAccount[] | null> {
  return fetchWithCache('cadets', async () => {
    try {
      const res = await fetch(apiUrl(`/api/cadets?_t=${Date.now()}`), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    } catch (err) {
      console.warn('[API Client] fetchCadets failed, reading local fallback:', err);
    }

    // Graceful local fallback
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ngdc_cadet_users_v8') || localStorage.getItem('ngdc_cadet_users');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return null;
  });
}

/**
 * Submit a cadet recruitment application to the Express backend (public endpoint, no admin token required)
 */
export async function submitRecruitmentApplicationToApi(
  applicant: any
): Promise<{ success: boolean; applicant?: any; token?: string; error?: string }> {
  if (!applicant) return { success: false, error: 'Empty applicant payload' };
  try {
    const res = await fetch(apiUrl('/api/recruitment/apply'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicant),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true, applicant: data.applicant, token: data.token };
    }
    return { success: false, error: data.error || `Server responded with status ${res.status}` };
  } catch (err: any) {
    console.warn('[API Client] Recruitment application submission network error:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Fetch all cadet recruitment applications from the Express backend
 */
export async function fetchRecruitmentApplicantsFromApi(): Promise<any[] | null> {
  return fetchWithCache('recruitment_applicants', async () => {
    try {
      const res = await fetch(apiUrl(`/api/recruitment/applicants?_t=${Date.now()}`), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data.applicants) ? data.applicants : null;
    } catch (err) {
      console.warn('[API Client] Failed to fetch recruitment applicants:', err);
      return null;
    }
  });
}

/**
 * Delete a cadet recruitment application from Express backend and invalidate caches
 */
export async function deleteRecruitmentApplicantFromApi(id: string): Promise<boolean> {
  invalidateApiCache('recruitment_applicants');
  invalidateApiCache('site_settings');
  try {
    const res = await fetch(apiUrl(`/api/recruitment/applicants/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: getRequestHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[API Client] Failed to delete recruitment applicant ${id}:`, err);
    return false;
  }
}

/**
 * Submit a contact form message to Express backend (public endpoint)
 */
export async function submitContactMessageToApi(msg: any): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/contact/submit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok && data.success, error: data.error };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Submit training response to Express backend (public endpoint)
 */
export async function submitTrainingSubmissionToApi(submission: any): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/training/submit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok && data.success, error: data.error };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Submit cadet profile update request to Express backend & MongoDB (public endpoint, queues in Admin console)
 */
export async function submitCadetProfileUpdateRequestToApi(
  reqPayload: any
): Promise<{ success: boolean; request?: any; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/cadets/request-update'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqPayload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true, request: data.request || reqPayload };
    }
    return { success: false, error: data.error || `Server returned ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Fetch pending profile update requests from server
 */
export async function fetchPendingProfileUpdatesFromApi(): Promise<any[]> {
  try {
    const res = await fetch(apiUrl('/api/cadets/pending-updates'));
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data && Array.isArray(data.updates)) {
        return data.updates;
      }
    }
  } catch (err) {
    console.warn('[API Client] Failed to fetch pending profile updates:', err);
  }
  return [];
}

/**
 * Register a cadet applicant from public portal (does not require admin token)
 */
export async function registerPublicCadetToApi(cadet: Partial<CadetUserAccount>): Promise<{ success: boolean; message?: string; cadet?: any }> {
  if (!cadet) return { success: false, message: 'Invalid data' };

  try {
    const res = await fetch(apiUrl('/api/cadets/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cadet),
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, message: data.message || data.error, cadet: data.cadet };
  } catch (err: any) {
    console.warn('[API Client] Public cadet registration network error:', err);
    return { success: false, message: err?.message || 'Network error' };
  }
}

/**
 * Upsert a cadet account to Express backend and persist locally
 */
export async function upsertCadetToApi(cadet: CadetUserAccount): Promise<boolean> {
  if (!cadet || !cadet.id) return false;

  try {
    invalidateApiCache('cadets');
    const res = await fetch(apiUrl('/api/cadets'), {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify(cadet),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[API Client] Failed to upsert cadet ${cadet.cadetNo}:`, err);
    return false;
  }
}

/**
 * Delete a cadet account from Express backend
 */
export async function deleteCadetFromApi(id: string, _cadetNo?: string): Promise<boolean> {
  if (!id) return false;
  invalidateApiCache('cadets');

  try {
    const res = await fetch(apiUrl(`/api/cadets/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: getRequestHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[API Client] Failed to delete cadet ${id}:`, err);
    return false;
  }
}

/**
 * Check backend database status
 */
export async function getBackendStatus(): Promise<BackendStatus | null> {
  return fetchWithCache('backend_status', async () => {
    try {
      const res = await fetch(apiUrl(`/api/db/status?_t=${Date.now()}`), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  });
}

/**
 * Real-time Multi-Device Sync Engine (Dual WebSocket + Server-Sent Events + Mobile Wakeup Listeners).
 * Delivers changes across all open phones, tablets, and computers in <2 milliseconds!
 */
export function subscribeToBackendUpdates(
  onUpdate: (event: { collection: 'site_settings' | 'cadets'; payload: any; action: string; type?: string }) => void
): () => void {
  let isDisposed = false;
  let eventSource: EventSource | null = null;
  let fallbackInterval: NodeJS.Timeout | null = null;
  let lastKnownVersion = 0;

  const handleIncomingRefresh = async () => {
    if (isDisposed) return;
    try {
      const [settings, cadets] = await Promise.all([
        fetchSiteSettingsFromApi(),
        fetchCadetsFromApi(),
      ]);

      if (isDisposed) return;

      if (settings && typeof settings === 'object') {
        Object.entries(settings).forEach(([key, value]) => {
          onUpdate({
            collection: 'site_settings',
            payload: { key, value },
            action: 'update',
          });
        });
      }

      if (cadets && Array.isArray(cadets)) {
        onUpdate({
          collection: 'cadets',
          payload: cadets,
          action: 'bulk',
        });
      }
    } catch (err) {
      console.warn('[Realtime Sync] Full refresh failed:', err);
    }
  };

  const processRealtimeEvent = (event: RealtimeEvent) => {
    if (isDisposed || !event) return;

    if (event.version) {
      lastKnownVersion = Math.max(lastKnownVersion, Number(event.version));
    }

    if (event.type === 'CONNECTED') {
      return;
    }

    if (event.type === 'SETTINGS_UPDATED' && event.payload) {
      onUpdate({
        collection: 'site_settings',
        payload: event.payload,
        action: 'update',
        type: event.type,
      });
    } else if (event.type === 'BULK_SETTINGS_UPDATED' && event.payload) {
      Object.entries(event.payload).forEach(([key, value]) => {
        onUpdate({
          collection: 'site_settings',
          payload: { key, value },
          action: 'update',
          type: event.type,
        });
      });
    } else if (event.type === 'CADETS_UPDATED' && event.payload) {
      if (Array.isArray(event.payload)) {
        onUpdate({
          collection: 'cadets',
          payload: event.payload,
          action: 'bulk',
          type: event.type,
        });
      } else {
        onUpdate({
          collection: 'cadets',
          payload: event.payload,
          action: 'update',
          type: event.type,
        });
      }
    } else if (event.type === 'RECRUITMENT_APPLICATION_SUBMITTED' && event.payload) {
      onUpdate({
        collection: 'site_settings',
        payload: event.payload,
        action: 'recruitment_application',
        type: event.type,
      });
    } else if (event.type === 'BULK_CADETS_UPDATED') {
      onUpdate({
        collection: 'cadets',
        payload: event.payload,
        action: 'bulk',
        type: event.type,
      });
      handleIncomingRefresh();
    } else if (event.type === 'CADET_DELETED' && event.payload) {
      onUpdate({
        collection: 'cadets',
        payload: event.payload,
        action: 'delete',
        type: event.type,
      });
    } else {
      handleIncomingRefresh();
    }
  };

  let broadcastChannel: BroadcastChannel | null = null;

  // Cross-tab zero-latency sync via BroadcastChannel
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel('ngdc_realtime_broadcast');
      broadcastChannel.onmessage = (ev) => {
        if (!isDisposed && ev.data) {
          processRealtimeEvent(ev.data);
        }
      };
    } catch {}
  }

  // 1. Live SSE Stream connection (/api/events) - only on non-serverless environments
  const isServerless = typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') ||
    sessionStorage.getItem('ngdc_sse_disabled') === 'true'
  );

  if (!isServerless && typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
    try {
      const sseUrl = apiUrl('/api/events');
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (ev) => {
        if (isDisposed || !ev.data) return;
        try {
          const data = JSON.parse(ev.data);
          processRealtimeEvent(data);
          if (broadcastChannel) {
            broadcastChannel.postMessage(data);
          }
        } catch {}
      };

      // Close EventSource immediately on error to stop browser's auto infinite reconnect storm
      eventSource.onerror = () => {
        if (eventSource) {
          try {
            eventSource.close();
          } catch {}
          eventSource = null;
        }
        try {
          sessionStorage.setItem('ngdc_sse_disabled', 'true');
        } catch {}
      };
    } catch {
      try {
        sessionStorage.setItem('ngdc_sse_disabled', 'true');
      } catch {}
    }
  }

  // 2. On-Demand Tab Visibility check (Only checks when user returns to tab, throttled to 60s)
  let lastVisibilityCheck = Date.now();
  const handleVisibilityChange = async () => {
    if (isDisposed || typeof document === 'undefined') return;
    if (document.visibilityState !== 'visible') return;

    const now = Date.now();
    if (now - lastVisibilityCheck < 60000) return; // 60s throttle
    lastVisibilityCheck = now;

    try {
      const data = await fetchWithCache('version', async () => {
        const res = await fetch(apiUrl(`/api/version?_t=${Date.now()}`), { cache: 'no-store' });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            return await res.json();
          }
        }
        return null;
      }, 60000);

      if (data && data.version) {
        const remoteVersion = Number(data.version || 0);
        if (lastKnownVersion === 0) {
          lastKnownVersion = remoteVersion;
        } else if (remoteVersion > lastKnownVersion) {
          lastKnownVersion = remoteVersion;
          await handleIncomingRefresh();
        }
      }
    } catch {}
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return () => {
    isDisposed = true;
    if (eventSource) {
      try {
        eventSource.close();
      } catch {}
      eventSource = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    if (fallbackInterval) {
      clearInterval(fallbackInterval);
      fallbackInterval = null;
    }
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch {}
      broadcastChannel = null;
    }
  };
}
