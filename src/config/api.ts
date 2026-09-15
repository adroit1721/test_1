export const getBackendBaseUrl = (): string => {
  // 1. Check if backend URL is provided via URL query parameter (e.g. ?backend=https://your-app.onrender.com)
  if (typeof window !== 'undefined' && window.location) {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryBackend = params.get('backend') || params.get('api') || params.get('backend_url');
      if (queryBackend && queryBackend.trim().length > 0) {
        const cleanQuery = queryBackend.trim().replace(/\/+$/, '');
        if (window.localStorage) {
          window.localStorage.setItem('ngdc_custom_backend_url', cleanQuery);
        }
        return cleanQuery;
      }
    } catch {}
  }

  // 2. Check Vite build-time environment variable
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    const envUrl =
      (metaEnv.VITE_BACKEND_URL as string) ||
      (metaEnv.VITE_API_BASE_URL as string) ||
      (metaEnv.VITE_API_URL as string) ||
      (metaEnv.VITE_SERVER_URL as string) ||
      '';

    if (envUrl && envUrl.trim().length > 0) {
      return envUrl.trim().replace(/\/+$/, '');
    }
  }

  // 3. Fallback to locally configured backend URL in LocalStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem('ngdc_custom_backend_url');
      if (stored && stored.trim().length > 0) {
        return stored.trim().replace(/\/+$/, '');
      }
    } catch {}
  }

  return '';
};

export const setCustomBackendUrl = (url: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (url && url.trim().length > 0) {
        window.localStorage.setItem('ngdc_custom_backend_url', url.trim().replace(/\/+$/, ''));
      } else {
        window.localStorage.removeItem('ngdc_custom_backend_url');
      }
    } catch {}
  }
};

export const apiUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const base = getBackendBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If external backend base URL is provided
  if (base) {
    if (cleanPath.startsWith('/api/') || cleanPath === '/api') {
      return `${base}${cleanPath}`;
    }
    return `${base}/api${cleanPath}`;
  }

  // Same-origin (e.g. Vercel Serverless Function or Express server)
  if (cleanPath.startsWith('/api/') || cleanPath === '/api') {
    return cleanPath;
  }
  return `/api${cleanPath}`;
};

export const getWsUrl = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    const customWs = metaEnv.VITE_WS_URL as string;
    if (customWs && customWs.trim()) {
      return customWs.trim();
    }
  }

  const backendBase = getBackendBaseUrl();
  if (backendBase) {
    const wsBase = backendBase.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
    return `${wsBase}/ws`;
  }

  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws`;
  }

  return 'ws://localhost:3000/ws';
};

export const WS_URL = getWsUrl();


