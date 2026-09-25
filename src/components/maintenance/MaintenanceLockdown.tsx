import React, { useState, useEffect } from 'react';
import { MaintenanceConfig } from '../../types';
import {
  ShieldAlert,
  Clock,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Lock,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

interface MaintenanceLockdownProps {
  config: MaintenanceConfig;
  onOfficerBypass?: () => void;
  isAdminAuthenticated?: boolean;
  onExitPreview?: () => void;
  isPreview?: boolean;
}

export const MaintenanceLockdown: React.FC<MaintenanceLockdownProps> = ({
  config,
  onOfficerBypass,
  isAdminAuthenticated = false,
  onExitPreview,
  isPreview = false,
}) => {
  const { headerLeftLogoUrl, headerRightLogoUrl, headerTitle, headerSubtitle } = useAdminData();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPassed: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      if (!config.estimatedRestorationTime) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: false });
        return;
      }
      const target = new Date(config.estimatedRestorationTime).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.estimatedRestorationTime]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const formattedRestorationTime = config.estimatedRestorationTime
    ? new Date(config.estimatedRestorationTime).toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      })
    : 'Pending Operational Determination';

  const bstTime = config.estimatedRestorationTime
    ? new Date(config.estimatedRestorationTime).toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) + ' BST (UTC+6)'
    : null;

  return (
    <div
      id="portal-lockdown-container"
      className="min-h-screen bg-[#f7f5f0] dark:bg-[#12110e] text-[#1c1c18] dark:text-[#fcfbf7] flex flex-col justify-between selection:bg-[#eedc82] selection:text-[#1c1c18] relative font-sans"
    >
      {/* Subtle Top Accent Military Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1b4332] via-[#b8860b] to-[#b91c1c]" />

      {/* Preview Notification Banner for Admin */}
      {isPreview && (
        <div className="bg-[#b45309] text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-3">
          <span>⚠️ You are previewing Mode B (Full Portal Lockdown) as an Administrator</span>
          {onExitPreview && (
            <button
              id="exit-lockdown-preview-btn"
              type="button"
              onClick={onExitPreview}
              className="px-3 py-1 rounded bg-white text-[#b45309] text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Exit Preview
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 py-10 sm:py-16 flex-grow flex flex-col items-center justify-center text-center">
        {/* Institutional Logos Header */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
          <img
            src={headerLeftLogoUrl}
            alt="New Govt. Degree College Crest"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="h-10 w-px bg-stone-300 dark:bg-stone-700" />
          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#1b4332] dark:text-[#52b788]">
              Bangladesh National Cadet Corps
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-stone-500 dark:text-stone-400 tracking-wider">
              New Govt. Degree College Platoon • Rajshahi
            </span>
          </div>
          <div className="h-10 w-px bg-stone-300 dark:bg-stone-700" />
          <img
            src={headerRightLogoUrl}
            alt="BNCC Platoon Crest"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-ping" />
          <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>Operational Site Maintenance & Lockdown</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1c1c18] dark:text-white tracking-tight max-w-2xl leading-tight mb-4">
          {config.headline || 'Scheduled Portal Maintenance & Database Optimization'}
        </h1>

        {/* Detailed Reason / Message */}
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl mb-8 leading-relaxed">
          {config.message ||
            'The official NGDC-BNCC Platoon portal is undergoing scheduled operational maintenance, security auditing, and server optimization. Public cadet records, registration pipelines, and notice services are temporarily guarded.'}
        </p>

        {/* Live Countdown Timer Grid */}
        <div className="w-full max-w-xl bg-white dark:bg-[#1a1916] rounded-xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <Clock className="w-4 h-4 text-[#1b4332] dark:text-[#52b788]" />
              <span>Estimated Portal Restoration</span>
            </div>
            {timeLeft.isPassed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Finalizing Checks
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Countdown
              </span>
            )}
          </div>

          {timeLeft.isPassed ? (
            <div className="py-4 text-center">
              <p className="text-base font-bold text-amber-700 dark:text-amber-300 mb-1">
                Restoration Window in Progress
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                The technical administration is running final integrity verifications. The portal will be back online shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              <div className="bg-[#fcfbf9] dark:bg-[#21201c] rounded-lg p-3 sm:p-4 border border-stone-200/70 dark:border-stone-800">
                <span className="block text-2xl sm:text-4xl font-extrabold font-mono text-[#1c1c18] dark:text-white">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Days
                </span>
              </div>
              <div className="bg-[#fcfbf9] dark:bg-[#21201c] rounded-lg p-3 sm:p-4 border border-stone-200/70 dark:border-stone-800">
                <span className="block text-2xl sm:text-4xl font-extrabold font-mono text-[#1c1c18] dark:text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Hours
                </span>
              </div>
              <div className="bg-[#fcfbf9] dark:bg-[#21201c] rounded-lg p-3 sm:p-4 border border-stone-200/70 dark:border-stone-800">
                <span className="block text-2xl sm:text-4xl font-extrabold font-mono text-[#1c1c18] dark:text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Minutes
                </span>
              </div>
              <div className="bg-[#fcfbf9] dark:bg-[#21201c] rounded-lg p-3 sm:p-4 border border-stone-200/70 dark:border-stone-800">
                <span className="block text-2xl sm:text-4xl font-extrabold font-mono text-[#1b4332] dark:text-[#52b788]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Seconds
                </span>
              </div>
            </div>
          )}

          {/* Restoration Timestamps */}
          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 dark:text-stone-400 gap-2">
            <span>Target: <strong className="text-stone-700 dark:text-stone-300 font-medium">{formattedRestorationTime}</strong></span>
            {bstTime && <span>BST: <strong className="text-stone-700 dark:text-stone-300 font-medium">{bstTime}</strong></span>}
          </div>
        </div>

        {/* Emergency PUO Contacts Card */}
        {config.emergencyContact && (
          <div
            id="emergency-puo-contact-card"
            className="w-full max-w-xl bg-white dark:bg-[#1a1916] rounded-xl border border-stone-200 dark:border-stone-800 p-6 text-left shadow-xs mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[#1b4332] dark:text-[#52b788]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1b4332] dark:text-[#52b788]">
                Platoon Command & Emergency Inquiries
              </h3>
            </div>
            <div className="mb-4">
              <p className="font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                {config.emergencyContact.officerName || 'Professor & Platoon Under Officer (PUO)'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {config.emergencyContact.designation || 'New Govt. Degree College BNCC Platoon'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {config.emergencyContact.phone && (
                <a
                  id="puo-emergency-phone"
                  href={`tel:${config.emergencyContact.phone}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-800 transition-colors text-stone-800 dark:text-stone-200"
                >
                  <Phone className="w-3.5 h-3.5 text-[#1b4332] dark:text-[#52b788] shrink-0" />
                  <span className="truncate">{config.emergencyContact.phone}</span>
                </a>
              )}

              {config.emergencyContact.email && (
                <a
                  id="puo-emergency-email"
                  href={`mailto:${config.emergencyContact.email}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-800 transition-colors text-stone-800 dark:text-stone-200"
                >
                  <Mail className="w-3.5 h-3.5 text-[#1b4332] dark:text-[#52b788] shrink-0" />
                  <span className="truncate">{config.emergencyContact.email}</span>
                </a>
              )}

              {config.emergencyContact.officeLocation && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-stone-700 dark:text-stone-300 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="truncate">{config.emergencyContact.officeLocation}</span>
                </div>
              )}

              {config.emergencyContact.whatsappNumber && (
                <a
                  id="puo-emergency-whatsapp"
                  href={`https://wa.me/${config.emergencyContact.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/70 dark:border-emerald-800 transition-colors text-emerald-800 dark:text-emerald-300 sm:col-span-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Direct WhatsApp Emergency Communication</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Controls: Refresh & Officer Bypass */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            id="maintenance-refresh-btn"
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-[#1f1e1a] border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check Portal Status</span>
          </button>

          {config.allowOfficerBypass && (
            <button
              id="officer-bypass-login-btn"
              type="button"
              onClick={onOfficerBypass}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1b4332] text-white hover:bg-[#143427] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAdminAuthenticated ? 'Enter Admin Console' : 'Officer Command Bypass'}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </button>
          )}
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <p className="font-semibold text-stone-700 dark:text-stone-300 mb-1">
          New Govt. Degree College, Rajshahi • BNCC Platoon HQ
        </p>
        <p className="text-[11px] text-stone-500">
          Knowledge & Discipline • জ্ঞান ও শৃঙ্খলা | Secured Institutional Web Services
        </p>
      </footer>
    </div>
  );
};
