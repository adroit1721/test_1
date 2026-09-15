import React, { useState, useEffect } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { useAppStore } from '../store/useAppStore';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Clock,
  Fingerprint,
} from 'lucide-react';
import { ASSETS } from '../data/bnccData';

interface AdminLoginProps {
  onSuccess?: () => void;
  onReturnToPublic?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onReturnToPublic,
}) => {
  const {
    loginOfficer,
    lockoutStatus,
    headerLeftLogoUrl,
    headerRightLogoUrl,
    headerTitle,
    headerSubtitle,
    clearLockout,
    officerId: registeredOfficerId,
  } = useAdminData();
  const setIsAdminAuthenticated = useAppStore((state) => state.setIsAdminAuthenticated);

  // Form input state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Live remaining seconds countdown display
  const [countdown, setCountdown] = useState<number>(lockoutStatus.remainingSeconds);

  useEffect(() => {
    setCountdown(lockoutStatus.remainingSeconds);
  }, [lockoutStatus.remainingSeconds]);

  useEffect(() => {
    if (!lockoutStatus.isLocked || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutStatus.isLocked, countdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReturnToPublicSite = () => {
    if (onReturnToPublic) {
      onReturnToPublic();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.location.hash = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockoutStatus.isLocked && countdown > 0) {
      setErrorMessage(`Authentication console is locked due to excessive failed attempts. Please wait ${formatCountdown(countdown)}.`);
      return;
    }

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both Officer ID and Master Password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginOfficer(username.trim(), password);

      if (res.success) {
        setIsAdminAuthenticated(true);
        // Clear input values to protect memory
        setUsername('');
        setPassword('');

        // Navigate to /ngdc_bncc_admin
        if (onSuccess) {
          onSuccess();
        } else {
          window.history.pushState({}, '', '/ngdc_bncc_admin');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } else {
        if (typeof res.attemptsLeft === 'number') {
          setAttemptsRemaining(res.attemptsLeft);
        }
        setErrorMessage(
          res.error ||
          'Authentication failed. Invalid Officer ID or Master Password.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'A network error occurred while contacting the authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const leftLogo = headerLeftLogoUrl || ASSETS.collegeLogo;
  const rightLogo = headerRightLogoUrl || ASSETS.bnccLogo;
  const platoonTitle = headerTitle || 'NGDC-BNCC';
  const platoonSubtitle = headerSubtitle || 'New Govt. Degree College, Rajshahi BNCC Platoon';

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1c1c18] flex flex-col justify-between selection:bg-[#eedc82] selection:text-[#1c1c18] relative overflow-hidden font-sans">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#1c1c18_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
        <button
          onClick={handleReturnToPublicSite}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-[#5c5647] hover:text-[#1c1c18] bg-[#ece7dd]/80 hover:bg-[#eedc82]/30 px-3.5 py-1.5 rounded-full border border-[#cdc6b3]/70 transition-all cursor-pointer shadow-2xs"
          aria-label="Return to Public Website"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Website</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#7c7767]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>PORTAL VERIFIED</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl p-6 sm:p-9 shadow-xl relative backdrop-blur-xs">
          {/* Header Logos & Insignia */}
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#cdc6b3]/50">
            {/* Left College Logo */}
            <div className="w-12 h-12 rounded-xl bg-white border border-[#cdc6b3]/60 p-1 flex items-center justify-center shadow-xs">
              <img
                src={leftLogo}
                alt="College Crest"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ASSETS.collegeLogo;
                }}
              />
            </div>

            {/* Center Command Badge */}
            <div className="text-center px-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6b5e10]/10 text-[#6b5e10] text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OFFICER CONSOLE</span>
              </div>
              <h1 className="text-base font-bold text-[#1c1c18] leading-tight">
                {platoonTitle}
              </h1>
              <p className="text-[10px] text-[#7c7767] line-clamp-1 max-w-[200px]">
                {platoonSubtitle}
              </p>
            </div>

            {/* Right BNCC Emblem */}
            <div className="w-12 h-12 rounded-xl bg-white border border-[#cdc6b3]/60 p-1 flex items-center justify-center shadow-xs">
              <img
                src={rightLogo}
                alt="BNCC Crest"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ASSETS.bnccLogo;
                }}
              />
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-[#1c1c18] tracking-tight">
              Command Officer Authentication
            </h2>
            <p className="text-xs text-[#7c7767] mt-1">
              Restricted portal for PUO & Cadet Administration
            </p>
          </div>

          {/* Active Lockout Banner */}
          {lockoutStatus.isLocked && countdown > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-900 border border-red-300 flex items-start gap-3 text-xs animate-fadeIn">
              <Clock className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1 space-y-1">
                <p className="font-bold text-red-950">Security Lockout Active</p>
                <p className="leading-relaxed">
                  Too many failed authentication attempts. Access suspended for{' '}
                  <span className="font-mono font-bold text-red-700 underline">
                    {formatCountdown(countdown)}
                  </span>
                  .
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-red-700">Brute-Force Guard Active</span>
                  <button
                    type="button"
                    onClick={clearLockout}
                    className="text-[11px] font-bold text-red-800 hover:underline cursor-pointer"
                  >
                    Reset Guard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Feedback Alert */}
          {errorMessage && !lockoutStatus.isLocked && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-300 flex items-start gap-2.5 text-xs animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Authentication Failure</p>
                <p className="mt-0.5 leading-snug text-amber-800">{errorMessage}</p>
                {attemptsRemaining !== null && attemptsRemaining < 5 && (
                  <p className="text-[11px] text-amber-700 mt-1 font-semibold">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before 15-minute lockout.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

            {/* Officer ID Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="officer_id_input"
                className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18]"
              >
                Officer ID (Username)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c7767] pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="officer_id_input"
                  name="officer_id_input"
                  type="text"
                  required
                  autoComplete="off"
                  disabled={lockoutStatus.isLocked && countdown > 0}
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#f6f3ed] border border-[#cdc6b3] focus:border-[#6b5e10] px-4 py-3 pl-10 rounded-xl outline-none text-sm text-[#1c1c18] font-mono transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Master Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="master_password_input"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18]"
                >
                  Master Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c7767] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="master_password_input"
                  name="master_password_input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  disabled={lockoutStatus.isLocked && countdown > 0}
                  placeholder="Enter Master Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f6f3ed] border border-[#cdc6b3] focus:border-[#6b5e10] px-4 py-3 pl-10 pr-10 rounded-xl outline-none text-sm text-[#1c1c18] font-mono transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7767] hover:text-[#1c1c18] p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-officer-authenticate"
                disabled={isSubmitting || (lockoutStatus.isLocked && countdown > 0)}
                className="japandi-btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Authorize Officer Session</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security & Lockout Notice */}
          <div className="mt-6 pt-5 border-t border-[#cdc6b3]/50 text-center text-[11px] text-[#7c7767] space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[#5c5647] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS / SHA-256 Encrypted Protocol</span>
            </div>
            <p>5 failed attempts initiate an automatic 15-minute lockout timer.</p>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 text-center text-[11px] text-[#7c7767]">
        <p>
          New Govt. Degree College, Rajshahi BNCC Platoon • 31 BNCC Battalion
        </p>
      </footer>
    </div>
  );
};
