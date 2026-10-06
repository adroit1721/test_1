import React, { useState, useEffect } from 'react';
import { MaintenanceConfig } from '../../types';
import {
  AlertTriangle,
  Info,
  AlertOctagon,
  Clock,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';

interface MaintenanceBannerProps {
  config: MaintenanceConfig;
  onNavigateAction?: (urlOrTab: string) => void;
  onDismiss?: () => void;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({
  config,
  onNavigateAction,
  onDismiss,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && config.bannerDismissible) {
      const dismissed = sessionStorage.getItem('ngdc_maintenance_banner_dismissed');
      // If config was updated after dismissal, show again
      const dismissedAt = sessionStorage.getItem('ngdc_maintenance_banner_dismissed_at');
      if (dismissed && dismissedAt && config.lastUpdated) {
        if (new Date(config.lastUpdated).getTime() > Number(dismissedAt)) {
          return false;
        }
      }
      return Boolean(dismissed);
    }
    return false;
  });

  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    const updateRemaining = () => {
      if (!config.estimatedRestorationTime) {
        setTimeLeftStr('');
        return;
      }
      const target = new Date(config.estimatedRestorationTime).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeftStr('Restoration in progress');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;
        setTimeLeftStr(`~${days}d ${remHours}h remaining`);
      } else if (hours > 0) {
        setTimeLeftStr(`~${hours}h ${mins}m remaining`);
      } else {
        setTimeLeftStr(`${mins}m ${secs}s remaining`);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [config.estimatedRestorationTime]);

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ngdc_maintenance_banner_dismissed', 'true');
      sessionStorage.setItem('ngdc_maintenance_banner_dismissed_at', String(Date.now()));
    }
    if (onDismiss) onDismiss();
  };

  // Visual Theme by Severity
  const severity = config.bannerSeverity || 'warning';

  const severityConfig = {
    warning: {
      bg: 'bg-[#fffbeb] dark:bg-[#2b210e]',
      border: 'border-[#fde68a] dark:border-[#785516]',
      text: 'text-[#92400e] dark:text-[#fef3c7]',
      badgeBg: 'bg-[#fef3c7] dark:bg-[#452f08]',
      badgeText: 'text-[#92400e] dark:text-[#fde68a]',
      icon: AlertTriangle,
      iconColor: 'text-[#d97706] dark:text-[#fbbf24]',
      badgeLabel: 'NOTICE',
    },
    info: {
      bg: 'bg-[#eff6ff] dark:bg-[#0f1d33]',
      border: 'border-[#bfdbfe] dark:border-[#1e3a8a]',
      text: 'text-[#1e40af] dark:text-[#dbeafe]',
      badgeBg: 'bg-[#dbeafe] dark:bg-[#172554]',
      badgeText: 'text-[#1e40af] dark:text-[#93c5fd]',
      icon: Info,
      iconColor: 'text-[#2563eb] dark:text-[#60a5fa]',
      badgeLabel: 'ANNOUNCEMENT',
    },
    critical: {
      bg: 'bg-[#fef2f2] dark:bg-[#301111]',
      border: 'border-[#fecaca] dark:border-[#7f1d1d]',
      text: 'text-[#991b1b] dark:text-[#fee2e2]',
      badgeBg: 'bg-[#fee2e2] dark:bg-[#450a0a]',
      badgeText: 'text-[#991b1b] dark:text-[#fca5a5]',
      icon: AlertOctagon,
      iconColor: 'text-[#dc2626] dark:text-[#f87171]',
      badgeLabel: 'URGENT',
    },
  }[severity];

  const IconComponent = severityConfig.icon;

  const handleActionClick = () => {
    if (!config.bannerLinkUrl) return;
    if (config.bannerLinkUrl.startsWith('#') || !config.bannerLinkUrl.startsWith('http')) {
      const tabKey = config.bannerLinkUrl.replace(/^#/, '');
      if (onNavigateAction) onNavigateAction(tabKey);
    } else {
      window.open(config.bannerLinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <aside
      id="operational-maintenance-banner"
      aria-label="Public Operational Notice"
      className={`w-full relative z-40 border-b ${severityConfig.bg} ${severityConfig.border} transition-colors duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left Section: Severity Pill + Icon + Content */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-grow min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] shrink-0 ${severityConfig.badgeBg} ${severityConfig.badgeText}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {severityConfig.badgeLabel}
          </span>

          <IconComponent className={`w-4 h-4 shrink-0 ${severityConfig.iconColor}`} />

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
            <span className={`font-semibold shrink-0 ${severityConfig.text}`}>
              {config.headline}
            </span>
            <span className="text-stone-600 dark:text-stone-300 truncate hidden md:inline">
              — {config.message}
            </span>
          </div>

          {/* Dynamic Countdown if available */}
          {timeLeftStr && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/10 font-mono text-[11px] text-stone-700 dark:text-stone-200 shrink-0 shadow-xs"
              title={`Estimated completion: ${new Date(config.estimatedRestorationTime).toLocaleString()}`}
            >
              <Clock className="w-3 h-3 text-stone-500 shrink-0" />
              <span>{timeLeftStr}</span>
            </span>
          )}
        </div>

        {/* Right Section: Optional Action Link & Dismiss Button */}
        <div className="flex items-center gap-2 shrink-0">
          {config.bannerLinkText && (
            <button
              id="maintenance-banner-action-btn"
              type="button"
              onClick={handleActionClick}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer ${severityConfig.text}`}
            >
              <span>{config.bannerLinkText}</span>
              {config.bannerLinkUrl?.startsWith('http') ? (
                <ExternalLink className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {config.bannerDismissible && (
            <button
              id="maintenance-banner-dismiss-btn"
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss notice"
              className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
