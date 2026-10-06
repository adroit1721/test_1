import { create } from 'zustand';
import { TabType, NoticeItem, BlogItem, MemoryItem } from '../types';

interface AppState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedNotice: NoticeItem | null;
  setSelectedNotice: (notice: NoticeItem | null) => void;
  selectedBlog: BlogItem | null;
  setSelectedBlog: (blog: BlogItem | null) => void;
  selectedMemory: MemoryItem | null;
  setSelectedMemory: (memory: MemoryItem | null) => void;

  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (authenticated: boolean) => void;
  validateAdminToken: () => boolean;

  isJoinModalOpen: boolean;
  setJoinModalOpen: (open: boolean) => void;
  isCadetAuthOpen: boolean;
  setCadetAuthOpen: (open: boolean) => void;
  isUniformModalOpen: boolean;
  setUniformModalOpen: (open: boolean) => void;
  isAdminLoginOpen: boolean;
  setAdminLoginOpen: (open: boolean) => void;
  showLegalModal: boolean | string;
  setShowLegalModal: (show: boolean | string) => void;
  showBackToTop: boolean;
  setShowBackToTop: (show: boolean) => void;
}

const getInitialTab = (): TabType => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  if (path === '/recruitment' || path === '/join') return 'recruitment';
  if (path === '/notices' || path === '/notice') return 'notices';
  if (path === '/cadets' || path === '/cadet') return 'cadets';
  if (path === '/about') return 'about';
  if (path === '/training' || path === '/events') return 'training';
  if (path === '/contact') return 'contact';
  if (path === '/gallery' || path === '/memories' || path === '/blog') return 'memories';
  if (path === '/honor' || path === '/honor-board') return 'honor';
  return 'home';
};

const getPathForTab = (tab: TabType): string => {
  if (tab === 'recruitment') return '/recruitment';
  if (tab === 'notices') return '/notices';
  if (tab === 'cadets') return '/cadets';
  if (tab === 'about') return '/about';
  if (tab === 'training') return '/training';
  if (tab === 'contact') return '/contact';
  if (tab === 'memories') return '/gallery';
  if (tab === 'honor') return '/honor';
  return '/';
};

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: getInitialTab(),
  setActiveTab: (tab) => {
    set({ activeTab: tab });
    if (typeof window !== 'undefined') {
      const newPath = getPathForTab(tab);
      const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const targetPath = newPath === '/' ? '' : newPath.toLowerCase();
      if (!window.location.pathname.startsWith('/ngdc_bncc_admin') && currentPath !== targetPath) {
        window.history.pushState({}, '', newPath);
      }
    }
  },
  selectedNotice: null,
  setSelectedNotice: (notice) => set({ selectedNotice: notice }),
  selectedBlog: null,
  setSelectedBlog: (blog) => set({ selectedBlog: blog }),
  selectedMemory: null,
  setSelectedMemory: (memory) => set({ selectedMemory: memory }),

  isAdminAuthenticated: false,
  setIsAdminAuthenticated: (authenticated) => set({ isAdminAuthenticated: authenticated }),
  validateAdminToken: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ngdc_bncc_admin_token');
      const isAuthenticated = !!token;
      set({ isAdminAuthenticated: isAuthenticated });
      return isAuthenticated;
    }
    return false;
  },

  isJoinModalOpen: false,
  setJoinModalOpen: (open) => set({ isJoinModalOpen: open }),
  isCadetAuthOpen: false,
  setCadetAuthOpen: (open) => set({ isCadetAuthOpen: open }),
  isUniformModalOpen: false,
  setUniformModalOpen: (open) => set({ isUniformModalOpen: open }),
  isAdminLoginOpen: false,
  setAdminLoginOpen: (open) => set({ isAdminLoginOpen: open }),
  showLegalModal: false,
  setShowLegalModal: (show) => set({ showLegalModal: show }),
  showBackToTop: false,
  setShowBackToTop: (show) => set({ showBackToTop: show }),
}));
