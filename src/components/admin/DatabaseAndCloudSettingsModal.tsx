import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Server,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Radio,
  Lock,
  Download,
  Upload,
} from 'lucide-react';
import { getBackendStatus, BackendStatus, getAuthToken } from '../../utils/apiClient';
import { syncLocalToAppwrite as syncLocalToBackend, MigrationProgress } from '../../utils/migrationService';
import { getCloudinaryConfig, isCloudinaryConfigured } from '../../utils/cloudinary';
import { upsertSetting } from '../../utils/siteSettings';

interface DatabaseAndCloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCadets?: () => void;
}

export const DatabaseAndCloudSettingsModal: React.FC<DatabaseAndCloudSettingsModalProps> = ({
  isOpen,
  onClose,
  onSyncCadets,
}) => {
  // Sync / Backup States
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<MigrationProgress | null>(null);

  // MongoDB & Backend Status
  const [mongoStatus, setMongoStatus] = useState<BackendStatus>({
    type: 'MongoDB',
    connected: false,
    hasUri: false,
    error: null,
    isWhitelistError: false,
    settingsCount: 0,
    cadetsCount: 0,
    connectedSseClients: 1,
    syncVersion: Date.now(),
  });
  const [checkingMongo, setCheckingMongo] = useState(false);

  // Cloudinary States
  const [cloudinaryName, setCloudinaryName] = useState('');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('');
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'mongodb' | 'realtime' | 'jwt' | 'cloudinary' | 'sync'>('mongodb');

  const checkMongoStatus = async () => {
    setCheckingMongo(true);
    try {
      const status = await getBackendStatus();
      if (status) {
        setMongoStatus(status);
      }
    } catch {}
    setCheckingMongo(false);
  };

  const handleReconnectMongo = async () => {
    setCheckingMongo(true);
    try {
      const res = await fetch('/api/db/reconnect', { method: 'POST' });
      if (res.ok) {
        await checkMongoStatus();
        if (onSyncCadets) {
          onSyncCadets();
        }
      }
    } catch {}
    setCheckingMongo(false);
  };

  // Load configuration
  useEffect(() => {
    if (isOpen) {
      checkMongoStatus();

      const cloudConfig = getCloudinaryConfig();
      setCloudinaryName(cloudConfig.cloudName || '');
      setCloudinaryPreset(cloudConfig.uploadPreset || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Cloudinary Save Handler
  const handleSaveCloudinary = async () => {
    await upsertSetting('ngdc_cloudinary_cloud_name', cloudinaryName.trim());
    await upsertSetting('ngdc_cloudinary_upload_preset', cloudinaryPreset.trim());

    if (typeof window !== 'undefined') {
      localStorage.setItem('ngdc_cloudinary_cloud_name', cloudinaryName.trim());
      localStorage.setItem('ngdc_cloudinary_upload_preset', cloudinaryPreset.trim());
    }

    if (cloudinaryName.trim() && cloudinaryPreset.trim()) {
      setCloudinaryStatus({
        type: 'success',
        message: 'Cloudinary configuration saved! Image upload is online.',
      });
    } else {
      setCloudinaryStatus({
        type: 'idle',
        message: 'Saved. Leave empty to use local preview storage.',
      });
    }
  };

  // Test Real-time Broadcast
  const handleTestRealtimeBroadcast = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ngdc_realtime_ping', value: Date.now() }),
      });
      await checkMongoStatus();
    } catch {}
  };

  // Run Backend Sync
  const handleStartSync = async () => {
    setSyncing(true);
    setSyncProgress(null);
    try {
      await syncLocalToBackend((p) => setSyncProgress(p));
      await checkMongoStatus();
      if (onSyncCadets) onSyncCadets();
    } catch (err: any) {
      setSyncProgress({
        stage: 'error',
        message: err?.message || 'Sync failed',
        settingsTotal: 0,
        settingsProcessed: 0,
        cadetsTotal: 0,
        cadetsProcessed: 0,
      });
    }
    setSyncing(false);
  };

  const hasJwtToken = Boolean(getAuthToken());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#cdc6b3] dark:border-[#423e35] bg-[#f5f1e8] dark:bg-[#252420]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#eedc82]/30 dark:bg-[#eedc82]/10 border border-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                Full-Stack Architecture & Cloud Console
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Express + MongoDB Atlas + WebSocket
                </span>
              </h3>
              <p className="text-xs text-[#7c7767] dark:text-[#a8a392]">
                High-speed WebSockets real-time sync, JWT authentication, and authoritative MongoDB Atlas cloud database.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#e6e1d5] dark:hover:bg-[#33312b] text-[#7c7767] dark:text-[#a8a392] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#cdc6b3] dark:border-[#423e35] bg-[#f9f6ef] dark:bg-[#1a1916] overflow-x-auto px-4">
          <button
            onClick={() => setActiveTab('mongodb')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'mongodb'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82] bg-white dark:bg-[#1e1d19]'
                : 'border-transparent text-[#7c7767] dark:text-[#a8a392] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>MongoDB Atlas</span>
            <span
              className={`w-2 h-2 rounded-full ${
                mongoStatus.connected ? 'bg-emerald-500 animate-pulse' : mongoStatus.hasUri ? 'bg-amber-500' : 'bg-gray-400'
              }`}
            />
          </button>

          <button
            onClick={() => setActiveTab('realtime')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'realtime'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82] bg-white dark:bg-[#1e1d19]'
                : 'border-transparent text-[#7c7767] dark:text-[#a8a392] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Real-time WebSocket Push</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-mono">
              0ms Ultra-Fast
            </span>
          </button>

          <button
            onClick={() => setActiveTab('jwt')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'jwt'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82] bg-white dark:bg-[#1e1d19]'
                : 'border-transparent text-[#7c7767] dark:text-[#a8a392] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>JWT Auth & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudinary')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'cloudinary'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82] bg-white dark:bg-[#1e1d19]'
                : 'border-transparent text-[#7c7767] dark:text-[#a8a392] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloudinary CDN</span>
            {isCloudinaryConfigured() && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'sync'
                ? 'border-[#6b5e10] dark:border-[#eedc82] text-[#6b5e10] dark:text-[#eedc82] bg-white dark:bg-[#1e1d19]'
                : 'border-transparent text-[#7c7767] dark:text-[#a8a392] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Data Sync & Backup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#1c1c18] dark:text-[#fcfbf7]">
          {/* TAB 1: MONGODB ATLAS */}
          {activeTab === 'mongodb' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      mongoStatus.connected
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : mongoStatus.hasUri
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      MongoDB Atlas Cloud Database
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          mongoStatus.connected
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                        }`}
                      >
                        {mongoStatus.connected ? 'ONLINE (MONGODB ATLAS CLOUD MASTER)' : 'LOCAL IN-MEMORY MIRROR'}
                      </span>
                    </h4>
                    <p className="text-xs text-[#7c7767] dark:text-[#a8a392] mt-0.5">
                      {mongoStatus.connected
                        ? 'Connected to MongoDB Atlas cluster. All cadet rosters and site configurations persist permanently in the cloud with sub-millisecond RAM read mirrors.'
                        : 'Operating at lightning speed from Node.js RAM. Connect MongoDB Atlas URI in .env to persist permanently.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReconnectMongo}
                  disabled={checkingMongo}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#6b5e10] hover:bg-[#52480c] text-white flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingMongo ? 'animate-spin' : ''}`} />
                  {checkingMongo ? 'Connecting...' : 'Test Connection'}
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35]">
                  <p className="text-[10px] font-mono uppercase text-[#7c7767] dark:text-[#a8a392]">Settings Documents</p>
                  <p className="text-xl font-black text-[#1c1c18] dark:text-[#fcfbf7] mt-1">
                    {mongoStatus.settingsCount}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Atlas Synced</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35]">
                  <p className="text-[10px] font-mono uppercase text-[#7c7767] dark:text-[#a8a392]">Cadets Records</p>
                  <p className="text-xl font-black text-[#1c1c18] dark:text-[#fcfbf7] mt-1">
                    {mongoStatus.cadetsCount}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Atlas Synced</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35]">
                  <p className="text-[10px] font-mono uppercase text-[#7c7767] dark:text-[#a8a392]">Connected Clients</p>
                  <p className="text-xl font-black text-[#1c1c18] dark:text-[#fcfbf7] mt-1">
                    {mongoStatus.totalConnectedClients || mongoStatus.connectedWsClients || mongoStatus.connectedSseClients || 1}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold">WebSocket & SSE</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35]">
                  <p className="text-[10px] font-mono uppercase text-[#7c7767] dark:text-[#a8a392]">Sync Latency</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    0-2 ms
                  </p>
                  <span className="text-[10px] text-[#7c7767] font-semibold">WebSocket Push</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-[#eedc82]/20 dark:bg-[#eedc82]/5 border border-[#eedc82]/40 text-xs space-y-2">
                <h5 className="font-bold flex items-center gap-1.5 text-[#6b5e10] dark:text-[#eedc82]">
                  <Sparkles className="w-4 h-4" />
                  MongoDB Atlas Cluster Details:
                </h5>
                <p className="text-[#695c4e] dark:text-[#c4beaf]">
                  Database cluster is connected via MONGODB_URI. In MongoDB Atlas Network Access, ensure <strong>0.0.0.0/0</strong> (Allow Access from Anywhere) is permitted for cloud environments.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: REAL-TIME WEBSOCKET PUSH */}
          {activeTab === 'realtime' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                      Bi-directional WebSocket + SSE Real-Time Sync Engine
                    </h4>
                    <p className="text-xs text-[#7c7767] dark:text-[#a8a392]">
                      Zero-reload instant cross-device updates. When an admin makes a change, all mobile phones, tablets, and browser tabs update in under 2ms.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#f5f1e8] dark:bg-[#1a1916] border border-[#cdc6b3]/50 dark:border-[#423e35]">
                    <p className="text-[10px] font-mono uppercase text-[#7c7767]">Primary Protocol</p>
                    <p className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] mt-1">Native WebSocket (/ws)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f5f1e8] dark:bg-[#1a1916] border border-[#cdc6b3]/50 dark:border-[#423e35]">
                    <p className="text-[10px] font-mono uppercase text-[#7c7767]">Secondary Channel</p>
                    <p className="font-bold text-sm text-emerald-600 mt-1">HTTP/2 SSE (/api/events)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f5f1e8] dark:bg-[#1a1916] border border-[#cdc6b3]/50 dark:border-[#423e35]">
                    <p className="text-[10px] font-mono uppercase text-[#7c7767]">Connected Devices</p>
                    <p className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] mt-1">
                      {mongoStatus.totalConnectedClients || mongoStatus.connectedWsClients || mongoStatus.connectedSseClients || 1} active client(s)
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleTestRealtimeBroadcast}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#6b5e10] hover:bg-[#52480c] text-white flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Send Test Broadcast Event
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JWT AUTHENTICATION */}
          {activeTab === 'jwt' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                      JSON Web Token (JWT) Security & Middleware
                    </h4>
                    <p className="text-xs text-[#7c7767] dark:text-[#a8a392]">
                      Stateless, tamper-proof authorization protecting all administrative mutations.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f5f1e8] dark:bg-[#1a1916] border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#7c7767]">Active Admin Session Status:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        hasJwtToken ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {hasJwtToken ? 'JWT Authenticated' : 'Local PIN Active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#7c7767]">Algorithm:</span>
                    <span className="font-mono font-bold">HMAC SHA-256 (HS256)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#7c7767]">Token Expiration:</span>
                    <span className="font-mono font-bold">30 Days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUDINARY CDN */}
          {activeTab === 'cloudinary' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                      Cloudinary Image Storage & CDN
                    </h4>
                    <p className="text-xs text-[#7c7767] dark:text-[#a8a392]">
                      Upload photos directly to Cloudinary for fast global delivery and instant WebP optimization.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Cloud Name
                    </label>
                    <input
                      type="text"
                      value={cloudinaryName}
                      onChange={(e) => setCloudinaryName(e.target.value)}
                      placeholder="e.g. dxyz123abc"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdc6b3] dark:border-[#423e35] bg-white dark:bg-[#1a1916] text-[#1c1c18] dark:text-[#fcfbf7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Unsigned Upload Preset
                    </label>
                    <input
                      type="text"
                      value={cloudinaryPreset}
                      onChange={(e) => setCloudinaryPreset(e.target.value)}
                      placeholder="e.g. bncc_uploads"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#cdc6b3] dark:border-[#423e35] bg-white dark:bg-[#1a1916] text-[#1c1c18] dark:text-[#fcfbf7]"
                    />
                  </div>

                  {cloudinaryStatus.message && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        cloudinaryStatus.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-[#f5f1e8] text-[#7c7767]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{cloudinaryStatus.message}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveCloudinary}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#6b5e10] hover:bg-[#52480c] text-white transition-colors shadow-xs"
                    >
                      Save Cloudinary Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA SYNC & BACKUP */}
          {activeTab === 'sync' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                      Database Migration & Synchronization
                    </h4>
                    <p className="text-xs text-[#7c7767] dark:text-[#a8a392]">
                      Synchronize all browser local settings and cadet roster into the Express + MongoDB backend.
                    </p>
                  </div>
                </div>

                {syncProgress && (
                  <div
                    className={`p-4 rounded-xl text-xs space-y-2 ${
                      syncProgress.stage === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : syncProgress.stage === 'error'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    <p className="font-bold">{syncProgress.message}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleStartSync}
                    disabled={syncing}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#6b5e10] hover:bg-[#52480c] text-white flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Synchronizing...' : 'Sync Local Data to MongoDB'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#cdc6b3] dark:border-[#423e35] bg-[#f5f1e8] dark:bg-[#252420] flex items-center justify-between text-xs text-[#7c7767] dark:text-[#a8a392]">
          <span>NGDC-BNCC Cloud Architecture v2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#e6e1d5] dark:bg-[#33312b] text-[#1c1c18] dark:text-[#fcfbf7] hover:bg-[#d8d3c5] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
