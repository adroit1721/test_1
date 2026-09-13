import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from '../data/bnccData';
import { CadetProfile, PlatoonCategory } from '../types';
import { useAdminData } from '../context/AdminDataContext';
import { framerSectionVariants, framerPopItemVariants, scrollViewportConfig } from '../utils/motionVariants';
import { CadetRegistrationForm } from './CadetRegistrationForm';
import { CadetDirectoryView } from './CadetDirectoryView';
import { CadetVerificationModal } from './common/CadetVerificationModal';
import {
  UserCheck,
  Award,
  Download,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Search,
  BookOpen,
  Lock,
  LogIn,
  UserPlus,
  LogOut,
  AlertCircle,
  KeyRound,
  IdCard,
  Check,
  Clock,
  ClipboardCheck,
  ArrowLeft,
  Users,
  Save,
  FileText,
} from 'lucide-react';

interface CadetsCornerProps {
  initialAuthMode?: 'login' | 'register';
  onOpenCadetLogin?: () => void;
  onOpenCadetRegister?: () => void;
}

const DEFAULT_FALLBACK_CADET: CadetProfile = {
  id: 'ngdc-cdt-default',
  cadetNo: 'NGDC-2024-001',
  name: 'BNCC Cadet',
  rank: 'Cadet (CDT)',
  platoon: 'Male Platoon',
  batch: 'Batch 24',
  collegeId: 'NGDC-2024-001',
  department: 'General',
  bloodGroup: 'B+',
  joiningDate: '2024',
  attendancePercentage: 95,
  paradesAttended: 38,
  totalParades: 40,
  campsAttended: ['Annual Training Camp'],
  certificates: ['BNCC Drill & Discipline Clearance'],
  status: 'Active',
};

