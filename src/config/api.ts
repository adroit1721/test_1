/**
 * Centralized backend URL configuration.
 *
 * - Development: same-origin (Vite proxies to Express on :3000)
 * - Production (Vercel → Railway): uses VITE_BACKEND_URL env var
 *   set in Vercel project settings → Environment Variables
 *
 * Example: VITE_BACKEND_URL=https://ngdc-bncc-api.up.railway.app
 */
export const BACKEND_URL: string = (() => {
  let url = (import.meta as any).env?.VITE_BACKEND_URL
    ? String((import.meta as any).env.VITE_BACKEND_URL).replace(/\/$/, '')
    : '';
  
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
})();

/**
 * WebSocket URL derived from backend URL.
 * Automatically switches ws:// ↔ wss:// based on protocol.
 */
export const WS_URL: string = BACKEND_URL
  ? BACKEND_URL.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')
  : typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
    : 'ws://localhost:3000';

/**
 * Build a full API URL. In development, returns '/api/...' (same-origin).
 * In production, prepends the Railway backend URL.
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return BACKEND_URL ? `${BACKEND_URL}${cleanPath}` : cleanPath;
}
