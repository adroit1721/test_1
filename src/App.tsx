/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { TabType, NoticeItem, BlogItem, MemoryItem } from './types';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { TopographicBackground } from './components/TopographicBackground';
import { safeStorage } from './utils/safeStorage';

const AboutView = React.lazy(() => import('./components/AboutView').then((m) => ({ default: m.AboutView })));
const TrainingEventsView = React.lazy(() => import('./components/TrainingEventsView').then((m) => ({ default: m.TrainingEventsView })));
const NoticeBlogsView = React.lazy(() => import('./components/NoticeBlogsView').then((m) => ({ default: m.NoticeBlogsView })));
const MemoriesView = React.lazy(() => import('./components/MemoriesView').then((m) => ({ default: m.MemoriesView })));
const CadetsCornerView = React.lazy(() => import('./components/CadetsCornerView').then((m) => ({ default: m.CadetsCornerView })));
const HonorBoardView = React.lazy(() => import('./components/HonorBoardView').then((m) => ({ default: m.HonorBoardView })));
const ContactView = React.lazy(() => import('./components/ContactView').then((m) => ({ default: m.ContactView })));
const RecruitmentView = React.lazy(() => import('./components/RecruitmentView').then((m) => ({ default: m.RecruitmentView })));
const AdminView = React.lazy(() => import('./components/admin/AdminView').then((m) => ({ default: m.AdminView })));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin').then((m) => ({ default: m.default || m.AdminLogin })));
const OfficerLogin = React.lazy(() => import('./pages/OfficerLogin').then((m) => ({ default: m.OfficerLogin })));
const OfficerInspectorView = React.lazy(() => import('./components/officer/OfficerInspectorView').then((m) => ({ default: m.OfficerInspectorView })));
import {
  NoticeDetailModal,
  BlogReaderModal,
  MemoryLightboxModal,
  JoinRecruitmentModal,
  CadetAuthModal,
  UniformGuideModal,
} from './components/Modals';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { useAdminData } from './context/AdminDataContext';
import { MaintenanceBanner } from './components/maintenance/MaintenanceBanner';
import { MaintenanceLockdown } from './components/maintenance/MaintenanceLockdown';
import { AdminMaintenanceBar } from './components/maintenance/AdminMaintenanceBar';
import { InitialSiteLoader } from './components/InitialSiteLoader';

