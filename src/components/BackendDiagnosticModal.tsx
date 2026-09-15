import React, { useState, useEffect } from 'react';
import { Server, Radio, CheckCircle2, AlertCircle, RefreshCw, X, Zap, ExternalLink, Database, Shield } from 'lucide-react';
import { getBackendBaseUrl, setCustomBackendUrl, apiUrl, getWsUrl } from '../config/api';

interface BackendDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendDiagnosticModal: React.FC<BackendDiagnosticModalProps> = ({ isOpen, onClose }) => {
  const [backendUrl, setBackendUrl] = useState(() => getBackendBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [dbStatus, setDbStatus] = useState<'idle' | 'success' | 'waking_up' | 'error'>('idle');
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const performHealthCheck = async (targetUrl?: string) => {
    setIsTesting(true);
    setErrorMessage(null);
    setSaveSuccessMsg(null);
    const startTime = performance.now();

    const baseUrl = targetUrl !== undefined ? targetUrl.trim().replace(/\/+$/, '') : getBackendBaseUrl();
    const testEndpoint = baseUrl ? `${baseUrl}/api/status` : '/api/status';

    try {
      // Set a 15-second timeout for Render cold-starts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(`${testEndpoint}?_t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Endpoint returned non-JSON response (${contentType}). Verify your Render service URL.`);
      }

      const data = await res.json();
      setDiagnosticResult(data);

      if (res.ok) {
        setDbStatus('success');
      } else {
        setDbStatus('error');
        setErrorMessage(data?.error || `HTTP ${res.status}: Failed to communicate with database.`);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));

      if (err.name === 'AbortError') {
        setDbStatus('waking_up');
        setErrorMessage('Render backend is currently spinning up from cold sleep (takes ~30-45s). Please re-test in a few seconds!');
      } else {
        setDbStatus('error');
        setErrorMessage(err?.message || 'Failed to reach Render backend. Check CORS and service status.');
      }
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setBackendUrl(getBackendBaseUrl());
      performHealthCheck();
    }
  }, [isOpen]);

  const handleSaveAndConnect = async () => {
    const clean = backendUrl.trim().replace(/\/+$/, '');
    setCustomBackendUrl(clean);
    setSaveSuccessMsg('Target Backend URL saved to this browser session!');
    await performHealthCheck(clean);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-[#1c1c18] relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cdc6b3]/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-100 text-violet-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1c1c18]">Render Backend &amp; Database Inspector</h3>
              <p className="text-xs text-[#7c7767]">Verify Cloudflare Pages ➔ Render Backend ➔ MongoDB Atlas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#7c7767] hover:text-[#1c1c18] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Badge */}
        <div className="p-4 rounded-2xl bg-white border border-[#cdc6b3]/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1c1c18] uppercase tracking-wider font-mono">
              Connection Health
            </span>
            <button
              type="button"
              onClick={() => performHealthCheck()}
              disabled={isTesting}
              className="px-3 py-1 bg-[#6b5e10] hover:bg-[#52480c] disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing...' : 'Ping Backend'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-[#f9f6ef] border border-[#cdc6b3]/50">
              <p className="text-[10px] uppercase font-mono text-[#7c7767]">Backend State</p>
              <p className="font-bold mt-1 flex items-center gap-1.5">
                {dbStatus === 'success' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
                {dbStatus === 'waking_up' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />}
                {dbStatus === 'error' && <span className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                {dbStatus === 'idle' && <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />}

                {dbStatus === 'success' && <span className="text-emerald-700">Online &amp; Active</span>}
                {dbStatus === 'waking_up' && <span className="text-amber-700">Waking Up (~30s)</span>}
                {dbStatus === 'error' && <span className="text-red-700">Unreachable</span>}
                {dbStatus === 'idle' && <span className="text-stone-600">Pending Test</span>}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#f9f6ef] border border-[#cdc6b3]/50">
              <p className="text-[10px] uppercase font-mono text-[#7c7767]">Roundtrip Latency</p>
              <p className="font-bold text-[#1c1c18] mt-1">
                {latencyMs !== null ? `${latencyMs} ms` : '—'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#f9f6ef] border border-[#cdc6b3]/50">
              <p className="text-[10px] uppercase font-mono text-[#7c7767]">Database Cluster</p>
              <p className="font-bold text-[#1c1c18] mt-1 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-[#6b5e10]" />
                {diagnosticResult?.connected ? 'Cluster0 (Atlas)' : 'Local Fallback'}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{errorMessage}</p>
                {dbStatus === 'waking_up' && (
                  <p className="text-[11px] text-amber-800">
                    💡 Render free tier web services spin down after 15 minutes of inactivity. Sending this ping wakes up your backend. Click "Ping Backend" again in 20 seconds.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Backend URL Switcher / Override */}
        <div className="p-4 rounded-2xl bg-white border border-[#cdc6b3]/70 space-y-3">
          <label className="text-xs font-bold text-[#1c1c18] block">
            Target Render Backend Service URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://your-service-name.onrender.com"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#f9f6ef] border border-[#cdc6b3] text-[#1c1c18] focus:outline-none focus:border-[#6b5e10]"
            />
            <button
              type="button"
              onClick={handleSaveAndConnect}
              disabled={isTesting}
              className="px-4 py-2 bg-[#6b5e10] hover:bg-[#52480c] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save &amp; Connect
            </button>
          </div>

          {saveSuccessMsg && (
            <p className="text-xs text-emerald-600 font-medium animate-fadeIn">
              ✓ {saveSuccessMsg}
            </p>
          )}

          <div className="p-3 rounded-xl bg-[#f9f6ef] text-[11px] text-[#7c7767] space-y-1.5 border border-[#cdc6b3]/40">
            <p className="font-semibold text-[#1c1c18]">Quick Tips for Render &amp; Cloudflare:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>In Cloudflare Pages <strong>Settings &gt; Environment variables</strong>, add: <code>VITE_BACKEND_URL = {backendUrl || 'https://your-service.onrender.com'}</code></li>
              <li>In Render Dashboard, ensure <strong>MONGODB_URI</strong> is set and MongoDB Network Access allows <code>0.0.0.0/0</code>.</li>
              <li>You can also append <code>?backend=https://your-service.onrender.com</code> to your Cloudflare URL to connect instantly without rebuilding!</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#f0ebd9] hover:bg-[#e6deca] text-[#1c1c18] text-xs font-bold rounded-xl transition-colors cursor-pointer border border-[#cdc6b3]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
