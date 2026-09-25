import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  Search,
  Download,
  Printer,
  Eye,
  LogOut,
  Award,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  Droplet,
  User,
  Building2,
  LayoutGrid,
  ListFilter,
  UserCheck,
  Sparkles,
  BarChart3,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Edit3,
  Lock,
  EyeOff,
  Check,
  Upload,
  Loader2
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useCadetRoster } from '../../context/CadetRosterContext';
import { CadetUserAccount, RecruitmentApplicant, OfficerAccount } from '../../types';
import { RecruitmentApplicationSlipA4 } from '../common/RecruitmentApplicationSlipA4';
import { CadetDirectoryView } from '../CadetDirectoryView';
import { safeStorage } from '../../utils/safeStorage';
import { fetchOfficerAccounts, saveOfficerAccounts, upsertSiteSettingToApi } from '../../utils/apiClient';
import { processPassportPhoto, uploadImageToCloudinary } from '../../utils/cloudinary';

interface OfficerInspectorViewProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const OfficerInspectorView: React.FC<OfficerInspectorViewProps> = ({ onLogout, onNavigateHome }) => {
  const { cadetAccounts, applicants } = useAdminData();
  const { cadetUsers } = useCadetRoster();

  const [officerAccounts, setOfficerAccounts] = useState<OfficerAccount[]>([]);

  useEffect(() => {
    const loadOfficers = async () => {
      try {
        const accounts = await fetchOfficerAccounts();
        if (accounts && accounts.length > 0) {
          setOfficerAccounts(accounts);
        }
      } catch {}
    };
    loadOfficers();
  }, []);

  // Combine cadet accounts from AdminData and CadetRosterContext for 100% complete directory coverage
  const allCadets = useMemo(() => {
    const map = new Map<string, any>();
    
    // Add cadetUsers from CadetRosterContext first (richer full profiles)
    if (Array.isArray(cadetUsers)) {
      cadetUsers.forEach((c) => {
        if (!c) return;
        const key = String(c.cadetNo || c.cadetNumber || c.id || '').trim().toLowerCase();
        if (key) map.set(key, c);
      });
    }

    // Add cadetAccounts from AdminData if missing
    if (Array.isArray(cadetAccounts)) {
      cadetAccounts.forEach((c) => {
        if (!c) return;
        const key = String(c.cadetNumber || (c as any).cadetNo || c.id || '').trim().toLowerCase();
        if (key && !map.has(key)) {
          map.set(key, c);
        }
      });
    }

    return Array.from(map.values());
  }, [cadetUsers, cadetAccounts]);

  const applications = Array.isArray(applicants) ? applicants : [];

  // Logged in Officer Identification
  const officerUsername = safeStorage.getItem('ngdc_officer_id') || 'BNCC_OFFICER';
  
  // Find matched officer account profile or fallback to defaults
  const loggedOfficer = useMemo(() => {
    if (Array.isArray(officerAccounts)) {
      const found = officerAccounts.find(
        (o) => String(o?.username || '').trim().toLowerCase() === officerUsername.trim().toLowerCase()
      );
      if (found) return found;
    }

    if (officerUsername.toLowerCase().includes('vp')) {
      return {
        id: 'off-vp',
        fullName: 'Prof. Dr. Md. Shariful Islam',
        rank: 'BNCCO',
        designation: 'Vice Principal & Battalion Inspector',
        role: 'College Faculty Inspector',
        username: 'OFFICER_VP',
        status: 'active',
        picture: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019638/zxirwqcln84pews7frcx.jpg',
        image: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019638/zxirwqcln84pews7frcx.jpg',
        photoUrl: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019638/zxirwqcln84pews7frcx.jpg'
      };
    }

    return {
      id: 'off-1',
      fullName: 'PUO Md. Abdul Matin',
      rank: 'PUO',
      designation: 'Platoon Commander & Assistant Professor',
      role: 'Platoon Commander & Executive Inspector',
      username: 'BNCC_OFFICER',
      status: 'active',
      picture: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019772/vrefgswpj8ltquhu5bd1.jpg',
      image: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019772/vrefgswpj8ltquhu5bd1.jpg',
      photoUrl: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019772/vrefgswpj8ltquhu5bd1.jpg'
    };
  }, [officerAccounts, officerUsername]);

