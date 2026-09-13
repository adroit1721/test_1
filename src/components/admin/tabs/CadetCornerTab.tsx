import React, { useState, useEffect } from 'react';
import { useCadetRoster } from '../../../context/CadetRosterContext';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { CadetUserAccount, FormFieldConfig, PlatoonCategory, PlatoonSection } from '../../../types';
import { CadetRegistrationForm } from '../../CadetRegistrationForm';
import { CloudinaryUploader } from '../../common/CloudinaryUploader';
import { DatabaseAndCloudSettingsModal } from '../DatabaseAndCloudSettingsModal';
import { isCloudinaryConfigured } from '../../../utils/cloudinary';
import { downloadCadetsFile } from '../../../utils/cadetExport';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  KeyRound,
  Search,
  Filter,
  CheckCircle2,
  X,
  ListPlus,
  UserCheck,
  UserX,
  Lock,
  Music,
  Shield,
  Clock,
  BookOpen,
  UserCog,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Check,
  Database,
  Cloud,
  RefreshCw,
  Award,
  UploadCloud,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

const PLATOON_QUOTAS = {
  'Male Platoon': 31,
  'Female Platoon': 31,
  'Band Platoon': 15,
  'Ex-cadets': Infinity,
};

export const CadetCornerTab: React.FC = () => {
  const {
    cadetUsers,
    addCadetUser,
    updateCadetUser,
    deleteCadetUser,
    approveCadetApplicant,
    clearAllCadetUsers,
    cadetRegFields,
    setCadetRegFields,
    syncCadetsWithSupabase,
    syncCadetsWithCloud,
    pendingProfileUpdates,
    refreshPendingProfileUpdates,
    approveProfileUpdate,
    rejectProfileUpdate,
    trainingManuals,
    addTrainingManual,
    deleteTrainingManual,
  } = useCadetRoster();

  const { isSupabaseActive, isAppwriteActive } = useAdminAuth();

  // Active subtab: 'roster' | 'registerCadet' | 'applicants' | 'pendingProfileUpdates' | 'trainingManuals'
  const [activeSubtab, setActiveSubtab] = useState<'roster' | 'registerCadet' | 'applicants' | 'pendingProfileUpdates' | 'trainingManuals'>('roster');

  // Training Manual Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState('Drill & Discipline');
  const [manualDescription, setManualDescription] = useState('');
  const [manualFileUrl, setManualFileUrl] = useState('');
  const [manualFileSize, setManualFileSize] = useState('2.5 MB PDF');
  const [manualMsg, setManualMsg] = useState('');

  // Supabase & Cloudinary Settings Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Search & Filters for Roster
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | PlatoonCategory>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');

  // Password Modal
  const [passwordModalCadet, setPasswordModalCadet] = useState<CadetUserAccount | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Applicant Approval Modal
  const [approvingApplicant, setApprovingApplicant] = useState<CadetUserAccount | null>(null);
  const [approvalPassword, setApprovalPassword] = useState('cadet123');
  const [approvalCategory, setApprovalCategory] = useState<PlatoonCategory>('Male Platoon');
  const [approvalSection, setApprovalSection] = useState<string>('Section 01');
  const [approvalRank, setApprovalRank] = useState('Cadet (CDT)');
  const [approvalCadetNo, setApprovalCadetNo] = useState('');

  // Form Builder Field State
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormFieldConfig['type']>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  // Robust check for pending applicant cadets
  const isPendingApplicant = (c: CadetUserAccount) => {
    if (!c) return false;
    const status = String(c.status || '').toLowerCase().trim();
    return (
      c.isApproved === false ||
      (c as any).isApproved === 'false' ||
      status.includes('pending') ||
      status === 'unapproved'
    );
  };

  // Quota counts for currently serving approved cadets
  const approvedCadets = cadetUsers.filter((c) => c && !isPendingApplicant(c));
  const pendingApplicants = cadetUsers.filter(isPendingApplicant);

  const maleServingCount = approvedCadets.filter((c) => c.category === 'Male Platoon' && c.cadetType !== 'Ex-cadet').length;
  const femaleServingCount = approvedCadets.filter((c) => c.category === 'Female Platoon' && c.cadetType !== 'Ex-cadet').length;
  const bandServingCount = approvedCadets.filter((c) => c.category === 'Band Platoon' && c.cadetType !== 'Ex-cadet').length;
  const exCadetCount = approvedCadets.filter((c) => c.category === 'Ex-cadets' || c.cadetType === 'Ex-cadet').length;

  // Band gender breakdown
  const bandMaleCount = approvedCadets.filter((c) => c.category === 'Band Platoon' && c.gender === 'Male').length;
  const bandFemaleCount = approvedCadets.filter((c) => c.category === 'Band Platoon' && c.gender === 'Female').length;

  // Add / Edit Cadet State (Editing occurs directly on admin panel via unified CadetRegistrationForm)
  const [editingCadet, setEditingCadet] = useState<CadetUserAccount | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Live cloud sync on mount and when switching subtabs
  useEffect(() => {
    syncCadetsWithCloud();
    refreshPendingProfileUpdates();
  }, []);

  useEffect(() => {
    if (activeSubtab === 'pendingProfileUpdates' || activeSubtab === 'applicants' || activeSubtab === 'roster') {
      refreshPendingProfileUpdates();
      syncCadetsWithCloud();
    }
  }, [activeSubtab]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        syncCadetsWithCloud(),
        refreshPendingProfileUpdates(),
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartAddCadet = () => {
    setEditingCadet(null);
    setActiveSubtab('registerCadet');
  };

  const handleStartEditCadet = (cadet: CadetUserAccount) => {
    setEditingCadet(cadet);
    setActiveSubtab('registerCadet');
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalCadet || !newPasswordValue.trim()) return;
    updateCadetUser(passwordModalCadet.id, { password: newPasswordValue.trim() }, passwordModalCadet.cadetNo);
    alert(`Password for Cadet ${passwordModalCadet.cadetNo} (${passwordModalCadet.name || 'Cadet'}) updated to: "${newPasswordValue.trim()}"`);
    setPasswordModalCadet(null);
    setNewPasswordValue('');
  };

  const handleStartApproveApplicant = (applicant: CadetUserAccount) => {
    setApprovingApplicant(applicant);
    // Keep the password the applicant defined during registration, admin can view or change it
    setApprovalPassword(applicant.password || 'cadet123');
    setApprovalCategory(applicant.category || (applicant.gender === 'Female' ? 'Female Platoon' : 'Male Platoon'));
    setApprovalSection(applicant.section || 'Section 01');
    setApprovalRank(applicant.rank || 'Cadet (CDT)');
    setApprovalCadetNo(applicant.cadetNo || `NGDC-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingApplicant) return;

    if (!approvalPassword.trim()) {
      alert('Please enter a password for this cadet so they can log in.');
      return;
    }

    const approvedName = approvingApplicant.name || 'Cadet';
    const assignedCadetNo = approvalCadetNo.trim();
    const assignedCategory = approvalCategory;
    const assignedSection = approvalSection;
    const assignedRank = approvalRank;

    approveCadetApplicant(approvingApplicant.id, {
      password: approvalPassword.trim(),
      category: assignedCategory,
      section: assignedSection,
      rank: assignedRank,
      cadetNo: assignedCadetNo,
    });

    setApprovingApplicant(null);
    // Automatically switch to roster and reset filters so the approved cadet is immediately visible
    setActiveSubtab('roster');
    setCategoryFilter('All');
    setSectionFilter('All');
    setSearchQuery('');
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    const newField: FormFieldConfig = {
      id: `cr-fld-${Date.now()}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      placeholder: `Enter ${newFieldLabel.trim()}...`,
      options:
        newFieldType === 'select'
          ? (newFieldOptions || '')
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined,
    };
    setCadetRegFields((prev) => [...prev, newField]);
    setNewFieldLabel('');
    setNewFieldOptions('');
  };

  const handleDeleteField = (id: string) => {
    setCadetRegFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Filtered Approved Cadets
  const filteredRoster = approvedCadets.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (c.cadetNo || '').toLowerCase().includes(q) ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.department || '').toLowerCase().includes(q) ||
      (c.batch || '').toLowerCase().includes(q) ||
      (c.rank || '').toLowerCase().includes(q) ||
      (c.collegeId || '').toLowerCase().includes(q) ||
      Boolean(c.phone && c.phone.includes(q));

    const matchesCategory =
      categoryFilter === 'All' || c.category === categoryFilter || (categoryFilter === 'Ex-cadets' && c.cadetType === 'Ex-cadet');

    const matchesSection = sectionFilter === 'All' || c.section === sectionFilter;

    return matchesSearch && matchesCategory && matchesSection;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Platoon Category Quota Cards */}
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                <Shield className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                Cadet Corner Admin & Command Roster
              </h2>
            </div>
            <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1 max-w-3xl">
              Manage the 3 serving cadet platoon categories (Male: 31 quota, Female: 31 quota, Band: 15 mixed) and unlimited Ex-cadets.
              Define login IDs, passwords, review applicants, and assign platoons, sections, and ranks (approved cadets automatically render into the About Us page hierarchy).
            </p>

            {/* Supabase & Cloudinary Quick Status Bar */}
            <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="japandi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <Database className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>DB & Cloud Storage Settings</span>
                {true && (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"
                    title="MongoDB Atlas Database Connected"
                  ></span>
                )}
              </button>

              <button
                onClick={async () => {
                  setIsSyncing(true);
                  await syncCadetsWithCloud();
                  setTimeout(() => setIsSyncing(false), 600);
                }}
                disabled={isSyncing}
                className="japandi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer font-medium"
                title="Synchronize Cadets with MongoDB Atlas"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#6b5e10]' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Database'}</span>
              </button>

              {true && (
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>MongoDB Atlas</span>
                </span>
              )}

              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                <span>Cloudinary: {isCloudinaryConfigured() ? 'Active CDN' : 'Local Fallback'}</span>
              </span>
            </div>
          </div>

          {/* Subtab Switcher */}
          <div className="flex items-center bg-[#f0eee8] dark:bg-[#141311] p-1 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] shrink-0 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setActiveSubtab('roster')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'roster'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Platoon Roster ({approvedCadets.length})</span>
            </button>

            <button
              onClick={() => setActiveSubtab('applicants')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'applicants'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Applicants</span>
              {pendingApplicants.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                  {pendingApplicants.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubtab('registerCadet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'registerCadet'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Cadet to Directory</span>
            </button>

            <button
              onClick={() => setActiveSubtab('pendingProfileUpdates')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'pendingProfileUpdates'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>Profile Updates</span>
              {pendingProfileUpdates.filter(r => r.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white animate-pulse">
                  {pendingProfileUpdates.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubtab('trainingManuals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubtab === 'trainingManuals'
                  ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                  : 'text-[#695c4e] dark:text-[#aca596]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Training Manuals</span>
            </button>
          </div>
        </div>

        {/* 4 Platoon Category Quota Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* 1. Male Platoon */}
          <div className="p-4 rounded-2xl bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Male Platoon</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                Quota: 31
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {maleServingCount} <span className="text-xs font-normal text-[#695c4e] dark:text-[#aca596]">/ 31 Serving</span>
              </div>
              <span className="text-[11px] text-[#695c4e] dark:text-[#aca596]">
                {31 - maleServingCount > 0 ? `${31 - maleServingCount} Vacant` : 'Full'}
              </span>
            </div>
            <div className="w-full bg-[#e8e4dc] dark:bg-[#28251e] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (maleServingCount / 31) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Female Platoon */}
          <div className="p-4 rounded-2xl bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Female Platoon</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                Quota: 31
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {femaleServingCount} <span className="text-xs font-normal text-[#695c4e] dark:text-[#aca596]">/ 31 Serving</span>
              </div>
              <span className="text-[11px] text-[#695c4e] dark:text-[#aca596]">
                {31 - femaleServingCount > 0 ? `${31 - femaleServingCount} Vacant` : 'Full'}
              </span>
            </div>
            <div className="w-full bg-[#e8e4dc] dark:bg-[#28251e] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (femaleServingCount / 31) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. Band Platoon */}
          <div className="p-4 rounded-2xl bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-600" />
                <span>Band Platoon</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                Quota: 15 (Mixed)
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {bandServingCount} <span className="text-xs font-normal text-[#695c4e] dark:text-[#aca596]">/ 15 Members</span>
              </div>
              <span className="text-[10px] text-[#695c4e] dark:text-[#aca596]">
                {bandMaleCount}♂ | {bandFemaleCount}♀
              </span>
            </div>
            <div className="w-full bg-[#e8e4dc] dark:bg-[#28251e] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (bandServingCount / 15) * 100)}%` }}
              />
            </div>
          </div>

          {/* 4. Ex-cadets */}
          <div className="p-4 rounded-2xl bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ex-cadets (Alumni)</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                Unlimited
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                {exCadetCount} <span className="text-xs font-normal text-[#695c4e] dark:text-[#aca596]">Alumni Cadets</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Since 1979</span>
            </div>
            <div className="w-full bg-[#e8e4dc] dark:bg-[#28251e] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-full opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: PLATOON ROSTER & DIRECTORY */}
      {activeSubtab === 'roster' && (
        <div className="space-y-4">
          {/* Controls: Search, Category Filters, Section Filter, Add Cadet, Clear All */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#fcf9f3] dark:bg-[#1e1d19] p-4 rounded-2xl border border-[#cdc6b3]/40 dark:border-[#423e35]">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7c7767]" />
                <input
                  type="text"
                  placeholder="Search by Cadet No / Login ID, Name, Roll, Dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] pl-9 pr-3.5 py-2 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-[#f6f3ed] dark:bg-[#141311] p-1 rounded-xl border border-[#cdc6b3]/50 dark:border-[#423e35] text-xs">
                {(['All', 'Male Platoon', 'Female Platoon', 'Band Platoon', 'Ex-cadets'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-[11px] ${
                      categoryFilter === cat
                        ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs font-bold'
                        : 'text-[#695c4e] dark:text-[#aca596]'
                    }`}
                  >
                    {cat === 'All' ? 'All Cadets' : cat}
                  </button>
                ))}
              </div>

              {/* Section Filter */}
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
              >
                <option value="All">All Sections</option>
                <option value="Platoon HQ">Platoon HQ</option>
                <option value="Section 01">Section 01</option>
                <option value="Section 02">Section 02</option>
                <option value="Section 03">Section 03</option>
                <option value="Band HQ">Band HQ</option>
                <option value="Band Section 01">Band Section 01 (Brass/Bugle)</option>
                <option value="Band Section 02">Band Section 02 (Drums)</option>
                <option value="Ex-cadet Platoon">Ex-cadet Platoon</option>
              </select>

              <button
                onClick={() => {
                  setEditingCadet(null);
                  setActiveSubtab('registerCadet');
                }}
                className="japandi-btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Cadet</span>
              </button>

              {/* Export Cadet Data Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  className="japandi-btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Export Cadet Directory Data"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Data</span>
                </button>

                {isExportMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-72 bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl shadow-xl p-2.5 z-30 space-y-2 text-xs"
                    onMouseLeave={() => setIsExportMenuOpen(false)}
                  >
                    <div className="px-1 py-0.5 font-bold text-[11px] text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-1.5">
                      Export Cadet Directory
                    </div>

                    <div className="p-2 bg-[#eedc82]/20 dark:bg-[#eedc82]/10 rounded-xl space-y-1.5 border border-[#eedc82]/40">
                      <div className="text-[11px] font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center justify-between">
                        <span>All Cadets ({cadetUsers.length})</span>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-[#6b5e10] dark:text-[#eedc82]">Combined</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            downloadCadetsFile(cadetUsers, 'all', 'xlsx');
                            setIsExportMenuOpen(false);
                          }}
                          className="flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Excel (.xlsx)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            downloadCadetsFile(cadetUsers, 'all', 'csv');
                            setIsExportMenuOpen(false);
                          }}
                          className="flex-1 py-1.5 px-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[#1c1c18] dark:text-[#fcfbf7] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> CSV (.csv)
                        </button>
                      </div>
                    </div>

                    <div className="p-2 bg-[#f6f3ed] dark:bg-[#141311] rounded-xl space-y-1.5">
                      <div className="text-[11px] font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                        Currently Serving Cadets ({maleServingCount + femaleServingCount + bandServingCount})
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            downloadCadetsFile(cadetUsers, 'serving', 'xlsx');
                            setIsExportMenuOpen(false);
                          }}
                          className="flex-1 py-1.5 px-2 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Excel (.xlsx)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            downloadCadetsFile(cadetUsers, 'serving', 'csv');
                            setIsExportMenuOpen(false);
                          }}
                          className="flex-1 py-1.5 px-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[#1c1c18] dark:text-[#fcfbf7] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> CSV (.csv)
                        </button>
                      </div>
                    </div>

                    <div className="p-2 bg-[#f6f3ed] dark:bg-[#141311] rounded-xl space-y-1.5">
                      <div className="text-[11px] font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                        Ex-Cadets Alumni ({exCadetCount})
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            downloadCadetsFile(cadetUsers, 'ex', 'xlsx');
                            setIsExportMenuOpen(false);
                          }}
                          className="flex-1 py-1.5 px-2 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Excel (.xlsx)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            downloadCadetsFile(cadetUsers, 'ex', 'csv');
                            setIsExportMenuOpen(false);
                          }}
                          className="flex-1 py-1.5 px-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[#1c1c18] dark:text-[#fcfbf7] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> CSV (.csv)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {approvedCadets.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all cadets from the Cadet Corner directory? This cannot be undone.')) {
                      clearAllCadetUsers();
                    }
                  }}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer border border-[#cdc6b3]/50 dark:border-[#423e35]"
                  title="Clear All Cadets (Empty Slate)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cadet Cards / List */}
          {filteredRoster.length === 0 ? (
            <div className="p-12 text-center bg-[#fcf9f3] dark:bg-[#1e1d19] border border-dashed border-[#cdc6b3] dark:border-[#423e35] rounded-3xl space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eedc82]/30 flex items-center justify-center text-[#6b5e10] dark:text-[#eedc82]">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  No Cadets Found in Platoon Directory
                </h3>
                <p className="text-xs text-[#695c4e] dark:text-[#aca596] max-w-md mx-auto mt-1">
                  {cadetUsers.length === 0
                    ? 'The cadet database is currently a clean empty slate. Platoon administration can now register new cadets into Male, Female, Band, or Ex-cadets categories.'
                    : 'No cadets matched your current search and filter criteria.'}
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setActiveSubtab('registerCadet')}
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register First Cadet</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRoster.map((cadet, cIdx) => (
                <div
                  key={cadet.id ? `cadet-${cadet.id}-${cIdx}` : `cadet-${cIdx}`}
                  className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-4 sm:p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {cadet.avatarUrl ? (
                      <img
                        src={cadet.avatarUrl}
                        alt={cadet.name || 'Cadet'}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border border-[#cdc6b3] dark:border-[#423e35] shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[#eedc82]/30 border border-[#cdc6b3] dark:border-[#423e35] flex items-center justify-center text-[#6b5e10] dark:text-[#eedc82] font-mono font-bold text-xs shrink-0">
                        {cadet.bloodGroup || 'BNCC'}
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/25 px-2 py-0.5 rounded-md border border-[#cdc6b3]/40">
                          {cadet.cadetNo}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cadet.category === 'Male Platoon'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                              : cadet.category === 'Female Platoon'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                              : cadet.category === 'Band Platoon'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {cadet.category || 'Male Platoon'}
                        </span>
                        {cadet.section && (
                          <span className="text-[10px] font-medium bg-[#f0eee8] dark:bg-[#141311] text-[#4a4738] dark:text-[#aca596] px-2 py-0.5 rounded-md border border-[#cdc6b3]/40">
                            {cadet.section}
                          </span>
                        )}
                        {cadet.gender && (
                          <span className="text-[10px] text-[#7c7767]">
                            ({cadet.gender})
                          </span>
                        )}
                        <span className="text-[10px] text-[#7c7767] font-mono bg-zinc-200/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded">
                          Pass: <strong>{cadet.password}</strong>
                        </span>
                      </div>

                      <h4 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7] truncate">
                        {cadet.rank || 'Cadet'} {cadet.name || ''}
                      </h4>

                      <div className="flex items-center gap-2.5 text-xs text-[#695c4e] dark:text-[#aca596] flex-wrap">
                        <span>{cadet.department}</span>
                        <span>•</span>
                        <span>{cadet.batch}</span>
                        <span>•</span>
                        <span>Phone: {cadet.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => {
                        setPasswordModalCadet(cadet);
                        setNewPasswordValue(cadet.password);
                      }}
                      className="japandi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                      title="Set or Change Password"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Set Pass</span>
                    </button>
                    <button
                      onClick={() => handleStartEditCadet(cadet)}
                      className="japandi-btn-secondary text-[11px] py-1.5 px-2.5 flex items-center gap-1 cursor-pointer"
                      title="Edit Cadet Record"
                    >
                      <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete cadet "${cadet.cadetNo} - ${cadet.name || 'Cadet'}"?`)) {
                          deleteCadetUser(cadet.id, cadet.cadetNo);
                        }
                      }}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-500/10 cursor-pointer"
                      title="Remove from Platoon Database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: PENDING APPLICANTS & APPROVAL */}
      {activeSubtab === 'applicants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#fcf9f3] dark:bg-[#1e1d19] p-4 rounded-2xl border border-[#cdc6b3]/40 dark:border-[#423e35]">
            <div>
              <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Cadet Registration Submissions</span>
              </h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                Cadets submit registration via the public Cadet Corner. Review each applicant, assign their official login password, platoon category, rank, and section.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#eedc82]/40 hover:bg-[#eedc82] text-[#1c1c18] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh from cloud database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
                <span>{isSyncing ? 'Checking...' : 'Refresh'}</span>
              </button>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">
                {pendingApplicants.length} Pending
              </span>
            </div>
          </div>

          {pendingApplicants.length === 0 ? (
            <div className="p-12 text-center bg-[#fcf9f3] dark:bg-[#1e1d19] border border-dashed border-[#cdc6b3] dark:border-[#423e35] rounded-3xl space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                No Pending Applicants
              </h4>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596] max-w-sm mx-auto">
                All submitted cadet registrations have been reviewed. When new cadets submit the registration form, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApplicants.map((appl, aIdx) => (
                <div
                  key={appl.id ? `pending-${appl.id}-${aIdx}` : `pending-${aIdx}`}
                  className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-amber-500/40 p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Pending Admin Approval
                      </span>
                      <span className="font-mono text-xs font-bold bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82] px-2 py-0.5 rounded">
                        {appl.cadetNo || appl.collegeId}
                      </span>
                      <span className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                        Category: <strong>{appl.category}</strong>
                      </span>
                      {appl.gender && (
                        <span className="text-xs text-[#7c7767]">({appl.gender})</span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7]">
                      {appl.name || 'Applicant'}
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-[#695c4e] dark:text-[#aca596] pt-1">
                      <div>Dept: <strong>{appl.department}</strong></div>
                      <div>Batch: <strong>{appl.batch}</strong></div>
                      <div>Blood: <strong className="text-red-600 font-bold">{appl.bloodGroup}</strong></div>
                      <div>DOB: <strong>{appl.dob || 'N/A'}</strong></div>
                      <div>Phone: <strong>{appl.phone || 'N/A'}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleStartApproveApplicant(appl)}
                      className="japandi-btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Review & Approve (Set Password)</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Reject and delete registration for "${appl.name || 'Applicant'}"?`)) {
                          deleteCadetUser(appl.id, appl.cadetNo);
                        }
                      }}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-500/10 cursor-pointer"
                      title="Reject Applicant"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: DIRECT CADET REGISTRATION & IN-PANEL EDITING */}
      {activeSubtab === 'registerCadet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setEditingCadet(null);
                setActiveSubtab('roster');
              }}
              className="text-xs font-semibold text-[#6b5e10] dark:text-[#eedc82] hover:underline cursor-pointer flex items-center gap-1"
            >
              ← Back to Platoon Roster
            </button>
            {editingCadet && (
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                Editing: {editingCadet.rank || 'Cadet'} {editingCadet.name || ''} ({editingCadet.cadetNo || ''})
              </span>
            )}
          </div>
          <CadetRegistrationForm
            isAdmin={true}
            editingCadet={editingCadet}
            onCancelEdit={() => {
              setEditingCadet(null);
              setActiveSubtab('roster');
            }}
            onSuccess={() => {
              setEditingCadet(null);
              setActiveSubtab('roster');
            }}
          />
        </div>
      )}

      {/* SUBTAB 4: PENDING PROFILE UPDATES */}
      {activeSubtab === 'pendingProfileUpdates' && (
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <UserCog className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Cadet Profile Update Approval Queue</span>
              </h3>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-0.5">
                Review and approve profile change requests submitted by cadets. Approved changes instantly sync to the platoon directory and local storage.
              </p>
            </div>
          </div>

          {pendingProfileUpdates.filter(r => r.status === 'pending').length === 0 ? (
            <div className="p-8 text-center bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-dashed border-[#cdc6b3] dark:border-[#423e35] text-xs text-[#695c4e] dark:text-[#aca596]">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <span>No pending profile update requests from cadets.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProfileUpdates.filter(r => r.status === 'pending').map((req) => (
                <div key={req.id} className="p-5 bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/60 dark:border-[#38352d] rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cdc6b3]/40 dark:border-[#38352d] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-[#1c1c18] dark:bg-black text-white px-2.5 py-0.5 rounded-full">
                          {req.cadetNo}
                        </span>
                        <strong className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                          {req.cadetName || 'Cadet'}
                        </strong>
                      </div>
                      <p className="text-[11px] text-[#7c7767] dark:text-[#aca596] mt-1">
                        Requested on: {new Date(req.requestedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          approveProfileUpdate(req.id);
                        }}
                        className="japandi-btn-primary text-xs py-1.5 px-3.5 font-bold flex items-center gap-1 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectProfileUpdate(req.id);
                        }}
                        className="japandi-btn-secondary text-xs py-1.5 px-3 font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Table of requested changes */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider text-[10px] block">
                      Requested Modifications:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {Object.entries(req.changes).map(([field, val]) => (
                        <div key={field} className="p-2.5 bg-[#fcf9f3] dark:bg-[#1e1d19] rounded-xl border border-[#cdc6b3]/40 dark:border-[#38352d]">
                          <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] uppercase font-bold block">{field}</span>
                          <span className="font-mono text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] break-words">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: TRAINING MANUALS */}
      {activeSubtab === 'trainingManuals' && (
        <div className="space-y-6">
          {/* Add Manual Form */}
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/40 dark:border-[#423e35] pb-3">
              <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Upload & Publish Cadet Training Manual</span>
              </h3>
            </div>

            {manualMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                {manualMsg}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!manualTitle.trim()) return;
              addTrainingManual({
                title: manualTitle.trim(),
                category: manualCategory,
                description: manualDescription.trim(),
                fileUrl: manualFileUrl.trim(),
                fileSize: manualFileSize.trim() || '2.5 MB PDF',
              });
              setManualTitle('');
              setManualDescription('');
              setManualFileUrl('');
              setManualMsg('Training Manual added successfully! Authenticated cadets can now view and download it.');
              setTimeout(() => setManualMsg(''), 4000);
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Manual Title *</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Squad Drill & Parade Manual 2024"
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Category *</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  >
                    <option value="Drill & Discipline">Drill & Discipline</option>
                    <option value="Map Reading">Map Reading</option>
                    <option value="Weapons & Tactics">Weapons & Tactics</option>
                    <option value="General Studies">General Studies</option>
                    <option value="Leadership">Leadership</option>
                    <option value="First Aid & Rescue">First Aid & Rescue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Description / Scope *</label>
                <textarea
                  rows={2}
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Summary of syllabus topics covered in this manual..."
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">Document File URL / Cloudinary URL</label>
                  <input
                    type="text"
                    value={manualFileUrl}
                    onChange={(e) => setManualFileUrl(e.target.value)}
                    placeholder="https://example.com/manual.pdf"
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">File Size Tag</label>
                  <input
                    type="text"
                    value={manualFileSize}
                    onChange={(e) => setManualFileSize(e.target.value)}
                    placeholder="e.g. 3.2 MB PDF"
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Training Manual</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Published Manuals */}
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
              Published Training Manuals Library ({trainingManuals.length})
            </h4>

            {trainingManuals.length === 0 ? (
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">No custom manuals published yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {trainingManuals.map((manual) => (
                  <div key={manual.id} className="p-4 bg-[#f6f3ed] dark:bg-[#151411] border border-[#cdc6b3]/50 dark:border-[#38352d] rounded-2xl space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#7c7767]">{manual.fileSize || 'PDF'}</span>
                        <span className="font-bold text-[#6b5e10] dark:text-[#eedc82]">{manual.category}</span>
                      </div>
                      <h5 className="font-bold text-xs text-[#1c1c18] dark:text-[#fcfbf7]">{manual.title}</h5>
                      <p className="text-[11px] text-[#4a4738] dark:text-[#aca596]">{manual.description}</p>
                    </div>

                    <div className="pt-2 border-t border-[#cdc6b3]/40 flex items-center justify-between">
                      <span className="text-[10px] text-[#7c7767]">{manual.addedAt || 'Official'}</span>
                      <button
                        type="button"
                        onClick={() => deleteTrainingManual(manual.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                        title="Delete Manual"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: SET PASSWORD MODAL */}
      {passwordModalCadet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                  Define Cadet Password
                </h4>
              </div>
              <button
                onClick={() => setPasswordModalCadet(null)}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
              Set the portal login password for Cadet <strong>{passwordModalCadet.cadetNo}</strong> ({passwordModalCadet.name || 'Cadet'}).
            </p>

            <form onSubmit={handleSetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter password..."
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalCadet(null)}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REVIEW & APPROVE APPLICANT MODAL */}
      {approvingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                  Approve Cadet & Issue Credentials
                </h4>
              </div>
              <button
                onClick={() => setApprovingApplicant(null)}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#eedc82]/15 border border-[#cdc6b3]/50 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                Applicant: {approvingApplicant.name || 'Cadet'}
              </div>
              <div className="text-[#695c4e] dark:text-[#aca596]">
                Dept: {approvingApplicant.department} • Phone: {approvingApplicant.phone} • Blood: {approvingApplicant.bloodGroup}
              </div>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Assign Cadet No. (Login ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={approvalCadetNo}
                    onChange={(e) => setApprovalCadetNo(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Provide Login Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={approvalPassword}
                    onChange={(e) => setApprovalPassword(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Platoon Category *
                  </label>
                  <select
                    value={approvalCategory}
                    onChange={(e) => setApprovalCategory(e.target.value as PlatoonCategory)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                  >
                    <option value="Male Platoon">Male Platoon (Quota: 31)</option>
                    <option value="Female Platoon">Female Platoon (Quota: 31)</option>
                    <option value="Band Platoon">Band Platoon (Quota: 15)</option>
                    <option value="Ex-cadets">Ex-cadets (Unlimited)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Section Assignment *
                  </label>
                  <select
                    value={approvalSection}
                    onChange={(e) => setApprovalSection(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                  >
                    {approvalCategory === 'Band Platoon' ? (
                      <>
                        <option value="Band Section 01">Band Section 01 (Brass & Bugle)</option>
                        <option value="Band Section 02">Band Section 02 (Drum & Percussion)</option>
                        <option value="Band HQ">Band HQ</option>
                      </>
                    ) : approvalCategory === 'Ex-cadets' ? (
                      <option value="Ex-cadet Platoon">Ex-cadet Platoon</option>
                    ) : (
                      <>
                        <option value="Section 01">Section 01</option>
                        <option value="Section 02">Section 02</option>
                        <option value="Section 03">Section 03</option>
                        <option value="Platoon HQ">Platoon HQ</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Assigned Rank *
                </label>
                <select
                  value={approvalRank}
                  onChange={(e) => setApprovalRank(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                >
                  <option value="Cadet (CDT)">Cadet (CDT)</option>
                  <option value="Lance Corporal (LCPL)">Lance Corporal (LCPL)</option>
                  <option value="Cadet Corporal (CPL)">Cadet Corporal (CPL)</option>
                  <option value="Cadet Sergeant (CDT SGT)">Cadet Sergeant (CDT SGT)</option>
                  <option value="Cadet Under Officer (CUO)">Cadet Under Officer (CUO)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#cdc6b3]/50 dark:border-[#423e35]">
                <button
                  type="button"
                  onClick={() => setApprovingApplicant(null)}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Grant Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database (Appwrite Cloud & Supabase) & Cloudinary Settings Modal */}
      <DatabaseAndCloudSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSyncCadets={syncCadetsWithCloud}
      />
    </div>
  );
};
