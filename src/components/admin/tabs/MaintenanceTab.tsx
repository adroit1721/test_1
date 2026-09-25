import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { MaintenanceConfig, MaintenanceMode, BannerSeverity } from '../../../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Lock,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { MaintenanceLockdown } from '../../maintenance/MaintenanceLockdown';
import { MaintenanceBanner } from '../../maintenance/MaintenanceBanner';

export const MaintenanceTab: React.FC = () => {
  const {
    maintenanceConfig,
    updateMaintenanceConfig,
    setMaintenanceMode,
    adminPreviewMode,
    setAdminPreviewMode,
  } = useAdminData();

  // Local working copy of config for form editing
  const [formData, setFormData] = useState<MaintenanceConfig>(() => ({
    ...maintenanceConfig,
    emergencyContact: { ...maintenanceConfig.emergencyContact },
  }));

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewModalMode, setPreviewModalMode] = useState<'none' | 'banner' | 'lockdown'>('none');

  React.useEffect(() => {
    if (!isDirty && maintenanceConfig) {
      setFormData({
        ...maintenanceConfig,
        emergencyContact: { ...maintenanceConfig.emergencyContact },
      });
    }
  }, [maintenanceConfig, isDirty]);

  // Quick Preset Handlers
  const addHoursToRestoration = (hours: number) => {
    const newTarget = new Date(Date.now() + hours * 3600 * 1000);
    setFormData((prev) => ({
      ...prev,
      estimatedRestorationTime: newTarget.toISOString(),
    }));
  };

  // Preset Notice Templates
  const applyTemplate = (type: 'maintenance' | 'recruitment' | 'database') => {
    if (type === 'maintenance') {
      setFormData((prev) => ({
        ...prev,
        headline: 'Scheduled System Maintenance & Cloud Optimization',
        message:
          'The official NGDC-BNCC web portal is undergoing scheduled infrastructure upgrades and database indexing to better serve our cadets and officers. Core public features will resume shortly.',
        bannerSeverity: 'warning',
        bannerLinkText: 'View Circulars',
        bannerLinkUrl: '#notices',
      }));
    } else if (type === 'recruitment') {
      setFormData((prev) => ({
        ...prev,
        headline: 'Cadet Recruitment Surge Management',
        message:
          'Due to an unprecedented volume of recruitment applicants, server traffic throttling is temporarily active. Online intake will reopen within the hour.',
        bannerSeverity: 'info',
        bannerLinkText: 'Recruitment Guidelines',
        bannerLinkUrl: '#recruitment',
      }));
    } else if (type === 'database') {
      setFormData((prev) => ({
        ...prev,
        headline: 'Urgent Platoon Database Security Audit',
        message:
          'Routine end-to-end security audits and cryptographic roster validation in progress. Public cadet directories are safely isolated during this window.',
        bannerSeverity: 'critical',
        bannerLinkText: 'Contact Command',
        bannerLinkUrl: '#contact',
      }));
    }
  };

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateMaintenanceConfig(formData);
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save maintenance configuration:', err);
      alert('Failed to save settings to the server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Convert ISO string to HTML5 datetime-local input string
  const toDateTimeLocal = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      return localISOTime;
    } catch {
      return '';
    }
  };

  const handleDateTimeChange = (val: string) => {
    if (!val) return;
    try {
      const date = new Date(val);
      setFormData((prev) => ({
        ...prev,
        estimatedRestorationTime: date.toISOString(),
      }));
    } catch {}
  };

  // Calculate remaining human readable time
  const getRemainingPreview = () => {
    if (!formData.estimatedRestorationTime) return 'No time specified';
    const target = new Date(formData.estimatedRestorationTime).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return 'Restoration time reached (0s remaining)';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `In ~${hours} hour${hours === 1 ? '' : 's'} and ${mins} minute${mins === 1 ? '' : 's'}`;
  };

  return (
    <div className="space-y-8 max-w-5xl font-sans pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-[#1b4332] dark:text-[#52b788]" />
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              Operational Site Maintenance & Public Notice Hub
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Control the institutional operational status of the portal, deploy non-blocking public announcement banners, or execute a complete portal lockdown.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="maintenance-save-header-btn"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1b4332] hover:bg-[#143427] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Broadcasting...' : 'Save & Broadcast'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Operational maintenance configuration has been synchronized to cloud storage and broadcast in real-time across all connected clients.</span>
        </div>
      )}

      {/* Section 1: Dual Operational Modes Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          1. Select Operational Portal Mode
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Disabled (Normal Operational) */}
          <div
            onClick={() => setFormData((prev) => ({ ...prev, mode: 'disabled' }))}
            className={`cursor-pointer rounded-xl border p-5 transition-all relative ${
              formData.mode === 'disabled'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white dark:bg-[#1a1916] border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                formData.mode === 'disabled'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}>
                {formData.mode === 'disabled' ? 'Active' : 'Standby'}
              </span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
              Normal Operations
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Portal is 100% accessible to all public visitors. No warning banners or restrictions are active.
            </p>
          </div>

          {/* Card 2: Mode A (Announcement Warning Banner) */}
          <div
            onClick={() => setFormData((prev) => ({ ...prev, mode: 'banner' }))}
            className={`cursor-pointer rounded-xl border p-5 transition-all relative ${
              formData.mode === 'banner'
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white dark:bg-[#1a1916] border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                formData.mode === 'banner'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}>
                {formData.mode === 'banner' ? 'Active' : 'Standby'}
              </span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
              Mode A: Warning Banner
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Non-blocking header banner alerting visitors of upcoming maintenance or recruitment schedules while keeping the website accessible.
            </p>
          </div>

          {/* Card 3: Mode B (Full Portal Lockdown) */}
          <div
            onClick={() => setFormData((prev) => ({ ...prev, mode: 'lockdown' }))}
            className={`cursor-pointer rounded-xl border p-5 transition-all relative ${
              formData.mode === 'lockdown'
                ? 'bg-red-50/70 dark:bg-red-950/30 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                : 'bg-white dark:bg-[#1a1916] border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-700 dark:text-red-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                formData.mode === 'lockdown'
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}>
                {formData.mode === 'lockdown' ? 'Active' : 'Standby'}
              </span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
              Mode B: Full Portal Lockdown
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Full-page institutional maintenance screen displaying live countdown timers, estimated restoration time, reasons, emergency PUO contacts, and officer login bypass link.
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview Button Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-stone-100 dark:bg-[#1a1916] border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
          <Eye className="w-4 h-4 text-stone-500" />
          <span>Need to test before publishing? Preview exact public renderings:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="preview-mode-a-btn"
            type="button"
            onClick={() => setPreviewModalMode('banner')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-750 transition-colors cursor-pointer"
          >
            Preview Mode A (Banner)
          </button>
          <button
            id="preview-mode-b-btn"
            type="button"
            onClick={() => setPreviewModalMode('lockdown')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-750 transition-colors cursor-pointer"
          >
            Preview Mode B (Lockdown)
          </button>
        </div>
      </div>

      {/* Section 2: Notice Messaging & Templates */}
      <div className="bg-white dark:bg-[#1a1916] rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              2. Custom Notice Headline & Body Content
            </h3>
            <p className="text-xs text-stone-500">
              Craft the official explanation shown on the warning banner or lockdown screen.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] text-stone-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Templates:
            </span>
            <button
              type="button"
              onClick={() => applyTemplate('maintenance')}
              className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Scheduled Maintenance
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('recruitment')}
              className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Recruitment Surge
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('database')}
              className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Security Audit
            </button>
          </div>
        </div>

        {/* Headline Input */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Notice Headline
          </label>
          <input
            id="maintenance-headline-input"
            type="text"
            value={formData.headline}
            onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
            placeholder="e.g., Scheduled System Maintenance & Cloud Optimization"
            className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1b4332]"
          />
        </div>

        {/* Body Message Textarea */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Detailed Reason / Body Message
          </label>
          <textarea
            id="maintenance-message-textarea"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Explain the scheduled maintenance, expected outcome, or instructions for cadets..."
            className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1b4332] leading-relaxed"
          />
        </div>

        {/* Banner Specific Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Banner Severity Color
            </label>
            <select
              id="maintenance-severity-select"
              value={formData.bannerSeverity || 'warning'}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bannerSeverity: e.target.value as BannerSeverity }))
              }
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs font-medium text-stone-800 dark:text-stone-200"
            >
              <option value="warning">Warning (Amber)</option>
              <option value="info">Informational (Blue)</option>
              <option value="critical">Critical / Urgent (Red)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Action Link Text (Optional)
            </label>
            <input
              id="maintenance-linktext-input"
              type="text"
              value={formData.bannerLinkText || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, bannerLinkText: e.target.value }))}
              placeholder="e.g., View Schedules"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Action Link Destination (URL or #tab)
            </label>
            <input
              id="maintenance-linkurl-input"
              type="text"
              value={formData.bannerLinkUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, bannerLinkUrl: e.target.value }))}
              placeholder="e.g., #recruitment or https://..."
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs text-stone-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="maintenance-dismissible-checkbox"
            type="checkbox"
            checked={Boolean(formData.bannerDismissible)}
            onChange={(e) => setFormData((prev) => ({ ...prev, bannerDismissible: e.target.checked }))}
            className="w-4 h-4 rounded text-[#1b4332] focus:ring-[#1b4332]"
          />
          <label htmlFor="maintenance-dismissible-checkbox" className="text-xs text-stone-600 dark:text-stone-300 cursor-pointer">
            Allow public visitors to dismiss Mode A warning banner for their browsing session
          </label>
        </div>
      </div>

      {/* Section 3: Quick Time Presets & Estimated Restoration Time */}
      <div className="bg-white dark:bg-[#1a1916] rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-xs">
        <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1b4332] dark:text-[#52b788]" />
            <span>3. Estimated Restoration Time & Quick Presets</span>
          </h3>
          <p className="text-xs text-stone-500">
            Configure the countdown timer target displayed prominently to visitors during lockdown or on the banner.
          </p>
        </div>

        {/* Quick Presets Buttons */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Quick Time Extensions
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: '+1 Hour', hours: 1 },
              { label: '+3 Hours', hours: 3 },
              { label: '+6 Hours', hours: 6 },
              { label: '+12 Hours', hours: 12 },
              { label: '+24 Hours', hours: 24 },
            ].map((preset) => (
              <button
                key={preset.hours}
                type="button"
                onClick={() => addHoursToRestoration(preset.hours)}
                className="px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#1b4332] hover:text-white dark:hover:bg-[#1b4332] text-xs font-bold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer text-center"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exact Datetime Input & Live Status Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Exact Target Restoration Time (Local Time)
            </label>
            <input
              id="maintenance-restoration-datetime"
              type="datetime-local"
              value={toDateTimeLocal(formData.estimatedRestorationTime)}
              onChange={(e) => handleDateTimeChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1b4332]"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-0.5">
              Live Countdown Preview
            </span>
            <span className="text-xs font-bold text-[#1b4332] dark:text-[#52b788]">
              {getRemainingPreview()}
            </span>
            <span className="text-[11px] text-stone-400 mt-1">
              Target: {formData.estimatedRestorationTime ? new Date(formData.estimatedRestorationTime).toLocaleString() : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Emergency PUO Contacts Customization */}
      <div className="bg-white dark:bg-[#1a1916] rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-xs">
        <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#1b4332] dark:text-[#52b788]" />
            <span>4. Emergency PUO Contacts Customization</span>
          </h3>
          <p className="text-xs text-stone-500">
            Institutional officer coordinates displayed to cadets and applicants during portal lockdown for emergency escalation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Officer Name
            </label>
            <input
              id="emergency-officer-name"
              type="text"
              value={formData.emergencyContact?.officerName || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, officerName: e.target.value },
                }))
              }
              placeholder="e.g., Dr. Md. Golam Rahman"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Officer Designation
            </label>
            <input
              id="emergency-officer-designation"
              type="text"
              value={formData.emergencyContact?.designation || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, designation: e.target.value },
                }))
              }
              placeholder="e.g., Professor & PUO, NGDC-BNCC Platoon"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Direct Phone (Click-to-Call)
            </label>
            <input
              id="emergency-officer-phone"
              type="text"
              value={formData.emergencyContact?.phone || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value },
                }))
              }
              placeholder="+880 1711-234567"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Official Email Address
            </label>
            <input
              id="emergency-officer-email"
              type="email"
              value={formData.emergencyContact?.email || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, email: e.target.value },
                }))
              }
              placeholder="puo.bncc@ngdc.ac.bd"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Office / Room Location
            </label>
            <input
              id="emergency-officer-location"
              type="text"
              value={formData.emergencyContact?.officeLocation || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, officeLocation: e.target.value },
                }))
              }
              placeholder="Room 204, Administrative Building, NGDC"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs text-stone-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Direct WhatsApp Number (Optional)
            </label>
            <input
              id="emergency-officer-whatsapp"
              type="text"
              value={formData.emergencyContact?.whatsappNumber || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, whatsappNumber: e.target.value },
                }))
              }
              placeholder="+8801711234567"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#fcfbf9] dark:bg-[#21201c] text-xs text-stone-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Officer Bypass Settings */}
      <div className="bg-white dark:bg-[#1a1916] rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xs">
        <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#1b4332] dark:text-[#52b788]" />
            <span>5. Officer Login Bypass Policy</span>
          </h3>
          <p className="text-xs text-stone-500">
            Control whether platoon command officers can bypass the lockdown screen and access administrative services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="maintenance-allow-bypass-checkbox"
            type="checkbox"
            checked={formData.allowOfficerBypass}
            onChange={(e) => setFormData((prev) => ({ ...prev, allowOfficerBypass: e.target.checked }))}
            className="w-4 h-4 rounded text-[#1b4332] focus:ring-[#1b4332]"
          />
          <div>
            <label htmlFor="maintenance-allow-bypass-checkbox" className="text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer">
              Display "Officer Command Bypass" link on the Lockdown maintenance screen
            </label>
            <p className="text-[11px] text-stone-500">
              Permits authorized BNCC officers to sign in at <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono">/ngdc_bncc_admin/login</code> while the public site remains locked.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          id="maintenance-save-bottom-btn"
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1b4332] hover:bg-[#143427] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Broadcasting to Cloud...' : 'Save & Broadcast All Changes'}</span>
        </button>
      </div>

      {/* Modal Preview for Mode A or Mode B */}
      {previewModalMode !== 'none' && (
        <div
          id="maintenance-preview-modal-overlay"
          className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-start overflow-y-auto"
        >
          {/* Modal Header Bar */}
          <div className="w-full bg-[#1b4332] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4 text-amber-300" />
              <span>
                Interactive Preview: {previewModalMode === 'lockdown' ? 'Mode B (Full Portal Lockdown)' : 'Mode A (Announcement Banner)'}
              </span>
            </div>
            <button
              id="close-preview-modal-btn"
              type="button"
              onClick={() => setPreviewModalMode('none')}
              className="px-3 py-1 rounded bg-white text-[#1b4332] text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>

          {/* Render Preview Content */}
          <div className="w-full flex-grow">
            {previewModalMode === 'lockdown' ? (
              <MaintenanceLockdown
                config={formData}
                isAdminAuthenticated={true}
                isPreview={true}
                onExitPreview={() => setPreviewModalMode('none')}
              />
            ) : (
              <div className="p-6 max-w-5xl mx-auto space-y-4">
                <div className="bg-white dark:bg-[#1a1916] rounded-xl p-4 border border-stone-200 shadow-sm">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Header Warning Banner Preview
                  </p>
                  <MaintenanceBanner
                    config={formData}
                    onNavigateAction={(tab) => alert(`Navigation clicked: ${tab}`)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
