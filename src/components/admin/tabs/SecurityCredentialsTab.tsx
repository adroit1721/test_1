import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Fingerprint,
  FileCode2,
} from 'lucide-react';

export const SecurityCredentialsTab: React.FC = () => {
  const {
    officerId,
    updateOfficerCredentials,
    lockoutStatus,
    clearLockout,
  } = useAdminData();

  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newOfficerId, setNewOfficerId] = useState(officerId || 'ngdc_bncc_1979');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password strength helper
  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-[#cdc6b3]' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 4, label: 'Military-Grade', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword.trim()) {
      setFeedback({ type: 'error', message: 'Current Master Password is required for authorization.' });
      return;
    }

    if (!newOfficerId.trim() || newOfficerId.trim().length < 3) {
      setFeedback({ type: 'error', message: 'Officer ID must be at least 3 characters in length.' });
      return;
    }

    if (!newPassword) {
      setFeedback({ type: 'error', message: 'Please provide a new Master Password.' });
      return;
    }

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New Master Password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New Master Password and Confirmation do not match.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateOfficerCredentials(
        currentPassword.trim(),
        newOfficerId.trim(),
        newPassword.trim()
      );

      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Officer credentials updated successfully with real-time sync!',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({
          type: 'error',
          message: res.message || res.error || 'Failed to update credentials. Check your current password.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'A network error occurred while updating officer credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="border-b border-[#cdc6b3]/70 dark:border-[#423e35] pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase bg-[#6b5e10]/15 dark:bg-[#eedc82]/20 text-[#6b5e10] dark:text-[#eedc82] px-2.5 py-0.5 rounded-full">
                COMMAND SECURITY CONSOLE
              </span>
              <span className="text-xs text-[#7c7767] dark:text-[#aca596]">•</span>
              <span className="text-xs font-semibold text-[#7c7767] dark:text-[#aca596]">
                Zero-Trust Access Control
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
              Command Security & Officer Credentials
            </h1>
            <p className="text-xs md:text-sm text-[#7c7767] dark:text-[#aca596] mt-1 max-w-2xl">
              Manage your Officer ID, Master Password, active authentication policies, and brute-force lockout safeguards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ece7dd] dark:bg-[#23211c] border border-[#cdc6b3] dark:border-[#423e35] text-xs font-mono font-bold text-[#6b5e10] dark:text-[#eedc82]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>DEFENSES OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Active Status & Brute-Force Safeguards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Active Officer ID Card */}
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c7767] dark:text-[#aca596]">Authorized Officer ID</span>
            <UserCheck className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold font-mono text-[#1c1c18] dark:text-[#fcfbf7]">
              {officerId || 'ngdc_bncc_1979'}
            </p>
            <p className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
              Master Account: PUO / Cadet Command Officer
            </p>
          </div>
          <div className="pt-2 border-t border-[#cdc6b3]/40 dark:border-[#333] flex items-center justify-between text-[11px] text-[#7c7767] dark:text-[#aca596]">
            <span>Session: JWT SHA-256</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </div>

        {/* Master Password Privacy Card */}
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c7767] dark:text-[#aca596]">Master Password State</span>
            <Lock className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
          </div>
          <div className="space-y-1">
            {/* Privacy: Never display plaintext password in dashboard */}
            <p className="text-lg font-bold font-mono tracking-widest text-[#1c1c18] dark:text-[#fcfbf7]">
              ••••••••••••••••
            </p>
            <p className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
              Protected in memory & encrypted backend
            </p>
          </div>
          <div className="pt-2 border-t border-[#cdc6b3]/40 dark:border-[#333] flex items-center justify-between text-[11px] text-[#7c7767] dark:text-[#aca596]">
            <span>Suggestion Suppression:</span>
            <span className="text-emerald-600 font-semibold">Enforced</span>
          </div>
        </div>

        {/* Brute-Force Lockout Defense Card */}
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c7767] dark:text-[#aca596]">Brute-Force Lockout Defense</span>
            <Clock className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${lockoutStatus.isLocked ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <p className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                {lockoutStatus.isLocked ? `Console Locked (${lockoutStatus.remainingSeconds}s remaining)` : '5 Attempts • 15 Min Lockout'}
              </p>
            </div>
            <p className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
              Blocks credential stuffing & dictionary attacks
            </p>
          </div>
          <div className="pt-2 border-t border-[#cdc6b3]/40 dark:border-[#333] flex items-center justify-between text-[11px]">
            <span className="text-[#7c7767] dark:text-[#aca596]">Lockout Status:</span>
            {lockoutStatus.isLocked ? (
              <button
                onClick={clearLockout}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Clear Lockout
              </button>
            ) : (
              <span className="text-emerald-600 font-semibold">Guard Active</span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Credential Modification Panel */}
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                Update Officer ID & Master Password
              </h2>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                Requires your current master password for verification. Changes apply immediately across all authorized sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 text-xs md:text-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold">{feedback.type === 'success' ? 'Credentials Synchronized' : 'Authorization Error'}</p>
              <p className="mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* Credential Form with Decoy Inputs to suppress browser autofill and password saving */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {/* Decoy fields to intercept aggressive browser credential autofill */}
          <input
            type="text"
            name="decoy_username_field"
            id="decoy_username_field"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
          />
          <input
            type="password"
            name="decoy_password_field"
            id="decoy_password_field"
            tabIndex={-1}
            autoComplete="new-password"
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
          />

          {/* Section 1: Current Password Authorization */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18] dark:text-[#fcfbf7]">
              Current Master Password <span className="text-red-600">*</span>
            </label>
            <p className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
              Authorization verification required before making changes (Default: <code className="font-mono bg-[#eedc82]/30 px-1 py-0.5 rounded">Ngdc$BNCC$1979</code>)
            </p>
            <div className="relative">
              <input
                required
                type={showCurrentPassword ? 'text' : 'password'}
                name="auth_current_password"
                id="auth_current_password"
                autoComplete="new-password"
                placeholder="Enter current Master Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-4 py-3 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] focus:border-[#6b5e10] dark:focus:border-[#eedc82] transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] p-1"
                aria-label="Toggle current password visibility"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-[#cdc6b3]/40 dark:border-[#333] pt-5 space-y-5">
            {/* Section 2: New Officer ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18] dark:text-[#fcfbf7]">
                New Officer ID (Username) <span className="text-red-600">*</span>
              </label>
              <p className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
                The identifier used to access the Officer Authentication Console
              </p>
              <input
                required
                type="text"
                name="auth_new_officer_id"
                id="auth_new_officer_id"
                autoComplete="off"
                placeholder=""
                value={newOfficerId}
                onChange={(e) => setNewOfficerId(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-4 py-3 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] focus:border-[#6b5e10] dark:focus:border-[#eedc82] transition-colors"
              />
            </div>

            {/* Section 3: New Master Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18] dark:text-[#fcfbf7]">
                  New Master Password <span className="text-red-600">*</span>
                </label>
                {newPassword && (
                  <span className="text-[10px] font-bold text-[#7c7767] dark:text-[#aca596]">
                    Strength: <span className="text-[#1c1c18] dark:text-[#fcfbf7]">{strength.label}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  required
                  type={showNewPassword ? 'text' : 'password'}
                  name="auth_new_master_password"
                  id="auth_new_master_password"
                  autoComplete="new-password"
                  placeholder="Enter new Master Password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-4 py-3 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] focus:border-[#6b5e10] dark:focus:border-[#eedc82] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] p-1"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter bar */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 w-full bg-[#e8e4dc] dark:bg-[#282622] rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-300 ${
                          strength.score >= step ? strength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Confirm New Master Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18] dark:text-[#fcfbf7]">
                Confirm New Master Password <span className="text-red-600">*</span>
              </label>
              <input
                required
                type="password"
                name="auth_confirm_master_password"
                id="auth_confirm_master_password"
                autoComplete="new-password"
                placeholder="Re-type new Master Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-4 py-3 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] focus:border-[#6b5e10] dark:focus:border-[#eedc82] transition-colors"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="japandi-btn-primary px-6 py-3 text-xs md:text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authorizing & Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Command Credentials</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
              Instant multi-device persistence
            </span>
          </div>
        </form>
      </div>

      {/* Security Architecture & Audit Specifications */}
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
          <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
            Officer Console Security Standards & Protocol
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#7c7767] dark:text-[#aca596] leading-relaxed">
          <div className="p-4 rounded-xl bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/50 dark:border-[#333] space-y-1.5">
            <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">
              1. Autofill Suppression Architecture
            </span>
            <p>
              Inputs implement <code className="font-mono bg-[#eedc82]/30 px-1 py-0.5 rounded">autoComplete="off"</code> and{' '}
              <code className="font-mono bg-[#eedc82]/30 px-1 py-0.5 rounded">autoComplete="new-password"</code> along with hidden decoy input pairs to suppress unwanted browser credential prompts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/50 dark:border-[#333] space-y-1.5">
            <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">
              2. Brute-Force Rate Limiting
            </span>
            <p>
              A strict ceiling of 5 consecutive failed authentication attempts triggers an automated 15-minute lockout timer across both client safeStorage and backend memory map.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/50 dark:border-[#333] space-y-1.5">
            <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">
              3. Zero-Knowledge Credential Privacy
            </span>
            <p>
              The admin dashboard workspace displays no credential suggestions or plaintext passwords. Public API responses strictly omit authentication secret keys.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/50 dark:border-[#333] space-y-1.5">
            <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">
              4. Session Persistence Protocol
            </span>
            <p>
              Authenticated sessions operate via cryptographically signed JWT tokens with 30-day longevity, verified on every state modification and settings sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