  // Main Tabs State
  const [activeTab, setActiveTab] = useState<'directory' | 'recruitment' | 'analytics'>('directory');

  // Profile Edit Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDesignation, setProfileDesignation] = useState('');
  const [profileRank, setProfileRank] = useState('');
  const [profileAppointmentRole, setProfileAppointmentRole] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  const handleOfficerProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const photoRes = await processPassportPhoto(file);
      if (photoRes?.url) {
        setProfilePicture(photoRes.url);
      } else {
        const cUrl = await uploadImageToCloudinary(file, 'officer-photos', false);
        if (cUrl) setProfilePicture(cUrl);
      }
    } catch (err) {
      console.error('Officer profile photo upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenProfileModal = () => {
    setProfileName(loggedOfficer.fullName || '');
    setProfileDesignation(loggedOfficer.designation || '');
    setProfileRank(loggedOfficer.rank || 'PUO');
    setProfileAppointmentRole((loggedOfficer as any).appointmentRole || loggedOfficer.role || 'Platoon Commander');
    setProfilePhone((loggedOfficer as any).phone || '');
    setProfileEmail((loggedOfficer as any).email || '');
    setProfilePicture((loggedOfficer as any).picture || (loggedOfficer as any).image || (loggedOfficer as any).photoUrl || '');
    setProfileUsername(loggedOfficer.username || '');
    setProfilePassword((loggedOfficer as any).password || 'Officer$2026');
    setProfileSavedMsg('');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileUsername.trim() || !profilePassword.trim()) {
      return;
    }

    const updatedOfficer: OfficerAccount = {
      ...loggedOfficer,
      fullName: profileName.trim(),
      designation: profileDesignation.trim() || 'College Faculty',
      rank: profileRank,
      role: profileAppointmentRole.trim() || loggedOfficer.role,
      appointmentRole: profileAppointmentRole.trim(),
      phone: profilePhone.trim(),
      email: profileEmail.trim(),
      picture: profilePicture.trim(),
      image: profilePicture.trim(),
      photoUrl: profilePicture.trim(),
      username: profileUsername.trim(),
      password: profilePassword.trim()
    };

    let updatedList = [...officerAccounts];
    const existingIndex = updatedList.findIndex(
      (o) => o.id === loggedOfficer.id || o.username.toLowerCase() === loggedOfficer.username.toLowerCase()
    );

    if (existingIndex >= 0) {
      updatedList[existingIndex] = updatedOfficer;
    } else {
      updatedList.push(updatedOfficer);
    }

    setOfficerAccounts(updatedList);
    safeStorage.setItem('ngdc_officer_id', profileUsername.trim());
    await saveOfficerAccounts(updatedList);

    if (profilePicture.trim()) {
      await upsertSiteSettingToApi('ngdc_puo_custom_image_data', profilePicture.trim()).catch(() => {});
    }

    if (
      profileRank === 'PUO' ||
      profileUsername.toUpperCase().includes('OFFICER') ||
      (profileAppointmentRole && profileAppointmentRole.toLowerCase().includes('commander'))
    ) {
      await upsertSiteSettingToApi('ngdc_platoon_commander_message', {
        name: profileName.trim(),
        designation: profileDesignation.trim() || 'Platoon Commander & Assistant Professor',
        subDesignation: 'NGDC BNCC Platoon, 31 BNCC Battalion',
        badge: 'Platoon Commander & PUO',
        photoUrl: profilePicture.trim(),
        enabled: true,
      }).catch(() => {});
    }

    setProfileSavedMsg('Profile details updated successfully!');
    setTimeout(() => {
      setIsProfileModalOpen(false);
    }, 1200);
  };

  // Display Mode for Cadet Directory: Grid vs Table
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Cadet Search & Filtering State
  const [cadetSearch, setCadetSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'serving' | 'ex'>('all');
  const [platoonFilter, setPlatoonFilter] = useState<string>('all');
  const [bloodFilter, setBloodFilter] = useState<string>('all');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [selectedCadet, setSelectedCadet] = useState<any | null>(null);

  // Recruitment Search & Filter State
  const [recruitSearch, setRecruitSearch] = useState('');
  const [recruitStatusFilter, setRecruitStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<RecruitmentApplicant | null>(null);

  // Filtered Cadets
  const filteredCadets = useMemo(() => {
    const q = (cadetSearch || '').toLowerCase().trim();
    return allCadets.filter((c) => {
      if (!c) return false;

      const name = String(c.fullName || c.name || '').toLowerCase();
      const nameBn = String(c.nameBangla || '').toLowerCase();
      const no = String(c.cadetNumber || c.cadetNo || '').toLowerCase();
      const rank = String(c.rank || '').toLowerCase();
      const blood = String(c.bloodGroup || '').toLowerCase();
      const session = String(c.session || '').toLowerCase();
      const dept = String(c.department || '').toLowerCase();
      const roll = String(c.roll || c.collegeRoll || '').toLowerCase();
      const phone = String(c.phone || c.mobileNumber || '').toLowerCase();

      const matchSearch =
        !q ||
        name.includes(q) ||
        nameBn.includes(q) ||
        no.includes(q) ||
        rank.includes(q) ||
        blood.includes(q) ||
        session.includes(q) ||
        dept.includes(q) ||
        roll.includes(q) ||
        phone.includes(q);

      // Serving vs Ex-Cadet Filter
      const category = String(c.category || c.cadetType || '').toLowerCase();
      const platoonStr = String(c.platoon || '').toLowerCase();
      const isEx = category.includes('ex') || category.includes('alumni') || platoonStr.includes('ex');
      
      let matchType = true;
      if (typeFilter === 'serving') matchType = !isEx;
      if (typeFilter === 'ex') matchType = isEx;

      // Platoon Filter
      let matchPlatoon = true;
      if (platoonFilter === 'male') matchPlatoon = platoonStr.includes('male') && !platoonStr.includes('female');
      if (platoonFilter === 'female') matchPlatoon = platoonStr.includes('female');
      if (platoonFilter === 'band') matchPlatoon = platoonStr.includes('band');

      // Blood Group Filter
      let matchBlood = true;
      if (bloodFilter !== 'all') {
        const targetBlood = bloodFilter.toLowerCase().replace('+', '').replace('-', '');
        const cBlood = blood.replace('+', '').replace('-', '');
        matchBlood = cBlood.includes(targetBlood);
      }

      // Rank Filter
      let matchRank = true;
      if (rankFilter !== 'all') {
        matchRank = rank.includes(rankFilter.toLowerCase());
      }

      return matchSearch && matchType && matchPlatoon && matchBlood && matchRank;
    });
  }, [allCadets, cadetSearch, typeFilter, platoonFilter, bloodFilter, rankFilter]);

  // Filtered Recruitment Applications
  const filteredApplications = useMemo(() => {
    const q = (recruitSearch || '').toLowerCase().trim();
    return applications.filter((app) => {
      if (!app) return false;
      const matchSearch =
        !q ||
        (app.fullName || '').toLowerCase().includes(q) ||
        (app.trackingNumber || '').toLowerCase().includes(q) ||
        (app.collegeRoll || '').toLowerCase().includes(q) ||
        (app.mobileNumber || '').toLowerCase().includes(q);

      const matchStatus = recruitStatusFilter === 'all' || app.status === recruitStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [applications, recruitSearch, recruitStatusFilter]);

  // Command Statistics
  const totalCadets = allCadets.length;
  const servingCadets = allCadets.filter((c) => {
    const cat = String(c.category || c.cadetType || '').toLowerCase();
    const plt = String(c.platoon || '').toLowerCase();
    return !cat.includes('ex') && !plt.includes('ex') && !cat.includes('alumni');
  }).length;
  const exCadetsCount = totalCadets - servingCadets;

  const totalApplications = applications.length;
  const pendingApplications = applications.filter((a) => a.status === 'pending').length;

  const handlePrintRoster = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] dark:bg-[#12110e] text-[#1c1c18] dark:text-[#f0eee8] font-sans pb-16">
      {/* ================= TOP EXECUTIVE COMMAND HEADER ================= */}
      <header className="bg-[#1c1a14] text-[#fffdf5] border-b border-[#6b5e10]/40 sticky top-0 z-30 shadow-lg">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Unit Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eedc82] flex items-center justify-center text-[#1c1a14] font-bold shadow-xs shrink-0">
              <Award className="w-6 h-6 text-[#6b5e10]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-[#eedc82] uppercase">
                  NGDC BNCC Platoon Command
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ● Verified Officer Console
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                Executive Officer Inspection & Cadet Roster Console
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
            >
              Public Portal
            </button>
            <button
              onClick={onLogout}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Officer</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ================= OFFICER IDENTITY PROFILE BANNER ================= */}
        <div className="bg-gradient-to-r from-[#1c1a14] via-[#2a261c] to-[#1c1a14] border border-[#6b5e10]/40 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          {/* Background Decorative Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#eedc82_1px,transparent_1px)] [background-size:20px_20px] opacity-5 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Officer Info & Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[#eedc82]/20 border-2 border-[#eedc82] overflow-hidden flex items-center justify-center shrink-0 shadow-md relative">
                  {((loggedOfficer as any).picture || (loggedOfficer as any).image || (loggedOfficer as any).photoUrl) ? (
                    <img
                      src={(loggedOfficer as any).picture || (loggedOfficer as any).image || (loggedOfficer as any).photoUrl}
                      alt={loggedOfficer.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCheck className="w-10 h-10 text-[#eedc82]" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#eedc82] text-[#1c1a14] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-black/20">
                  {loggedOfficer.rank}
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#eedc82] bg-[#eedc82]/10 px-2.5 py-0.5 rounded-full border border-[#eedc82]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{loggedOfficer.role}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {loggedOfficer.fullName}
                </h2>
                <p className="text-xs text-[#c5bc9e] font-medium">
                  {loggedOfficer.designation} • New Govt. Degree College BNCC Platoon
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-[#eedc82]/80 font-mono">
                  <span>Username: <strong className="text-white">{loggedOfficer.username}</strong></span>
                  <span>•</span>
                  <span>Clearance Level: <strong className="text-emerald-400">Read-Only Inspector</strong></span>
                  <button
                    onClick={handleOpenProfileModal}
                    className="ml-0 sm:ml-2 text-xs font-bold px-3 py-1 rounded-lg bg-[#eedc82] hover:bg-[#ffe885] text-[#1c1a14] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile Details</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Platoon Overview Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <div className="bg-black/40 border border-[#eedc82]/20 rounded-xl p-3 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-[#c5bc9e] block">Serving Cadets</span>
                <span className="text-xl font-extrabold text-[#eedc82]">{servingCadets}</span>
              </div>
              <div className="bg-black/40 border border-[#eedc82]/20 rounded-xl p-3 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-[#c5bc9e] block">Ex-Cadets/Alumni</span>
                <span className="text-xl font-extrabold text-[#eedc82]">{exCadetsCount}</span>
              </div>
              <div className="bg-black/40 border border-[#eedc82]/20 rounded-xl p-3 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-[#c5bc9e] block">Total Roster</span>
                <span className="text-xl font-extrabold text-white">{totalCadets}</span>
              </div>
              <div className="bg-black/40 border border-[#eedc82]/20 rounded-xl p-3 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-[#c5bc9e] block">Applicants</span>
                <span className="text-xl font-extrabold text-amber-400">{totalApplications}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= NAVIGATION TABS ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#cdc6b3] dark:border-[#38342b] pb-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'directory'
                  ? 'bg-[#6b5e10] text-[#fffdf5] shadow-md'
                  : 'bg-white dark:bg-[#1a1915] text-[#555042] dark:text-[#a19988] hover:text-[#1c1c18] dark:hover:text-white border border-[#cdc6b3]/60 dark:border-[#38342b]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Cadet Directory & Roster ({totalCadets})</span>
            </button>

            <button
              onClick={() => setActiveTab('recruitment')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'recruitment'
                  ? 'bg-[#6b5e10] text-[#fffdf5] shadow-md'
                  : 'bg-white dark:bg-[#1a1915] text-[#555042] dark:text-[#a19988] hover:text-[#1c1c18] dark:hover:text-white border border-[#cdc6b3]/60 dark:border-[#38342b]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Recruitment Applicants ({totalApplications})</span>
              {pendingApplications > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingApplications}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-[#6b5e10] text-[#fffdf5] shadow-md'
                  : 'bg-white dark:bg-[#1a1915] text-[#555042] dark:text-[#a19988] hover:text-[#1c1c18] dark:hover:text-white border border-[#cdc6b3]/60 dark:border-[#38342b]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Platoon Command Analytics</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrintRoster}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white dark:bg-[#1a1915] border border-[#cdc6b3] dark:border-[#38342b] hover:bg-[#eedc82]/20 text-[#6b5e10] dark:text-[#eedc82] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Officer Report</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: CADET DIRECTORY & ROSTER VIEW ================= */}
        {activeTab === 'directory' && (
          <div className="bg-white dark:bg-[#1c1b17] border border-[#cdc6b3] dark:border-[#38342b] rounded-3xl p-5 sm:p-6 shadow-sm">
            <CadetDirectoryView isCadetLoggedIn={true} />
          </div>
        )}

        {/* ================= TAB 2: RECRUITMENT APPLICANTS ================= */}
        {activeTab === 'recruitment' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-[#1c1b17] border border-[#cdc6b3] dark:border-[#38342b] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={recruitSearch}
                    onChange={(e) => setRecruitSearch(e.target.value)}
                    placeholder="Search applicant name, roll, tracking no..."
                    className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#423e35] focus:border-[#6b5e10] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1c1c18] dark:text-[#f0eee8] outline-none"
                  />
                  <Search className="w-4 h-4 text-[#8c8474] absolute left-3.5 top-2.5" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#695c4e]">Filter Status:</span>
                  <select
                    value={recruitStatusFilter}
                    onChange={(e) => setRecruitStatusFilter(e.target.value)}
                    className="bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] rounded-xl px-3 py-1.5 text-xs text-[#1c1c18] dark:text-[#f0eee8] font-bold outline-none cursor-pointer"
                  >
                    <option value="all">All Applications ({totalApplications})</option>
                    <option value="pending">Pending Review ({pendingApplications})</option>
                    <option value="approved">Approved Applications</option>
                    <option value="rejected">Rejected Applications</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applicants Table */}
            <div className="bg-white dark:bg-[#1c1b17] border border-[#cdc6b3] dark:border-[#38342b] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0eee8] dark:bg-[#12110e] text-[#695c4e] dark:text-[#a19988] uppercase tracking-wider font-bold border-b border-[#cdc6b3]/50 dark:border-[#38342b]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Tracking No</th>
                      <th className="p-3">Applicant Name</th>
                      <th className="p-3">College Roll & Dept</th>
                      <th className="p-3">Mobile & Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cdc6b3]/30 dark:divide-[#38342b]">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#8c8474]">
                          No recruitment applications found.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app, index) => (
                        <tr key={app.id || app.trackingNumber} className="hover:bg-[#eedc82]/10 transition-colors">
                          <td className="p-3 font-mono text-[#8c8474]">{index + 1}</td>
                          <td className="p-3 font-mono font-bold text-[#6b5e10] dark:text-[#eedc82]">
                            {app.trackingNumber}
                          </td>
                          <td className="p-3 font-bold text-[#1c1c18] dark:text-white">{app.fullName}</td>
                          <td className="p-3">
                            <div>{app.department}</div>
                            <div className="text-[10px] text-[#8c8474]">Roll: {app.collegeRoll}</div>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <div>{app.mobileNumber}</div>
                            <div className="text-[10px] text-[#8c8474]">{app.emailAddress}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                app.status === 'approved'
                                  ? 'bg-emerald-500/15 text-emerald-600'
                                  : app.status === 'rejected'
                                  ? 'bg-red-500/15 text-red-600'
                                  : 'bg-amber-500/15 text-amber-600'
                              }`}
                            >
                              {app.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="p-1.5 rounded-lg bg-[#6b5e10]/15 hover:bg-[#6b5e10] text-[#6b5e10] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Slip</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: COMMAND ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1c1b17] border border-[#cdc6b3] dark:border-[#38342b] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                <h3 className="text-base font-extrabold text-[#1c1c18] dark:text-white">
                  Platoon Cadre Strength Breakdown
                </h3>
              </div>
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Serving Cadets</span>
                    <span>{servingCadets} / {totalCadets}</span>
                  </div>
                  <div className="w-full bg-[#f0eee8] dark:bg-[#12110e] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${totalCadets > 0 ? (servingCadets / totalCadets) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Ex-Cadets & Alumni</span>
                    <span>{exCadetsCount} / {totalCadets}</span>
                  </div>
                  <div className="w-full bg-[#f0eee8] dark:bg-[#12110e] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${totalCadets > 0 ? (exCadetsCount / totalCadets) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1c1b17] border border-[#cdc6b3] dark:border-[#38342b] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                <h3 className="text-base font-extrabold text-[#1c1c18] dark:text-white">
                  Recruitment Inspector Clearance
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#fcfbf9] dark:bg-[#12110e] p-3 rounded-xl border border-[#cdc6b3]/50 dark:border-[#38342b] text-center">
                  <span className="text-[10px] text-[#8c8474] uppercase font-bold block">Pending Clearance</span>
                  <span className="text-2xl font-black text-amber-500">{pendingApplications}</span>
                </div>
                <div className="bg-[#fcfbf9] dark:bg-[#12110e] p-3 rounded-xl border border-[#cdc6b3]/50 dark:border-[#38342b] text-center">
                  <span className="text-[10px] text-[#8c8474] uppercase font-bold block">Total Applications</span>
                  <span className="text-2xl font-black text-[#1c1c18] dark:text-white">{totalApplications}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: FULL CADET DOSSIER INSPECTOR ================= */}
      {selectedCadet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1b17] border border-[#cdc6b3] dark:border-[#38342b] rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl space-y-5 my-8">
            <button
              onClick={() => setSelectedCadet(null)}
              className="absolute top-4 right-4 text-[#8c8474] hover:text-[#1c1c18] dark:hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dossier Header */}
            <div className="flex items-center gap-3 border-b border-[#cdc6b3]/40 dark:border-[#38342b] pb-4">
              <div className="w-16 h-16 rounded-2xl bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center font-bold text-2xl border border-[#6b5e10]/30 shrink-0 overflow-hidden shadow-xs">
                {selectedCadet.photo || selectedCadet.image || selectedCadet.profilePicture ? (
                  <img
                    src={selectedCadet.photo || selectedCadet.image || selectedCadet.profilePicture}
                    alt={selectedCadet.fullName || selectedCadet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (selectedCadet.fullName || selectedCadet.name || 'Cadet').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#6b5e10]/15 text-[#6b5e10] dark:text-[#eedc82] mb-1">
                  <BadgeCheck className="w-3 h-3" />
                  <span>Official Cadet Dossier Inspection</span>
                </div>
                <h3 className="text-lg font-black text-[#1c1c18] dark:text-white">
                  {selectedCadet.fullName || selectedCadet.name}
                </h3>
                {selectedCadet.nameBangla && (
                  <p className="text-xs text-[#695c4e] dark:text-[#a19988] font-semibold">
                    {selectedCadet.nameBangla}
                  </p>
                )}
                <p className="text-xs text-[#6b5e10] dark:text-[#eedc82] font-mono font-bold mt-0.5">
                  BNCC Reg: {selectedCadet.cadetNumber || selectedCadet.cadetNo || 'N/A'} • {selectedCadet.rank || 'Cadet'}
                </p>
              </div>
            </div>

            {/* Dossier Body Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3]/50 dark:border-[#38342b] rounded-xl p-3.5 space-y-2">
                <span className="font-extrabold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider text-[10px] block">
                  Military & Platoon Details
                </span>
                <div className="space-y-1">
                  <div><strong>Platoon:</strong> {selectedCadet.platoon || 'NGDC Platoon'}</div>
                  <div><strong>Rank:</strong> {selectedCadet.rank || 'Cadet'}</div>
                  <div><strong>Status:</strong> {selectedCadet.category || selectedCadet.cadetType || 'Serving Cadet'}</div>
                  <div><strong>Blood Group:</strong> {selectedCadet.bloodGroup || 'N/A'}</div>
                </div>
              </div>

              <div className="bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3]/50 dark:border-[#38342b] rounded-xl p-3.5 space-y-2">
                <span className="font-extrabold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider text-[10px] block">
                  Academic & Institution Profile
                </span>
                <div className="space-y-1">
                  <div><strong>College Roll:</strong> {selectedCadet.roll || selectedCadet.collegeRoll || 'N/A'}</div>
                  <div><strong>Academic Department:</strong> {selectedCadet.department || 'General'}</div>
                  <div><strong>Academic Session:</strong> {selectedCadet.session || 'N/A'}</div>
                  <div><strong>Passing Year:</strong> {selectedCadet.passingYear || 'N/A'}</div>
                </div>
              </div>

              <div className="bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3]/50 dark:border-[#38342b] rounded-xl p-3.5 space-y-2 sm:col-span-2">
                <span className="font-extrabold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider text-[10px] block">
                  Contact & Communication Info
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><strong>Mobile Phone:</strong> {selectedCadet.phone || selectedCadet.mobileNumber || 'N/A'}</div>
                  <div><strong>Email Address:</strong> {selectedCadet.email || 'N/A'}</div>
                  <div><strong>Guardian Name:</strong> {selectedCadet.guardianName || 'N/A'}</div>
                  <div><strong>Guardian Phone:</strong> {selectedCadet.guardianPhone || 'N/A'}</div>
                  <div className="sm:col-span-2"><strong>Permanent Address:</strong> {selectedCadet.address || 'New Govt. Degree College, Rajshahi'}</div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-2 border-t border-[#cdc6b3]/40 dark:border-[#38342b] flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-[#6b5e10] text-white hover:bg-[#554a0d] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Cadet Dossier Sheet</span>
              </button>

              <button
                onClick={() => setSelectedCadet(null)}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECRUITMENT APPLICATION SLIP ================= */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1b17] border border-[#cdc6b3] dark:border-[#38342b] rounded-2xl max-w-3xl w-full p-6 relative shadow-2xl space-y-4 my-8">
            <button
              onClick={() => setSelectedApplication(null)}
              className="absolute top-4 right-4 text-[#8c8474] hover:text-[#1c1c18] dark:hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <RecruitmentApplicationSlipA4 applicant={selectedApplication} />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#cdc6b3]/40">
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: OFFICER PROFILE & ACCOUNT SETTINGS ================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1b17] border border-[#cdc6b3] dark:border-[#38342b] rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-4 my-8">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-[#8c8474] hover:text-[#1c1c18] dark:hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-[#cdc6b3]/40 pb-3">
              <Award className="w-5 h-5 text-[#6b5e10]" />
              <h3 className="text-base font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
                Edit Officer Profile & Account Settings
              </h3>
            </div>

            {profileSavedMsg && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{profileSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  1. Officer Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PUO Md. Abdul Matin"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] px-3 py-2 rounded-xl outline-none font-bold text-[#1c1c18] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  2. Designation / College Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assistant Professor, Dept. of Physics"
                  value={profileDesignation}
                  onChange={(e) => setProfileDesignation(e.target.value)}
                  className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] px-3 py-2 rounded-xl outline-none font-medium text-[#1c1c18] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  3. Appointment Role in BNCC
                </label>
                <input
                  type="text"
                  placeholder="e.g. Platoon Commander & Executive Inspector"
                  value={profileAppointmentRole}
                  onChange={(e) => setProfileAppointmentRole(e.target.value)}
                  className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] px-3 py-2 rounded-xl outline-none font-medium text-[#1c1c18] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    4. Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +8801700000000"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] px-3 py-2 rounded-xl outline-none font-mono text-[#1c1c18] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    4. Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="officer@ngdc.ac.bd"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] px-3 py-2 rounded-xl outline-none font-mono text-[#1c1c18] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    5. Rank
                  </label>
                  <select
                    value={profileRank}
                    onChange={(e) => setProfileRank(e.target.value)}
                    className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] px-3 py-2 rounded-xl outline-none font-bold text-[#1c1c18] dark:text-white"
                  >
                    <option value="PUO">PUO</option>
                    <option value="BNCCO">BNCCO</option>
                    <option value="Professor">Professor</option>
                    <option value="Major">Major</option>
                    <option value="Captain">Captain</option>
                  </select>
                </div>

              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  6. Officer Picture / Passport Photo (Cloudinary Compressed Direct Upload)
                </label>
                <div className="flex items-center gap-3 bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] p-2.5 rounded-xl">
                  <div className="relative w-12 h-12 rounded-lg border border-[#cdc6b3] dark:border-[#38342b] overflow-hidden bg-white dark:bg-[#1e1d19] shrink-0 flex items-center justify-center">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-[#8c8474]" />
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-[#6b5e10] hover:bg-[#554a0d] text-white text-[11px] font-bold rounded-xl transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingImage ? 'Compressing & Uploading...' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingImage}
                          onChange={handleOfficerProfileImageUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] font-semibold text-[#8c8474]">Cloudinary Passport CDN</span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://... Cloudinary image URL"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      className="w-full bg-white dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#38342b] px-2.5 py-1 rounded-lg outline-none font-mono text-[10px] text-[#1c1c18] dark:text-white"
                    />
                  </div>
                </div>
              </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    7. User ID / Username <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BNCC_OFFICER"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] px-3 py-2 rounded-xl outline-none font-mono font-bold text-[#6b5e10] dark:text-[#eedc82]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    8. Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      className="w-full bg-[#fcfbf9] dark:bg-[#12110e] border border-[#cdc6b3] dark:border-[#38342b] px-3 py-2 pr-9 rounded-xl outline-none font-mono font-bold text-[#1c1c18] dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-[#8c8474] hover:text-[#1c1c18] dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#cdc6b3]/40">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#cdc6b3] text-[#555042] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6b5e10] hover:bg-[#554a0d] text-white px-5 py-2 rounded-xl font-bold cursor-pointer transition-all shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
