import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import {
  ShieldAlert,
  PowerOff,
  Eye,
  Settings,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AdminMaintenanceBarProps {
  onOpenMaintenanceSettings?: () => void;
  onPreviewPublicLockdown?: () => void;
  onExitPreview?: () => void;
}

export const AdminMaintenanceBar: React.FC<AdminMaintenanceBarProps> = ({
  onOpenMaintenanceSettings,
  onPreviewPublicLockdown,
  onExitPreview,
}) => {
  const {
    maintenanceConfig,
    setMaintenanceMode,
    adminPreviewMode,
    setAdminPreviewMode,
  } = useAdminData();

  const isModeActive = maintenanceConfig.mode !== 'disabled';
  const isPreviewing = adminPreviewMode !== 'none';

  // Only render if maintenance is enabled or if admin is currently previewing
  if (!isModeActive && !isPreviewing) {
    return null;
  }

  const handleDeactivate = async () => {
    if (confirm('Deactivate operational maintenance mode and restore normal public access immediately?')) {
      await setMaintenanceMode('disabled');
      setAdminPreviewMode('none');
    }
  };

  const isLockdown = maintenanceConfig.mode === 'lockdown';

  return (
    <div
      id="sticky-admin-maintenance-bar"
      className={`sticky top-0 z-50 w-full px-4 py-2 text-xs font-sans shadow-md flex flex-wrap items-center justify-between gap-3 border-b ${
        isPreviewing
          ? 'bg-[#431407] text-[#ffedd5] border-[#7c2d12]'
          : isLockdown
          ? 'bg-[#7f1d1d] text-[#fee2e2] border-[#991b1b]'
          : 'bg-[#78350f] text-[#fef3c7] border-[#92400e]'
      }`}
    >
      {/* Left: Status Beacon & Title */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-2.5 w-2.5 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>

        {isPreviewing ? (
          <div className="flex items-center gap-1.5 font-bold">
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span>
              LIVE PREVIEW ACTIVE: Previewing {adminPreviewMode === 'lockdown' ? 'Mode B (Full Lockdown)' : 'Mode A (Warning Banner)'}
            </span>
          </div>
        ) : isLockdown ? (
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-red-200" />
            <span>PORTAL LOCKDOWN ACTIVE: Public visitors see institutional countdown screen</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
            <span>WARNING BANNER ACTIVE: Mode A notice header displayed to public visitors</span>
          </div>
        )}
      </div>

      {/* Right: Quick Operational Controls */}
      <div className="flex items-center flex-wrap gap-2">
        {isPreviewing ? (
          <button
            id="admin-exit-preview-btn"
            type="button"
            onClick={() => {
              setAdminPreviewMode('none');
              if (onExitPreview) onExitPreview();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-stone-900 font-bold hover:bg-stone-100 transition-colors cursor-pointer text-[11px]"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Exit Preview</span>
          </button>
        ) : (
          <>
            {isLockdown && onPreviewPublicLockdown && (
              <button
                id="admin-preview-lockdown-btn"
                type="button"
                onClick={onPreviewPublicLockdown}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 border border-white/20 text-white font-medium transition-colors cursor-pointer text-[11px]"
                title="Preview the exact lockdown countdown screen public visitors see"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Public Lockdown</span>
              </button>
            )}

            {onOpenMaintenanceSettings && (
              <button
                id="admin-configure-maintenance-btn"
                type="button"
                onClick={onOpenMaintenanceSettings}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 border border-white/20 text-white font-medium transition-colors cursor-pointer text-[11px]"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure Hub</span>
              </button>
            )}

            <button
              id="admin-deactivate-maintenance-btn"
              type="button"
              onClick={handleDeactivate}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer text-[11px] shadow-xs"
            >
              <PowerOff className="w-3 h-3" />
              <span>Instant Deactivation</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
