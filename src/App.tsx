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
const AdminLogin = React.lazy(() => import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin })));
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

export default function App() {
  // Connect to real-time Server-Sent Events (SSE) so all changes reflect instantly across all devices
  useRealtimeSync();

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
  type AppRoute = 'public' | 'admin-login' | 'admin-dashboard';

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

    return 'public';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getAppRoute);

  useEffect(() => {
    const handleRouteSync = () => {
      setCurrentRoute(getAppRoute());
    };
    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
    };
  }, []);

  // Dynamic SEO Page Title & Meta Tag Synchronization
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let title = 'NGDC-BNCC Platoon Portal | New Govt. Degree College, Rajshahi';
    let desc = 'Official portal of the Bangladesh National Cadet Corps (BNCC) at New Govt. Degree College, Rajshahi. Fostering Knowledge & Discipline.';

    if (currentRoute === 'admin-login') {
      title = 'Command Console Login | NGDC BNCC Platoon';
      desc = 'Secure Administrative Login Console for NGDC BNCC Platoon Officers & Admins.';
    } else if (currentRoute === 'admin-dashboard') {
      title = 'Command Console Dashboard | NGDC BNCC Platoon';
      desc = 'Administrative Management Console for Cadet Roster, Recruitment Applications, and Site Operations.';
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
  }, [currentRoute]);

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
  );
}
