import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { OfficerAccount } from '../../../types';
import { fetchOfficerAccounts, saveOfficerAccounts } from '../../../utils/apiClient';
import { processPassportPhoto, uploadImageToCloudinary } from '../../../utils/cloudinary';
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
  Users,
  Plus,
  Trash2,
  Edit2,
  X,
  Award,
  Check,
  XCircle,
  Upload,
  Loader2
} from 'lucide-react';

export const SecurityCredentialsTab: React.FC = () => {
  const {
    officerId,
    updateOfficerCredentials,
    lockoutStatus,
    clearLockout,
  } = useAdminData();

  // Admin Master Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newOfficerId, setNewOfficerId] = useState(officerId || 'ngdc_bncc_1979');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Officers Management State
  const [officerAccounts, setOfficerAccounts] = useState<OfficerAccount[]>([]);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modal / Form state for Add/Edit Officer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<OfficerAccount | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formRank, setFormRank] = useState('BNCCO');
  const [formRole, setFormRole] = useState('Read-Only Inspector');
  const [formAppointmentRole, setFormAppointmentRole] = useState('Platoon Commander');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPicture, setFormPicture] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [officerFeedback, setOfficerFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const photoRes = await processPassportPhoto(file);
      if (photoRes?.url) {
        setFormPicture(photoRes.url);
      } else {
        const cUrl = await uploadImageToCloudinary(file, 'officer-photos', false);
        if (cUrl) setFormPicture(cUrl);
      }
    } catch (err) {
      console.error('Officer photo upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Fetch officer accounts on mount
  useEffect(() => {
    const loadOfficers = async () => {
      setIsLoadingOfficers(true);
      const accounts = await fetchOfficerAccounts();
      if (Array.isArray(accounts)) {
        setOfficerAccounts(accounts);
      } else {
        // Default initial officers if fetch failed
        const defaults: OfficerAccount[] = [
          {
            id: 'off-1',
            fullName: 'PUO Md. Abdul Matin',
            designation: 'Platoon Commander & Assistant Professor',
            rank: 'PUO',
            role: 'Platoon Commander (Read-Only Inspector)',
            appointmentRole: 'Platoon Commander & Executive Inspector',
            phone: '+880 1712-345678',
            email: 'puo.matin@ngdc.ac.bd',
            picture: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019772/vrefgswpj8ltquhu5bd1.jpg',
            image: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019772/vrefgswpj8ltquhu5bd1.jpg',
            photoUrl: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019772/vrefgswpj8ltquhu5bd1.jpg',
            username: 'BNCC_OFFICER',
            password: 'Officer$NGDC$2026',
            status: 'active',
            createdAt: '2026-01-01',
          },
          {
            id: 'off-2',
            fullName: 'Prof. Dr. Md. Shariful Islam',
            designation: 'Vice Principal & Battalion Inspector',
            rank: 'BNCCO',
            role: 'College Faculty Inspector',
            appointmentRole: 'Vice Principal & Inspector',
            phone: '+880 2588-861234',
            email: 'vp.shariful@ngdc.ac.bd',
            picture: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019638/zxirwqcln84pews7frcx.jpg',
            image: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019638/zxirwqcln84pews7frcx.jpg',
            photoUrl: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019638/zxirwqcln84pews7frcx.jpg',
            username: 'OFFICER_VP',
            password: 'VP$NGDC$2026',
            status: 'active',
            createdAt: '2026-01-01',
          },
        ];
        setOfficerAccounts(defaults);
      }
      setIsLoadingOfficers(false);
    };
    loadOfficers();
  }, []);

  // Save officer accounts list helper
  const saveOfficersList = async (updatedList: OfficerAccount[]) => {
    setOfficerAccounts(updatedList);
    const res = await saveOfficerAccounts(updatedList);
    if (res.success) {
      setOfficerFeedback({ type: 'success', message: 'Officer accounts updated successfully.' });
    } else {
      setOfficerFeedback({ type: 'error', message: res.message || 'Error updating officer accounts.' });
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingOfficer(null);
    setFormName('');
    setFormDesignation('');
    setFormRank('PUO');
    setFormRole('Platoon Commander');
    setFormAppointmentRole('Platoon Commander & Executive Inspector');
    setFormPhone('');
    setFormEmail('');
    setFormPicture('');
    setFormUsername('');
    setFormPassword('');
    setFormStatus('active');
    setOfficerFeedback(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (officer: OfficerAccount) => {
    setEditingOfficer(officer);
    setFormName(officer.fullName || '');
    setFormDesignation(officer.designation || '');
    setFormRank(officer.rank || 'PUO');
    setFormRole(officer.role || 'Platoon Commander');
    setFormAppointmentRole(officer.appointmentRole || officer.role || 'Platoon Commander');
    setFormPhone(officer.phone || '');
    setFormEmail(officer.email || '');
    setFormPicture(officer.picture || officer.image || officer.photoUrl || '');
    setFormUsername(officer.username || '');
    setFormPassword(officer.password || '');
    setFormStatus(officer.status === 'inactive' ? 'inactive' : 'active');
    setOfficerFeedback(null);
    setIsModalOpen(true);
  };

  // Save Officer Form Handler
  const handleSaveOfficerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      setOfficerFeedback({ type: 'error', message: 'Officer Name, User ID, and Password are required.' });
      return;
    }

    if (editingOfficer) {
      // Edit existing
      const updated = officerAccounts.map((off) =>
        off.id === editingOfficer.id
          ? {
              ...off,
              fullName: formName.trim(),
              designation: formDesignation.trim() || 'College Faculty',
              rank: formRank,
              role: formAppointmentRole.trim() || formRole,
              appointmentRole: formAppointmentRole.trim(),
              phone: formPhone.trim(),
              email: formEmail.trim(),
              picture: formPicture.trim(),
              image: formPicture.trim(),
              photoUrl: formPicture.trim(),
              username: formUsername.trim(),
              password: formPassword.trim(),
              status: formStatus,
            }
          : off
      );
      await saveOfficersList(updated);
    } else {
      // Create new
      const newOfficer: OfficerAccount = {
        id: `off-${Date.now()}`,
        fullName: formName.trim(),
        designation: formDesignation.trim() || 'College Faculty',
        rank: formRank,
        role: formAppointmentRole.trim() || 'Platoon Commander',
        appointmentRole: formAppointmentRole.trim() || 'Platoon Commander',
        phone: formPhone.trim(),
        email: formEmail.trim(),
        picture: formPicture.trim(),
        image: formPicture.trim(),
        photoUrl: formPicture.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        status: formStatus,
        createdAt: new Date().toISOString().split('T')[0],
      };
      await saveOfficersList([...officerAccounts, newOfficer]);
    }

    setIsModalOpen(false);
  };

  // Toggle Officer Active / Inactive
  const handleToggleStatus = async (id: string) => {
    const updated = officerAccounts.map((off) =>
      off.id === id ? { ...off, status: (off.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : off
    );
    await saveOfficersList(updated);
  };

  // Delete Officer Account
  const handleDeleteOfficer = async (id: string) => {
    if (confirm('Are you sure you want to remove this officer access account?')) {
      const updated = officerAccounts.filter((off) => off.id !== id);
      await saveOfficersList(updated);
    }
  };

  // Toggle Password Visibility for specific officer
  const toggleOfficerPassVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
          message: res.error || 'Failed to update credentials. Please check your current password.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred while updating credentials.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ==================== CARD 1: SUPER ADMIN MASTER CREDENTIALS ==================== */}
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eedc82] flex items-center justify-center text-[#1c1a14] font-bold shadow-2xs">
            <Lock className="w-5 h-5 text-[#6b5e10]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
              Super Admin Master Console Credentials
            </h2>
            <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
              Master Command Console authorization login (Full write, edit & site settings management).
            </p>
          </div>
        </div>

        {/* Lockout Alert */}
        {lockoutStatus.isLocked && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Command Console Temporarily Locked</p>
              <p>
                Too many failed authentication attempts. Lockout remaining:{' '}
                <strong className="font-mono">{lockoutStatus.remainingSeconds}s</strong>
              </p>
              <button
                type="button"
                onClick={clearLockout}
                className="mt-2 text-[11px] underline font-semibold hover:text-red-950 cursor-pointer"
              >
                Clear Lockout Override (Super Admin)
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
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

        {/* Master Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18] dark:text-[#fcfbf7]">
              Current Master Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                required
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current Master Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-4 py-3 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] focus:border-[#6b5e10] transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7767] p-1 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-[#cdc6b3]/40 dark:border-[#333] pt-5 space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18] dark:text-[#fcfbf7]">
                New Admin User ID <span className="text-red-600">*</span>
              </label>
              <input
                required
                type="text"
                value={newOfficerId}
                onChange={(e) => setNewOfficerId(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-4 py-3 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] focus:border-[#6b5e10] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18] dark:text-[#fcfbf7]">
                  New Master Password <span className="text-red-600">*</span>
                </label>
                {newPassword && (
                  <span className="text-[10px] font-bold text-[#7c7767]">
                    Strength: <span className="text-[#1c1c18] dark:text-[#fcfbf7]">{strength.label}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  required
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new Master Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-4 py-3 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] focus:border-[#6b5e10] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7767] p-1 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c18] dark:text-[#fcfbf7]">
                Confirm New Master Password <span className="text-red-600">*</span>
              </label>
              <input
                required
                type="password"
                placeholder="Re-type new Master Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-4 py-3 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] focus:border-[#6b5e10] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="japandi-btn-primary px-6 py-3 text-xs md:text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating Master Pass...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Update Master Credentials</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ==================== CARD 2: OFFICER & TEACHERS DIRECTORY MANAGEMENT ==================== */}
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eedc82]/40 border border-[#6b5e10]/30 flex items-center justify-center text-[#6b5e10] font-bold shadow-2xs">
              <Users className="w-5 h-5 text-[#6b5e10]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                Officer & Teacher Access Directory Management
              </h2>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                Super Admin manages all Officer accounts, ranks, designations, User IDs, and passwords here.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#6b5e10] hover:bg-[#554a0d] text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Officer Account</span>
          </button>
        </div>

        {/* Feedback Notice */}
        {officerFeedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
              officerFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            {officerFeedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{officerFeedback.message}</span>
          </div>
        )}

        {/* Officers List Table */}
        <div className="border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl overflow-hidden bg-white dark:bg-[#141311]">
          {isLoadingOfficers ? (
            <div className="p-8 text-center text-xs text-[#8c8474] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#6b5e10]" />
              <span>Loading Officer Accounts...</span>
            </div>
          ) : officerAccounts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8c8474]">
              No officer accounts configured yet. Click "+ Add New Officer Account" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1c1a14] text-[#fffdf5] font-bold border-b border-[#6b5e10]/30">
                    <th className="p-3">Officer Name</th>
                    <th className="p-3">Rank / Designation</th>
                    <th className="p-3">Role / Access</th>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Password</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdc6b3]/30">
                  {officerAccounts.map((officer) => {
                    if (!officer) return null;
                    const safeName = officer.fullName || officer.username || 'Officer';
                    return (
                      <tr key={officer.id || officer.username} className="hover:bg-[#eedc82]/10 transition-colors">
                        <td className="p-3 font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#eedc82]/30 text-[#6b5e10] flex items-center justify-center font-bold text-[11px] shrink-0 border border-[#6b5e10]/20">
                              {safeName.charAt(0).toUpperCase()}
                            </div>
                            <span>{safeName}</span>
                          </div>
                        </td>
                      <td className="p-3">
                        <div className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                          <span className="px-1.5 py-0.5 rounded bg-[#6b5e10]/15 text-[#6b5e10] font-bold mr-1.5">
                            {officer.rank}
                          </span>
                          <span>{officer.designation}</span>
                        </div>
                      </td>
                      <td className="p-3 text-[#695c4e] dark:text-[#aca596]">{officer.role}</td>
                      <td className="p-3 font-mono font-bold text-[#6b5e10] dark:text-[#eedc82]">{officer.username}</td>
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{visiblePasswords[officer.id] ? officer.password : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => toggleOfficerPassVisibility(officer.id)}
                            className="text-[#8c8474] hover:text-[#1c1c18] p-0.5 cursor-pointer"
                          >
                            {visiblePasswords[officer.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(officer.id)}
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[10px] cursor-pointer transition-all ${
                            officer.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-200 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {officer.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-gray-500" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(officer)}
                            className="p-1.5 rounded-lg text-[#6b5e10] hover:bg-[#6b5e10]/15 transition-colors cursor-pointer"
                            title="Edit Officer Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOfficer(officer.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Delete Officer Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ==================== ADD / EDIT OFFICER MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[#8c8474] hover:text-[#1c1c18] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-[#cdc6b3]/40 pb-3">
              <Award className="w-5 h-5 text-[#6b5e10]" />
              <h3 className="text-base font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {editingOfficer ? 'Edit Officer Credentials' : 'Add New Officer Account'}
              </h3>
            </div>

            <form onSubmit={handleSaveOfficerForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Officer Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Md. Shariful Islam"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-medium text-[#1c1c18] dark:text-[#fcfbf7]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Designation / College Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assistant Professor, Dept. of Physics"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-medium text-[#1c1c18] dark:text-[#fcfbf7]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Appointment Role in BNCC
                </label>
                <input
                  type="text"
                  placeholder="e.g. Platoon Commander & Executive Inspector"
                  value={formAppointmentRole}
                  onChange={(e) => setFormAppointmentRole(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-medium text-[#1c1c18] dark:text-[#fcfbf7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +8801700000000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-mono text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="officer@ngdc.ac.bd"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-mono text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Officer Picture / Passport Photo (Cloudinary Direct Upload)
                </label>
                <div className="flex items-center gap-3 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] p-2.5 rounded-xl">
                  <div className="relative w-12 h-12 rounded-lg border border-[#cdc6b3] dark:border-[#423e35] overflow-hidden bg-white dark:bg-[#1e1d19] shrink-0 flex items-center justify-center">
                    {formPicture ? (
                      <img src={formPicture} alt="Officer" className="w-full h-full object-cover" />
                    ) : (
                      <Award className="w-6 h-6 text-[#8c8474]" />
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-[#6b5e10] hover:bg-[#554a0d] text-white text-[11px] font-bold rounded-lg transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingImage ? 'Compressing & Uploading...' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingImage}
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] font-semibold text-[#8c8474]">Auto Direct Compress</span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://... Cloudinary URL or image path"
                      value={formPicture}
                      onChange={(e) => setFormPicture(e.target.value)}
                      className="w-full bg-white dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1 rounded-lg outline-none font-mono text-[10px] text-[#1c1c18] dark:text-[#fcfbf7]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Rank</label>
                  <select
                    value={formRank}
                    onChange={(e) => setFormRank(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-bold text-[#1c1c18] dark:text-[#fcfbf7]"
                  >
                    <option value="BNCCO">BNCCO</option>
                    <option value="PUO">PUO</option>
                    <option value="Professor">Professor</option>
                    <option value="Major">Major</option>
                    <option value="Captain">Captain</option>
                    <option value="Officer">Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Access Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-bold text-[#1c1c18] dark:text-[#fcfbf7]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    User ID / Username <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OFFICER_PHYSICS"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-mono font-bold text-[#6b5e10]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pass$2026"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-lg outline-none font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#cdc6b3] text-[#555042] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6b5e10] hover:bg-[#554a0d] text-white px-5 py-2 rounded-lg font-bold cursor-pointer transition-all shadow-xs"
                >
                  Save Officer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
