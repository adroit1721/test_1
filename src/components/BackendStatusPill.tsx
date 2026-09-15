import React, { useState, useEffect } from 'react';
import { Radio, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { getBackendBaseUrl, apiUrl } from '../config/api';

interface BackendStatusPillProps {
  onClick: () => void;
}

export const BackendStatusPill: React.FC<BackendStatusPillProps> = ({ onClick }) => {
  const [status, setStatus] = useState<'connected' | 'waking_up' | 'offline' | 'checking'>('checking');
  const [backendDomain, setBackendDomain] = useState<string>('');

  const checkConnection = async () => {
    const base = getBackendBaseUrl();
    if (!base) {
      // Local fallback mode
      setStatus('offline');
      setBackendDomain('Local Standalone');
      return;
    }

    try {
      const urlObj = new URL(base);
      setBackendDomain(urlObj.hostname.replace('.onrender.com', ' (Render)'));
    } catch {
      setBackendDomain('Render');
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(apiUrl('/api/status'), { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timer);

      if (res.ok) {
        setStatus('connected');
      } else {
        setStatus('offline');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('waking_up');
      } else {
        setStatus('offline');
      }
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to inspect Render Backend & MongoDB connection"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 dark:bg-[#201f1c]/90 border border-[#cdc6b3] dark:border-[#423e35] shadow-xs hover:border-[#6b5e10] transition-all cursor-pointer select-none"
    >
      {status === 'connected' && (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-800 dark:text-emerald-400 font-semibold">
            {backendDomain ? `Backend: ${backendDomain}` : 'Backend: Connected'}
          </span>
        </>
      )}

      {status === 'waking_up' && (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="text-amber-800 dark:text-amber-400 font-semibold">
            Render: Waking up...
          </span>
        </>
      )}

      {status === 'offline' && (
        <>
          <span className="w-2 h-2 rounded-full bg-stone-400" />
          <span className="text-stone-700 dark:text-stone-300">
            {backendDomain ? `Backend: Standalone (${backendDomain})` : 'Backend: Standalone Mode'}
          </span>
        </>
      )}

      {status === 'checking' && (
        <>
          <RefreshCw className="w-3 h-3 animate-spin text-stone-500" />
          <span className="text-stone-600">Verifying Backend...</span>
        </>
      )}
    </button>
  );
};
