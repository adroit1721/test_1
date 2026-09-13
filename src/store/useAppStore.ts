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

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
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