export default function App() {
  // Connect to real-time Server-Sent Events (SSE) so all changes reflect instantly across all devices
  useRealtimeSync();

  // Initial loading screen state (restricting to once per session)
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return safeStorage.getSessionItem('ngdc_bncc_portal_loaded') !== 'true';
      }
    } catch {}
    return true;
  });

  const { activeTab, setActiveTab, selectedNotice, setSelectedNotice, selectedBlog, setSelectedBlog, selectedMemory, setSelectedMemory } = useAppStore(
    useShallow(state => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
      selectedNotice: state.selectedNotice,
      setSelectedNotice: state.setSelectedNotice,
      selectedBlog: state.selectedBlog,
      setSelectedBlog: state.setSelectedBlog,
      selectedMemory: state.selectedMemory,
      setSelectedMemory: state.setSelectedMemory,
    }))
  );

  // Admin authentication state from store
  const { isAdminAuthenticated, setIsAdminAuthenticated, validateAdminToken } = useAppStore(
    useShallow(state => ({
      isAdminAuthenticated: state.isAdminAuthenticated,
      setIsAdminAuthenticated: state.setIsAdminAuthenticated,
      validateAdminToken: state.validateAdminToken,
    }))
  );

  // Officer / Teacher Inspector Authentication State
  const [isOfficerAuthenticated, setIsOfficerAuthenticated] = useState<boolean>(() => {
    return safeStorage.getItem('ngdc_officer_session') === 'active';
  });

  // Operational Site Maintenance & Notice Hub from AdminDataContext
  const {
    maintenanceConfig,
    adminPreviewMode,
    setAdminPreviewMode,
  } = useAdminData();

  // Default light theme (dark mode button removed)
  const isDarkMode = false;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      safeStorage.removeItem('ngdc_bncc_theme');
    }
  }, []);

  // Modals state from store
  const { isJoinModalOpen, setJoinModalOpen, isCadetAuthOpen, setCadetAuthOpen, isUniformModalOpen, setUniformModalOpen, isAdminLoginOpen, setAdminLoginOpen, showLegalModal, setShowLegalModal, showBackToTop, setShowBackToTop } = useAppStore(
    useShallow(state => ({
      isJoinModalOpen: state.isJoinModalOpen,
      setJoinModalOpen: state.setJoinModalOpen,
      isCadetAuthOpen: state.isCadetAuthOpen,
      setCadetAuthOpen: state.setCadetAuthOpen,
      isUniformModalOpen: state.isUniformModalOpen,
      setUniformModalOpen: state.setUniformModalOpen,
      isAdminLoginOpen: state.isAdminLoginOpen,
      setAdminLoginOpen: state.setAdminLoginOpen,
      showLegalModal: state.showLegalModal,
      setShowLegalModal: state.setShowLegalModal,
      showBackToTop: state.showBackToTop,
      setShowBackToTop: state.setShowBackToTop,
    }))
  );
  const [cadetAuthMode, setCadetAuthMode] = useState<'login' | 'register'>('login');

  // Route synchronization supporting both HTML5 browser paths and SPA hash-route fallbacks
  type AppRoute = 'public' | 'admin-login' | 'admin-dashboard' | 'officer-login' | 'officer-dashboard';

  const getAppRoute = (): AppRoute => {
    if (typeof window === 'undefined') return 'public';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (
      path === '/ngdc_bncc_admin/login' ||
      path.startsWith('/ngdc_bncc_admin/login') ||
      hash.includes('/ngdc_bncc_admin/login') ||
      hash === '#/login'
    ) {
      return 'admin-login';
    }

    if (
      path === '/ngdc_bncc_admin' ||
      path.startsWith('/ngdc_bncc_admin') ||
      hash.includes('/ngdc_bncc_admin') ||
      hash === '#/admin'
    ) {
      return 'admin-dashboard';
    }

    if (
      path === '/officer/login' ||
      path.startsWith('/officer/login') ||
      hash.includes('/officer/login') ||
      hash === '#/officer/login'
    ) {
      return 'officer-login';
    }

    if (
      path === '/officer' ||
      path.startsWith('/officer') ||
      hash.includes('/officer') ||
      hash === '#/officer' ||
      path === '/officer-portal'
    ) {
      return 'officer-dashboard';
    }

    return 'public';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getAppRoute);

  useEffect(() => {
    const handleRouteSync = () => {
      setCurrentRoute(getAppRoute());
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/ngdc_bncc_admin')) {
        const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
        if (path === '/recruitment' || path === '/join') setActiveTab('recruitment');
        else if (path === '/notices' || path === '/notice') setActiveTab('notices');
        else if (path === '/cadets' || path === '/cadet') setActiveTab('cadets');
        else if (path === '/about') setActiveTab('about');
        else if (path === '/training' || path === '/events') setActiveTab('training');
        else if (path === '/contact') setActiveTab('contact');
        else if (path === '/gallery' || path === '/memories' || path === '/blog') setActiveTab('memories');
        else if (path === '/honor' || path === '/honor-board') setActiveTab('honor');
        else if (path === '' || path === '/') setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
    };
  }, [setActiveTab]);

  // Dynamic SEO Page Title & Meta Tag Synchronization
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let title = 'BNCC | New Govt. Degree College, Rajshahi | NGDC BNCC Platoon Official';
    let desc = 'Official Portal of BNCC (Bangladesh National Cadet Corps) at New Govt. Degree College, Rajshahi (NGDC). Access Cadet Recruitment, Notices, Events, Ranks & Gallery.';
    let canonical = 'https://ngdcbncc.org/';

    if (currentRoute === 'admin-login') {
      title = 'Command Console Login | NGDC BNCC Platoon';
      desc = 'Secure Administrative Login Console for NGDC BNCC Platoon Officers & Admins.';
      canonical = 'https://ngdcbncc.org/ngdc_bncc_admin/login';
    } else if (currentRoute === 'admin-dashboard') {
      title = 'Command Console Dashboard | NGDC BNCC Platoon';
      desc = 'Administrative Management Console for Cadet Roster, Recruitment Applications, and Site Operations.';
      canonical = 'https://ngdcbncc.org/ngdc_bncc_admin';
    } else if (currentRoute === 'officer-login') {
      title = 'Officer & Teacher Portal Login | NGDC BNCC Platoon';
      desc = 'Executive Read-Only Inspector Login Console for BNCC Officers (BNCCO), Platoon Under Officers (PUO), & College Faculty.';
      canonical = 'https://ngdcbncc.org/officer/login';
    } else if (currentRoute === 'officer-dashboard') {
      title = 'Executive Officer Console | NGDC BNCC Platoon';
      desc = 'Read-Only Inspection Dashboard for Cadet Directory Roster and Recruitment Applications.';
      canonical = 'https://ngdcbncc.org/officer';
    } else {
      if (activeTab === 'recruitment') {
        title = 'Cadet Recruitment & Admission Circular | NGDC BNCC Platoon';
        desc = 'Official BNCC Cadet Recruitment Circular & Application Form at New Govt. Degree College, Rajshahi. Join the elite Army Wing platoon.';
        canonical = 'https://ngdcbncc.org/recruitment';
      } else if (activeTab === 'notices') {
        title = 'Official Notices & Circulars | NGDC BNCC Platoon';
        desc = 'Latest BNCC notices, order of the day, parade announcements, and circulars from New Govt. Degree College, Rajshahi.';
        canonical = 'https://ngdcbncc.org/notices';
      } else if (activeTab === 'cadets') {
        title = 'Cadet Directory & Rank Roster | NGDC BNCC Platoon';
        desc = 'Active cadet directory, rank hierarchy, Platoon Under Officer (PUO) profile, and cadet roster of NGDC BNCC Platoon.';
        canonical = 'https://ngdcbncc.org/cadets';
      } else if (activeTab === 'about') {
        title = 'About NGDC BNCC Platoon | History, PUO & College';
        desc = 'Learn about the Bangladesh National Cadet Corps (BNCC) unit at New Govt. Degree College, Rajshahi. Fostering Knowledge, Discipline & Leadership.';
        canonical = 'https://ngdcbncc.org/about';
      } else if (activeTab === 'training') {
        title = 'Training & Events Schedule | NGDC BNCC Platoon';
        desc = 'Annual military training, drill practice, firing camps, national day parades, and social service activities of NGDC BNCC Platoon.';
        canonical = 'https://ngdcbncc.org/training';
      } else if (activeTab === 'contact') {
        title = 'Contact Platoon HQ | New Govt. Degree College, Rajshahi';
        desc = 'Contact NGDC BNCC Platoon HQ at New Govt. Degree College, Rajshahi. Get address, phone, email, and location map.';
        canonical = 'https://ngdcbncc.org/contact';
      } else if (activeTab === 'memories') {
        title = 'Photo Gallery & Cadet Memories | NGDC BNCC Platoon';
        desc = 'Photo & video gallery, cadet memories, achievements, and event highlights of NGDC BNCC Platoon, Rajshahi.';
        canonical = 'https://ngdcbncc.org/gallery';
      } else if (activeTab === 'honor') {
        title = 'Honor Board & Roll of Distinction | NGDC BNCC Platoon';
        desc = 'Roll of honor, distinguished former cadets, PUOs, and award winners of NGDC BNCC Platoon.';
        canonical = 'https://ngdcbncc.org/honor';
      }
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonical);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }
  }, [currentRoute, activeTab]);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentRoute(getAppRoute());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Monitor scroll for back-to-top floating button (updates store)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenCadetLogin = () => {
    setCadetAuthMode('login');
    setActiveTab('cadets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCadetRegister = () => {
    setCadetAuthMode('register');
    setActiveTab('cadets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route 1: Dedicated Officer Authentication Console (/ngdc_bncc_admin/login)
  if (currentRoute === 'admin-login') {
    if (isAdminAuthenticated) {
      return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Admin Portal...</div>}>
          <AdminView
            onLogout={() => {
              safeStorage.removeSessionItem('ngdc_admin_auth');
              safeStorage.removeItem('ngdc_admin_jwt_token');
              setIsAdminAuthenticated(false);
              navigateTo('/');
            }}
            onViewPublicSite={() => {
              navigateTo('/');
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => {}}
          />
        </React.Suspense>
      );
    }
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Officer Console...</div>}>
        <AdminLogin
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            navigateTo('/ngdc_bncc_admin');
          }}
          onReturnToPublic={() => {
            navigateTo('/');
          }}
        />
      </React.Suspense>
    );
  }

  // Route 2: Dedicated Admin Workspace (/ngdc_bncc_admin)
  if (currentRoute === 'admin-dashboard') {
    if (!isAdminAuthenticated) {
      return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Officer Console...</div>}>
          <AdminLogin
            onSuccess={() => {
              setIsAdminAuthenticated(true);
              navigateTo('/ngdc_bncc_admin');
            }}
            onReturnToPublic={() => {
              navigateTo('/');
            }}
          />
        </React.Suspense>
      );
    }
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Admin Portal...</div>}>
        <AdminView
          onLogout={() => {
            safeStorage.removeSessionItem('ngdc_admin_auth');
            safeStorage.removeItem('ngdc_admin_jwt_token');
            setIsAdminAuthenticated(false);
            navigateTo('/');
          }}
          onViewPublicSite={() => {
            navigateTo('/');
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => {}}
        />
      </React.Suspense>
    );
  }

  // Route 3: Dedicated Executive Officer Login (/officer/login)
  if (currentRoute === 'officer-login') {
    if (isOfficerAuthenticated) {
      return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Officer Portal...</div>}>
          <OfficerInspectorView
            onLogout={() => {
              safeStorage.removeItem('ngdc_officer_session');
              safeStorage.removeItem('ngdc_officer_role');
              setIsOfficerAuthenticated(false);
              navigateTo('/');
            }}
            onNavigateHome={() => navigateTo('/')}
          />
        </React.Suspense>
      );
    }
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Officer Login...</div>}>
        <OfficerLogin
          onLoginSuccess={() => {
            setIsOfficerAuthenticated(true);
            navigateTo('/officer');
          }}
          onNavigateHome={() => navigateTo('/')}
        />
      </React.Suspense>
    );
  }

  // Route 4: Dedicated Executive Officer Inspector Dashboard (/officer)
  if (currentRoute === 'officer-dashboard') {
    if (!isOfficerAuthenticated) {
      return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Officer Login...</div>}>
          <OfficerLogin
            onLoginSuccess={() => {
              setIsOfficerAuthenticated(true);
              navigateTo('/officer');
            }}
            onNavigateHome={() => navigateTo('/')}
          />
        </React.Suspense>
      );
    }
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Officer Portal...</div>}>
        <OfficerInspectorView
          onLogout={() => {
            safeStorage.removeItem('ngdc_officer_session');
            safeStorage.removeItem('ngdc_officer_role');
            setIsOfficerAuthenticated(false);
            navigateTo('/');
          }}
          onNavigateHome={() => navigateTo('/')}
        />
      </React.Suspense>
    );
  }

  // If Admin is Authenticated in public view and user returned to admin
  if (isAdminAuthenticated && currentRoute !== 'public') {
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcf9f3] text-sm text-[#57534e]">Loading Admin Portal...</div>}>
        <AdminView
          onLogout={() => {
            safeStorage.removeSessionItem('ngdc_admin_auth');
            safeStorage.removeItem('ngdc_admin_jwt_token');
            setIsAdminAuthenticated(false);
            navigateTo('/');
          }}
          onViewPublicSite={() => {
            navigateTo('/');
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => {}}
        />
      </React.Suspense>
    );
  }

  // Dual Operational Modes: Mode B (Full Portal Lockdown) or Admin Previewing Lockdown
  const isLockdownActive = maintenanceConfig.mode === 'lockdown';
  const isPreviewingLockdown = adminPreviewMode === 'lockdown';

  if (isPreviewingLockdown || (isLockdownActive && !isAdminAuthenticated)) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        {isAdminAuthenticated && (
          <AdminMaintenanceBar
            onOpenMaintenanceSettings={() => navigateTo('/ngdc_bncc_admin')}
            onExitPreview={() => setAdminPreviewMode('none')}
          />
        )}
        <MaintenanceLockdown
          config={maintenanceConfig}
          isAdminAuthenticated={isAdminAuthenticated}
          isPreview={isPreviewingLockdown}
          onExitPreview={() => setAdminPreviewMode('none')}
          onOfficerBypass={() => {
            if (isAdminAuthenticated) {
              navigateTo('/ngdc_bncc_admin');
            } else {
              navigateTo('/ngdc_bncc_admin/login');
            }
          }}
        />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isInitialLoading && (
          <InitialSiteLoader
            onComplete={() => {
              try {
                if (typeof window !== 'undefined') {
                  safeStorage.setSessionItem('ngdc_bncc_portal_loaded', 'true');
                }
              } catch {}
              setIsInitialLoading(false);
            }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col font-sans selection:bg-[#eedc82] selection:text-[#1c1c18] bg-[#fcf9f3] text-[#1c1c18] relative">
      {/* Sticky Admin Notice Bar allowing instant deactivation or live preview from any page */}
      {isAdminAuthenticated && (
        <AdminMaintenanceBar
          onOpenMaintenanceSettings={() => navigateTo('/ngdc_bncc_admin')}
          onPreviewPublicLockdown={() => setAdminPreviewMode('lockdown')}
        />
      )}

      {/* Dual Operational Modes: Mode A (Announcement Warning Banner - Non-blocking) */}
      {(maintenanceConfig.mode === 'banner' || adminPreviewMode === 'banner') && (
        <MaintenanceBanner
          config={maintenanceConfig}
          onNavigateAction={(dest) => {
            const tab = dest.replace(/^#/, '');
            if (['home', 'about', 'training', 'notices', 'memories', 'cadets', 'honor', 'contact', 'recruitment'].includes(tab)) {
              setActiveTab(tab as any);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* Topographic Contours Background */}
      <TopographicBackground isDarkMode={false} />

      {/* Top Header with 2 Side Logos & Centered College Text */}
      <Header
        onNavigateHome={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Parallax Sticky Navigation Menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenJoinModal={() => {
          setActiveTab('recruitment');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area with Page Motion Animation */}
      <main className="flex-grow pb-12">
        <React.Suspense
          fallback={
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-[#1b4332] border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Loading...</p>
            </div>
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'home' && (
                <HomeView
                  setActiveTab={setActiveTab}
                  onSelectNotice={(notice) => setSelectedNotice(notice)}
                  onSelectBlog={(blog) => setSelectedBlog(blog)}
                  onSelectMemory={(memory) => setSelectedMemory(memory)}
                  onOpenCadetLogin={handleOpenCadetLogin}
                  onOpenCadetRegister={handleOpenCadetRegister}
                />
              )}

              {activeTab === 'about' && (
                <AboutView
                  onOpenJoinModal={() => {
                    setActiveTab('recruitment');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeTab === 'recruitment' && (
                <RecruitmentView setActiveTab={setActiveTab} />
              )}

              {activeTab === 'training' && <TrainingEventsView />}

              {activeTab === 'notices' && (
                <NoticeBlogsView
                  onSelectNotice={(notice) => setSelectedNotice(notice)}
                  onSelectBlog={(blog) => setSelectedBlog(blog)}
                />
              )}

              {activeTab === 'memories' && (
                <MemoriesView onSelectMemory={(memory) => setSelectedMemory(memory)} />
              )}

              {activeTab === 'cadets' && (
                <CadetsCornerView
                  key={cadetAuthMode}
                  initialAuthMode={cadetAuthMode}
                />
              )}

              {activeTab === 'honor' && <HonorBoardView />}

              {activeTab === 'contact' && <ContactView />}
            </motion.div>
          </AnimatePresence>
        </React.Suspense>
      </main>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="btn-back-to-top"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={scrollToTop}
            title="Scroll to Top"
            className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#eedc82] dark:bg-[#eedc82] text-[#1c1c18] shadow-lg border border-[#d5c470] flex items-center justify-center cursor-pointer transition-shadow hover:shadow-xl"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenAdminLogin={() => {
          if (isAdminAuthenticated || safeStorage.getSessionItem('ngdc_admin_auth') === 'true') {
            setIsAdminAuthenticated(true);
            navigateTo('/ngdc_bncc_admin');
          } else {
            navigateTo('/ngdc_bncc_admin/login');
          }
        }}
        onOpenPrivacyModal={() => setShowLegalModal('Privacy Policy')}
        onOpenTermsModal={() => setShowLegalModal('Terms of Service')}
      />

      {/* Floating Shortcut to Return to Admin Panel if authenticated in session */}
      {safeStorage.getSessionItem('ngdc_admin_auth') === 'true' && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            id="btn-return-admin-floating"
            onClick={() => {
              setIsAdminAuthenticated(true);
              navigateTo('/ngdc_bncc_admin');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c1c18] dark:bg-[#eedc82] text-white dark:text-[#1c1c18] rounded-full shadow-lg border border-[#eedc82]/50 text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Return to Admin Panel</span>
          </button>
        </div>
      )}

      {/* Interactive Modals */}
      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      <BlogReaderModal
        blog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
      />

      <MemoryLightboxModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />

      <JoinRecruitmentModal
        isOpen={isJoinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />

      <CadetAuthModal
        isOpen={isCadetAuthOpen}
        initialMode={cadetAuthMode}
        onClose={() => setCadetAuthOpen(false)}
      />

      <UniformGuideModal
        isOpen={isUniformModalOpen}
        onClose={() => setUniformModalOpen(false)}
      />

      {/* Legal Dialog */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1c1c18]">{showLegalModal}</h3>
            <p className="text-xs text-[#4a4738] leading-relaxed">
              This digital portal is maintained by the NGDC BNCC Platoon under the jurisdiction of the Bangladesh National Cadet Corps Act 2016. Cadet data, parade attendance, and officer circulars are strictly handled for educational and training purposes.
            </p>
            <button
              onClick={() => setShowLegalModal(null)}
              className="japandi-btn-secondary text-xs w-full mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
