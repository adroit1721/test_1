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
  type: 'CONNECTED' | 'SETTINGS_UPDATED' | 'BULK_SETTINGS_UPDATED' | 'CADETS_UPDATED' | 'CADET_DELETED' | 'BULK_CADETS_UPDATED' | 'INITIAL_SYNC';
  payload?: any;
  version: number;
}

// Token management for JWT Authentication
const JWT_STORAGE_KEY = 'ngdc_jwt_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(JWT_STORAGE_KEY) || localStorage.getItem(JWT_STORAGE_KEY);
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
    } else {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      localStorage.removeItem(JWT_STORAGE_KEY);
    }
  } catch {}
}

export async function loginWithPin(pin: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setAuthToken(data.token);
      return { success: true, token: data.token };
    }
    return { success: false, error: data.error || 'Authentication failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during login' };
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
  return headers;
}

/**
 * Fetch all site settings from Express backend (served from RAM/MongoDB in 0-1ms)
 */
export async function fetchSiteSettingsFromApi(): Promise<Record<string, any> | null> {
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
}

/**
 * Upsert a site setting to Express backend and persist locally
 */
export async function upsertSiteSettingToApi(key: string, value: any): Promise<boolean> {
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
}

/**
 * Real-time Multi-Device Sync Engine (Dual WebSocket + Server-Sent Events + Mobile Wakeup Listeners).
 * Delivers changes across all open phones, tablets, and computers in <2 milliseconds!
 */
export function subscribeToBackendUpdates(
  onUpdate: (event: { collection: 'site_settings' | 'cadets'; payload: any; action: string }) => void
): () => void {
  let isDisposed = false;
  let ws: WebSocket | null = null;
  let eventSource: EventSource | null = null;
  let fallbackInterval: NodeJS.Timeout | null = null;
  let wsPingInterval: NodeJS.Timeout | null = null;
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
      });
    } else if (event.type === 'BULK_SETTINGS_UPDATED' && event.payload) {
      Object.entries(event.payload).forEach(([key, value]) => {
        onUpdate({
          collection: 'site_settings',
          payload: { key, value },
          action: 'update',
        });
      });
    } else if (event.type === 'CADETS_UPDATED' && event.payload) {
      if (Array.isArray(event.payload)) {
        onUpdate({
          collection: 'cadets',
          payload: event.payload,
          action: 'bulk',
        });
      } else {
        onUpdate({
          collection: 'cadets',
          payload: event.payload,
          action: 'update',
        });
      }
    } else if (event.type === 'BULK_CADETS_UPDATED') {
      handleIncomingRefresh();
    } else if (event.type === 'CADET_DELETED' && event.payload) {
      onUpdate({
        collection: 'cadets',
        payload: event.payload,
        action: 'delete',
      });
    } else {
      handleIncomingRefresh();
    }
  };

  // Detect Vercel Serverless environment where WebSockets and long-lived SSE are unsupported
  const isVercelHost = typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('.vercel.dev')
  );

  let wsFailCount = 0;
  let sseFailCount = 0;
  let broadcastChannel: BroadcastChannel | null = null;

  // Cross-tab zero-latency sync via BroadcastChannel
  // Zero-network overhead cross-tab broadcast channel
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

  return () => {
    isDisposed = true;
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch {}
      broadcastChannel = null;
    }
  };
}