export const CadetsCornerView: React.FC<CadetsCornerProps> = ({
  initialAuthMode = 'login',
}) => {
  const {
    cadetUsers,
    cadetRegFields,
    cadetLogin,
    cadetRegister,
    activeCadetAuth,
    cadetLogout,
    cadetCornerModules,
    requestProfileUpdate,
    pendingProfileUpdates,
    trainingManuals,
  } = useAdminData();

  // Public Cadet Verification Modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Authentication tab state (Strictly login & register before authentication; Directory is locked until login)
  const [authTab, setAuthTab] = useState<'login' | 'register'>(
    initialAuthMode === 'register' ? 'register' : 'login'
  );
  const [portalTab, setPortalTab] = useState<'directory' | 'profile' | 'manuals'>('directory');

  // Session state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ngdc_bncc_cadet_auth') === 'true';
    }
    return false;
  });

  const [currentCadet, setCurrentCadet] = useState<CadetProfile>(() => {
    if (typeof window !== 'undefined') {
      const savedCadet = sessionStorage.getItem('ngdc_bncc_cadet_data');
      if (savedCadet) {
        try {
          const parsed = JSON.parse(savedCadet);
          if (parsed && typeof parsed === 'object' && parsed.name) {
            return parsed;
          }
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_FALLBACK_CADET;
  });

  // Profile Edit State inside "My Profile" tab
  const [profileEditForm, setProfileEditForm] = useState({
    fullName: currentCadet?.name || '',
    rank: currentCadet?.rank || 'Cadet (CDT)',
    phone: currentCadet?.phone || '',
    email: currentCadet?.email || '',
    department: currentCadet?.department || '',
    bloodGroup: currentCadet?.bloodGroup || 'B+',
    dob: currentCadet?.dob || '',
    presentAddress: currentCadet?.presentAddress || '',
    password: '',
  });
  const [profileUpdateMsg, setProfileUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentCadet) {
      setProfileEditForm({
        fullName: currentCadet?.name || '',
        rank: currentCadet?.rank || 'Cadet (CDT)',
        phone: currentCadet?.phone || '',
        email: currentCadet?.email || '',
        department: currentCadet?.department || '',
        bloodGroup: currentCadet?.bloodGroup || 'B+',
        dob: currentCadet?.dob || '',
        presentAddress: currentCadet?.presentAddress || '',
        password: '',
      });
    }
  }, [currentCadet]);

  // Login Form State
  const [loginCadetId, setLoginCadetId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginInfoMessage, setLoginInfoMessage] = useState('');

  // Dynamic Registration Form State from Form Builder
  const [regFormData, setRegFormData] = useState<Record<string, string>>({
    'cr-1': '', // Cadet Full Name
    'cr-2': 'Male Platoon', // Platoon Category
    'cr-3': 'Male', // Gender
    'cr-4': 'Cadet (CDT)', // Rank
    'cr-5': '', // College Roll / Student ID
    'cr-6': 'Dept. of Physics', // Department
    'cr-7': 'Batch 24 (2024-2025)', // Batch
    'cr-8': 'B+', // Blood Group
    'cr-9': '', // Phone
    'cr-10': '', // Email
    'cr-11': 'Section 01', // Section
  });
  const [regError, setRegError] = useState('');
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    id: string;
    name: string;
    category: string;
    cadetNo: string;
  } | null>(null);

  // Peer Verification search state inside portal
  const [searchCadetNo, setSearchCadetNo] = useState('');
  const [searchedCadet, setSearchedCadet] = useState<CadetProfile | null>(null);
  const [lookupMessage, setLookupMessage] = useState('');

  // Download manual notification state
  const [downloadedManual, setDownloadedManual] = useState<string | null>(null);

  // Handle Cadet Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginInfoMessage('');

    const trimmedId = loginCadetId.trim().toUpperCase();
    if (!trimmedId) {
      setLoginError('Please enter your Cadet ID or College Roll Number.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your portal password.');
      return;
    }

    // Call context login function
    const result = cadetLogin(trimmedId, loginPassword);

    if (!result.success) {
      if (result.cadet && !result.cadet.isApproved) {
        setLoginInfoMessage(
          'Your cadet registration is pending Platoon Admin approval. Platoon Administration will verify your enrolment against platoon quotas and assign your login password before you can access the portal.'
        );
      } else {
        setLoginError(result.message || 'Invalid Cadet ID or password. Please verify your credentials or contact Platoon Administration.');
      }
      return;
    }

    if (result.cadet) {
      const activeCadet: CadetProfile = {
        ...result.cadet,
        id: result.cadet.id || String(Date.now()),
        cadetNo: result.cadet.cadetNo || 'NGDC-CADET',
        name: result.cadet.name || result.cadet.fullName || 'Cadet',
        rank: result.cadet.rank || 'Cadet (CDT)',
        platoon: result.cadet.platoon || `${result.cadet.category || 'BNCC Platoon'} (${result.cadet.section || 'Platoon HQ'})`,
        batch: result.cadet.batch || 'Batch 24',
        collegeId: result.cadet.cadetNo || 'NGDC-CADET',
        department: result.cadet.department || 'General',
        bloodGroup: result.cadet.bloodGroup || 'B+',
        joiningDate: result.cadet.joiningDate || 'Approved Cadet',
        attendancePercentage: result.cadet.attendancePercentage ?? 95,
        paradesAttended: result.cadet.paradesAttended ?? 38,
        totalParades: result.cadet.totalParades ?? 40,
        campsAttended: result.cadet.campsAttended || ['Annual Training Camp 2024'],
        certificates: result.cadet.certificates || ['BNCC Drill & Discipline Clearance'],
        status: result.cadet.status || 'Active',
      };

      setCurrentCadet(activeCadet);
      setIsLoggedIn(true);
      setPortalTab('directory');
      sessionStorage.setItem('ngdc_bncc_cadet_auth', 'true');
      sessionStorage.setItem('ngdc_bncc_cadet_data', JSON.stringify(activeCadet));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Cadet Registration via Form Builder fields
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // Extract values based on field IDs or labels
    const name = (
      regFormData['cr-1'] ||
      regFormData['Cadet Full Name'] ||
      regFormData['Full Name'] ||
      Object.entries(regFormData).find(([k]) => k.toLowerCase().includes('name'))?.[1] ||
      ''
    ).trim();

    const cadetNo = (
      regFormData['cr-5'] ||
      regFormData['College Roll / Student ID'] ||
      regFormData['College Roll'] ||
      regFormData['Cadet ID'] ||
      Object.entries(regFormData).find(([k]) => k.toLowerCase().includes('roll') || k.toLowerCase().includes('id'))?.[1] ||
      ''
    ).trim();

    const category = (
      regFormData['cr-2'] ||
      regFormData['Platoon Category'] ||
      'Male Platoon'
    ) as PlatoonCategory;

    const gender = (
      regFormData['cr-3'] ||
      regFormData['Gender'] ||
      (category === 'Female Platoon' ? 'Female' : 'Male')
    ) as 'Male' | 'Female';

    const rank = (
      regFormData['cr-4'] ||
      regFormData['Cadet Rank / Desired Rank'] ||
      'Cadet (CDT)'
    );

    const department = (
      regFormData['cr-6'] ||
      regFormData['Department / Group'] ||
      regFormData['Department'] ||
      'Dept. of Physics'
    );

    const batch = (
      regFormData['cr-7'] ||
      regFormData['Batch / Enrolment Session'] ||
      regFormData['Cadet Batch'] ||
      'Batch 24'
    );

    const bloodGroup = (
      regFormData['cr-8'] ||
      regFormData['Blood Group'] ||
      'B+'
    );

    const phone = (
      regFormData['cr-9'] ||
      regFormData['Contact Mobile Number'] ||
      regFormData['Phone'] ||
      ''
    );

    const email = (
      regFormData['cr-10'] ||
      regFormData['Email Address'] ||
      ''
    );

    const section = (
      regFormData['cr-11'] ||
      regFormData['Section Preference / Designation'] ||
      (category === 'Band Platoon' ? 'Band Section 01' : 'Section 01')
    );

    if (!name) {
      setRegError('Please enter your full name.');
      return;
    }

    if (!cadetNo) {
      setRegError('Please enter your College Roll or Student ID.');
      return;
    }

    const formattedId = cadetNo.toUpperCase().startsWith('NGDC')
      ? cadetNo.toUpperCase()
      : `NGDC-2024-${cadetNo.toUpperCase()}`;

    // Submit to Admin context as pending applicant
    const result = cadetRegister({
      name,
      cadetNo: formattedId,
      category,
      gender,
      rank,
      department,
      batch,
      bloodGroup,
      phone,
      email,
      section,
      status: 'Pending Approval',
      isApproved: false,
    });

    if (!result.success) {
      setRegError(result.message);
      return;
    }

    // Set receipt for user feedback
    setSubmittedReceipt({
      id: result.cadet?.id || `appl-${Date.now()}`,
      name,
      category,
      cadetNo: formattedId,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    cadetLogout();
    sessionStorage.removeItem('ngdc_bncc_cadet_auth');
    sessionStorage.removeItem('ngdc_bncc_cadet_data');
    setAuthTab('login');
    setLoginCadetId('');
    setLoginPassword('');
    setLoginError('');
    setLoginInfoMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Peer Lookup inside portal
  const handlePeerLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchCadetNo.trim().toUpperCase();
    if (!query) return;
    const found = cadetUsers.find(
      (c) =>
        (c.cadetNo && c.cadetNo.trim().toUpperCase() === query) ||
        (c.collegeId && c.collegeId.trim().toUpperCase() === query) ||
        (c.id && c.id.trim().toUpperCase() === query)
    );
    if (found) {
      setSearchedCadet(found as any);
      setLookupMessage('');
    } else {
      setSearchedCadet(null);
      setLookupMessage(`No verified record found for "${query}". Enter a valid Cadet Number (e.g., NGDC-2024-001) or College Roll.`);
    }
  };

  const handleDownloadManual = (name: string) => {
    setDownloadedManual(name);
    setTimeout(() => {
      setDownloadedManual(null);
    }, 3500);
  };

  return (
    <div className="space-y-12 max-w-[1120px] mx-auto px-4 w-full">
      {/* =========================================================================
          VIEW 1: UNAUTHENTICATED STATE - LOGIN & REGISTER ONLY (DIRECTORY IS LOCKED)
          ========================================================================= */}
      {!isLoggedIn ? (
        <div className={`mx-auto space-y-8 py-2 ${authTab === 'login' ? 'max-w-xl' : 'max-w-4xl'}`}>
          {/* Header Banner */}
          <motion.section
            variants={framerSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewportConfig}
            className="bg-[#f6f3ed] dark:bg-[#1e1d19] p-8 md:p-10 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-sm text-center"
          >
            <motion.span variants={framerPopItemVariants} className="inline-block px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider mb-3">
              Restricted Cadet Portal
            </motion.span>
            <motion.h1 variants={framerPopItemVariants} className="text-3xl md:text-4xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
              Cadets Corner
            </motion.h1>
            <motion.p variants={framerPopItemVariants} className="text-sm md:text-base text-[#4a4738] dark:text-[#aca596] max-w-lg mx-auto mt-2 leading-relaxed">
              Official portal for enrolled cadets. Please log in with your Cadet No. and Password to access the full Cadets Directory, your digital ID pass, platoon attendance, and training resources.
            </motion.p>
            <motion.div variants={framerPopItemVariants} className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#1c1c18] hover:bg-[#33312b] dark:hover:bg-[#e3d176] px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#eedc82] dark:text-[#1c1c18]" />
                <span>Verify Cadet (Public Search)</span>
              </button>
            </motion.div>
          </motion.section>

          {/* Navigation Bar: Login vs Register (Directory only available after login) */}
          <div className="flex bg-[#f6f3ed] dark:bg-[#191815] p-1.5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] max-w-md mx-auto">
            <button
              id="tab-cadet-login"
              type="button"
              onClick={() => {
                setAuthTab('login');
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authTab === 'login'
                  ? 'bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#141311] shadow-xs'
                  : 'text-[#504537] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>1. Cadet Login</span>
            </button>

            <button
              id="tab-cadet-register"
              type="button"
              onClick={() => {
                setAuthTab('register');
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authTab === 'register'
                  ? 'bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#141311] shadow-xs'
                  : 'text-[#504537] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>2. Cadet Registration</span>
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {authTab === 'login' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="japandi-card p-6 sm:p-8 bg-[#fcf9f3] dark:bg-[#23211c] border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-sm rounded-3xl space-y-6"
            >
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {loginInfoMessage && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-medium flex items-start gap-2.5">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1">
                      <p className="font-bold">Application Status</p>
                      <p className="text-[11px] leading-relaxed opacity-90">{loginInfoMessage}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                    Cadet Registration ID / Cadet No. (Login ID)
                  </label>
                  <div className="relative">
                    <input
                      id="input-login-cadet-id"
                      type="text"
                      value={loginCadetId}
                      onChange={(e) => setLoginCadetId(e.target.value)}
                      placeholder="e.g. NGDC-M-101 or 204"
                      className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] px-4 py-2.5 rounded-full outline-none font-mono text-xs sm:text-sm text-[#1c1c18] dark:text-[#fcfbf7] uppercase tracking-wider transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 pl-1">
                    <label className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                      Portal Access Password
                    </label>
                    <span className="text-[10px] text-[#7c7767] dark:text-[#aca596]">
                      Created during registration
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your login password"
                      className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] px-4 py-2.5 rounded-full outline-none text-xs sm:text-sm text-[#1c1c18] dark:text-[#fcfbf7] transition-all"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-cadet-login"
                  type="submit"
                  className="japandi-btn-primary w-full py-3 text-xs md:text-sm mt-2 cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Cadet Portal</span>
                </button>
              </form>

              {/* Locked Directory Info notice */}
              <div className="p-3.5 bg-[#f6f3ed] dark:bg-[#191815] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] flex items-start gap-2.5 text-xs text-[#5c5746] dark:text-[#aca596]">
                <Shield className="w-4 h-4 shrink-0 text-[#6b5e10] dark:text-[#eedc82] mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Cadets Directory Access
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    The official Platoon Roster & Cadets Directory are restricted. Once logged in with your Cadet No. and Password, you will have complete access to the directory, rank hierarchy, and platoon records.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: REGISTRATION FORM (CURRENTLY SERVING & EX-CADETS) */}
          {authTab === 'register' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CadetRegistrationForm
                isAdmin={false}
                onGoToLogin={(cadetId) => {
                  setAuthTab('login');
                  if (cadetId) setLoginCadetId(cadetId);
                }}
              />
            </motion.div>
          )}
        </div>
      ) : (
        /* =========================================================================
           VIEW 2: AUTHENTICATED CADET PORTAL (VISIBLE ONLY WHEN LOGGED IN)
           ========================================================================= */
        <div className="space-y-12 animate-fadeIn">
          {/* Active Session Status Bar - exact Contact Us header style */}
          <motion.section
            variants={framerSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewportConfig}
            className="bg-[#f6f3ed] dark:bg-[#1e1d19] p-6 md:p-8 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-colors"
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-[#eedc82]/50 dark:bg-[#eedc82]/20 border border-[#6b5e10]/20 dark:border-[#eedc82]/30 flex items-center justify-center shrink-0">
                <Shield className="w-8 h-8 text-[#6b5e10] dark:text-[#eedc82]" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-xs font-mono font-bold bg-[#1c1c18] dark:bg-black text-white px-2.5 py-0.5 rounded-full">
                    {currentCadet?.cadetNo || 'NGDC'}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300/40 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" /> Authenticated Cadet
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
                  Welcome, {currentCadet?.name || 'Cadet'}
                </h1>
                <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596]">
                  {currentCadet?.rank || 'Cadet'} • {currentCadet?.platoon || 'Platoon'} • {currentCadet?.department || ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                id="btn-cadet-logout"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-[#fcf9f3] dark:bg-[#23211c] text-[#1c1c18] dark:text-[#fcfbf7] hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 border border-[#cdc6b3]/60 dark:border-[#423e35] px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out & Lock Portal</span>
              </button>
            </div>
          </motion.section>

          {/* Subtab Navigation inside authenticated cadet portal */}
          <div className="flex bg-[#f6f3ed] dark:bg-[#191815] p-1.5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] max-w-2xl mx-auto w-full">
            <button
              type="button"
              onClick={() => setPortalTab('directory')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                portalTab === 'directory'
                  ? 'bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#141311] shadow-xs'
                  : 'text-[#504537] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Cadets Directory</span>
            </button>

            <button
              type="button"
              onClick={() => setPortalTab('profile')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                portalTab === 'profile'
                  ? 'bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#141311] shadow-xs'
                  : 'text-[#504537] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setPortalTab('manuals')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                portalTab === 'manuals'
                  ? 'bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#141311] shadow-xs'
                  : 'text-[#504537] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Training Manuals</span>
            </button>
          </div>

          {/* PORTAL TAB: DIRECTORY */}
          {portalTab === 'directory' && (
            <CadetDirectoryView isCadetLoggedIn={true} />
          )}

          {/* PORTAL TAB: MY PROFILE */}
          {portalTab === 'profile' && (
            <>
          {/* Profile Edit & Approval Request Section */}
          <motion.section
            variants={framerSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewportConfig}
            className="bg-[#fcf9f3] dark:bg-[#23211c] p-6 md:p-10 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-sm space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cdc6b3]/40 dark:border-[#423e35] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>My Profile & Account Details</span>
                </h2>
                <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                  Update your contact details, department, rank, or password. Any changes require Platoon Admin approval before reflecting in the cadet directory.
                </p>
              </div>

              {pendingProfileUpdates.some(
                (r) =>
                  r.status === 'pending' &&
                  ((r.cadetNo && currentCadet?.cadetNo && r.cadetNo.trim().toUpperCase() === currentCadet.cadetNo.trim().toUpperCase()) ||
                   (r.cadetId && currentCadet?.id && r.cadetId === currentCadet.id))
              ) && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Update Request Pending Admin Approval</span>
                </span>
              )}
            </div>

            <div className="bg-[#fcf9f3] dark:bg-[#1a1916] rounded-2xl p-4 sm:p-6 border border-[#cdc6b3] dark:border-[#38342c]">
              <CadetRegistrationForm
                editingCadet={
                  (() => {
                    const match = cadetUsers.find(
                      (u) =>
                        (u.cadetNo && currentCadet?.cadetNo && u.cadetNo.trim().toUpperCase() === currentCadet.cadetNo.trim().toUpperCase()) ||
                        u.id === currentCadet?.id
                    );
                    return match ? { ...currentCadet, ...match } : currentCadet;
                  })()
                }
                isProfileUpdateMode={true}
              />
            </div>
          </motion.section>
          {/* 1. Attendance & Record Verification Engine */}
          <motion.section
            variants={framerSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewportConfig}
            className="bg-[#fcf9f3] dark:bg-[#23211c] p-6 md:p-10 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-sm space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cdc6b3]/40 dark:border-[#423e35] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Cadet Service Record & Attendance Status</span>
                </h2>
                <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596]">
                  Live drill logs and annual camp clearance verified by NGDC-BNCC platoon office.
                </p>
              </div>

              {/* Peer Verification Search */}
              <form onSubmit={handlePeerLookup} className="flex gap-2">
                <input
                  type="text"
                  value={searchCadetNo}
                  onChange={(e) => setSearchCadetNo(e.target.value)}
                  placeholder="Verify peer cadet ID..."
                  className="bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] text-[#1c1c18] dark:text-[#fcfbf7] px-4 py-2 rounded-full text-xs md:text-sm outline-none font-mono uppercase focus:border-[#1c1c18] dark:focus:border-[#eedc82]"
                />
                <button type="submit" className="japandi-btn-primary text-xs px-4 py-2 cursor-pointer">
                  <Search className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </button>
              </form>
            </div>

            {lookupMessage && (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 rounded-2xl text-xs font-medium">
                {lookupMessage}
              </div>
            )}

            {/* Display Active Cadet or Searched Peer */}
            {(() => {
              const displayCadet = searchedCadet || currentCadet;
              if (!displayCadet) {
                return null;
              }
              const camps = Array.isArray(displayCadet.campsAttended) ? displayCadet.campsAttended : [];
              const certs = Array.isArray(displayCadet.certificates) ? displayCadet.certificates : [];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  {/* Cadet Summary Info */}
                  <div className="bg-[#f6f3ed] dark:bg-[#1c1a16] p-6 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#3e3a30] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold bg-[#1c1c18] dark:bg-black text-white px-2.5 py-1 rounded-full">
                        {displayCadet.cadetNo || 'NGDC'}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                        {displayCadet.status || 'Active'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">{displayCadet.name || 'Cadet'}</h3>
                      <p className="text-xs font-semibold text-[#6b5e10] dark:text-[#eedc82]">{displayCadet.rank || 'Cadet'}</p>
                      <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-0.5">{displayCadet.department || ''}</p>
                    </div>

                    <div className="pt-2 border-t border-[#cdc6b3]/40 dark:border-[#423e35] space-y-1.5 text-xs text-[#4a4738] dark:text-[#d4cec1]">
                      <div className="flex justify-between">
                        <span className="text-[#7c7767] dark:text-[#aca596]">Platoon:</span>
                        <span className="font-semibold">{displayCadet.platoon || 'Platoon'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7c7767] dark:text-[#aca596]">Blood Group:</span>
                        <span className="font-semibold text-rose-700 dark:text-rose-400">{displayCadet.bloodGroup || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7c7767] dark:text-[#aca596]">Enrolled:</span>
                        <span>{displayCadet.joiningDate || 'Serving'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance & Progress */}
                  <div className="bg-[#f6f3ed] dark:bg-[#1c1a16] p-6 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#3e3a30] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">Parade Attendance Score</h4>
                      <span className="text-lg font-extrabold text-[#6b5e10] dark:text-[#eedc82]">
                        {displayCadet.attendancePercentage ?? 100}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#ebe8e2] dark:bg-[#2c2923] h-3.5 rounded-full overflow-hidden border border-[#cdc6b3]/40 dark:border-[#423e35]">
                      <div
                        className="bg-[#eedc82] dark:bg-[#eedc82] h-full rounded-full transition-all duration-700"
                        style={{ width: `${displayCadet.attendancePercentage ?? 100}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 bg-[#fcf9f3] dark:bg-[#23211c] rounded-xl border border-[#cdc6b3]/40 dark:border-[#423e35] text-center">
                        <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] block">Parades Attended</span>
                        <strong className="text-sm text-[#1c1c18] dark:text-[#fcfbf7]">{displayCadet.paradesAttended ?? 0} / {displayCadet.totalParades ?? 0}</strong>
                      </div>
                      <div className="p-3 bg-[#fcf9f3] dark:bg-[#23211c] rounded-xl border border-[#cdc6b3]/40 dark:border-[#423e35] text-center">
                        <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] block">Camp Clearance</span>
                        <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Qualified
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Accreditations & Camps */}
                  <div className="bg-[#f6f3ed] dark:bg-[#1c1a16] p-6 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#3e3a30] space-y-3">
                    <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Camps & Certificates</span>
                    </h4>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#7c7767] dark:text-[#aca596] block">Participated Camps:</span>
                      {camps.map((camp, idx) => (
                        <div key={idx} className="bg-[#fcf9f3] dark:bg-[#23211c] p-1.5 px-2.5 rounded-lg border border-[#cdc6b3]/30 dark:border-[#423e35] text-[11px] font-medium text-[#1c1c18] dark:text-[#fcfbf7]">
                          • {camp}
                        </div>
                      ))}
                      {camps.length === 0 && (
                        <p className="text-[11px] text-[#7c7767] italic">No camps recorded yet</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#cdc6b3]/40 dark:border-[#423e35] space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-[#7c7767] dark:text-[#aca596] block">Earned Badges:</span>
                      {certs.map((cert, idx) => (
                        <span key={idx} className="inline-block mr-1.5 mb-1 bg-[#eedc82]/50 dark:bg-[#eedc82]/20 text-[#6b5e10] dark:text-[#eedc82] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#eedc82]/40">
                          {cert}
                        </span>
                      ))}
                      {certs.length === 0 && (
                        <p className="text-[11px] text-[#7c7767] italic">Standard Enlistment</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.section>
          </>
          )}

          {/* 3. Downloadable Training Manuals & Syllabi */}
          {portalTab === 'manuals' && (
          <motion.section
            variants={framerSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewportConfig}
            className="bg-[#fcf9f3] dark:bg-[#23211c] p-6 md:p-10 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Training Handbooks & Syllabi Library</span>
              </h2>
              <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                Official study documents approved by BNCC Directorate for cadet examinations.
              </p>
            </div>

            {downloadedManual && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Successfully downloaded: <strong>{downloadedManual}</strong>.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(trainingManuals && trainingManuals.length > 0 ? trainingManuals : [
                { id: '1', title: 'Squad Drill & Parade Manual 2024', category: 'Drill', fileSize: '2.4 MB PDF', description: 'Step-by-step illustrations of foot drill, turns, pace length, and cane drill.', uploadedAt: '2024-01-01' },
                { id: '2', title: 'Map Reading & Navigation Handbook', category: 'Map Reading', fileSize: '4.1 MB PDF', description: 'Contour lines, grid references, compass error, and night patrol navigation.', uploadedAt: '2024-01-01' },
                { id: '3', title: 'BNCC Certificate ‘C’ Syllabus', category: 'General Studies', fileSize: '1.8 MB PDF', description: 'Comprehensive guide to weapon specs, military tactics, and defense law.', uploadedAt: '2024-01-01' },
                { id: '4', title: 'First Aid & Disaster Rescue Guide', category: 'General Studies', fileSize: '3.2 MB PDF', description: 'Triage protocols, CPR certification, burn management, and flood rescue.', uploadedAt: '2024-01-01' },
                { id: '5', title: 'Field Craft & Battle Craft (FC & BC)', category: 'Weapons & Tactics', fileSize: '2.9 MB PDF', description: 'Camouflage, concealment, field signals, and fire & movement tactics.', uploadedAt: '2024-01-01' },
                { id: '6', title: 'Cadet Code of Conduct & Honor Creed', category: 'Leadership', fileSize: '1.2 MB PDF', description: 'Essential ethics, saluting etiquette, and platoon accountability rules.', uploadedAt: '2024-01-01' },
              ]).map((manual) => (
                <div key={manual.id} className="p-5 bg-[#f6f3ed] dark:bg-[#1c1a16] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#3e3a30] space-y-3 flex flex-col justify-between hover:border-[#7c7767] dark:hover:border-[#eedc82]/50 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#7c7767] dark:text-[#aca596]">
                      <span className="font-mono text-[11px]">{manual.fileSize || 'PDF Document'}</span>
                      <span className="font-bold text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/30 dark:bg-[#eedc82]/20 px-2 py-0.5 rounded-full text-[10px]">{manual.category || 'Official'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">{manual.title}</h4>
                    <p className="text-xs text-[#4a4738] dark:text-[#d4cec1] leading-relaxed">{manual.description}</p>
                  </div>

                  {manual.fileUrl ? (
                    <a
                      href={manual.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="japandi-btn-secondary text-xs w-full py-2 bg-[#fcf9f3] dark:bg-[#23211c] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Download Manual</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => handleDownloadManual(manual.title)}
                      className="japandi-btn-secondary text-xs w-full py-2 bg-[#fcf9f3] dark:bg-[#23211c] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Download Manual</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
          )}

          {/* 4. Admin Custom Built Cadet Corner Modules & Special Pages */}
          {cadetCornerModules && cadetCornerModules.length > 0 && (
            <motion.section
              variants={framerSectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={scrollViewportConfig}
              className="space-y-6"
            >
              {cadetCornerModules.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-[#fcf9f3] dark:bg-[#23211c] p-6 md:p-10 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      {mod.badge && (
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-[#eedc82] text-[#1c1c18] px-3 py-0.5 rounded-full inline-block">
                          {mod.badge}
                        </span>
                      )}
                      <h3 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] mt-1">
                        {mod.title}
                      </h3>
                    </div>
                    {mod.externalUrl && (
                      <a
                        href={mod.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="japandi-btn-secondary text-xs shrink-0 inline-flex items-center gap-1.5"
                      >
                        <span>Open Resource Link</span>
                      </a>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-[#4a4738] dark:text-[#aca596] leading-relaxed whitespace-pre-line">
                    {mod.content}
                  </div>
                </div>
              ))}
            </motion.section>
          )}
        </div>
      )}

      {/* Public Cadet Verification Modal */}
      <CadetVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />
    </div>
  );
};
