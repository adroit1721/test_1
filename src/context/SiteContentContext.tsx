import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { safeStorage } from '../utils/safeStorage';
import {
  HeroSlide,
  NoticeItem,
  BlogItem,
  MemoryItem,
  HonorEntryItem,
  TrainingAnnouncement,
  PlatoonRoutineConfig,
  FormFieldConfig,
  CustomFormSubmission,
  CustomAboutSection,
  ContactMessage,
  ContactConfig,
  FooterConfig,
  ExecutiveMessageConfig,
  AboutOverviewConfig,
  MaintenanceConfig,
  MaintenanceMode,
} from '../types';
import { DEFAULT_MAINTENANCE_CONFIG } from '../data/defaultSiteSettings';
import {
  HERO_SLIDES_DATA,
  NOTICES_DATA,
  BLOGS_DATA,
  MEMORIES_DATA,
} from '../data/bnccData';
import {
  fetchSiteSettingsFromApi,
  upsertSiteSettingToApi,
} from '../utils/apiClient';

const localStorage = {
  getItem: (k: string) => safeStorage.getItem(k),
  setItem: (k: string, v: string) => safeStorage.setItem(k, v),
  removeItem: (k: string) => safeStorage.removeItem(k),
  clear: () => safeStorage.clear(),
  key: (i: number) => safeStorage.key(i),
  get length() { return safeStorage.length; },
};

export const DEFAULT_HONOR_ENTRIES: HonorEntryItem[] = [
  { id: 'cmd-1', category: 'commanders', sl: 1, name: 'Md. Abdul Matin', designation: 'Professor Under Officer (PUO) & Platoon Commander', tenure: '01/01/2018 to Present', remarks: 'Assistant Professor, Department of Management.', badge: 'Current Commander' },
  { id: 'cmd-2', category: 'commanders', sl: 2, name: 'Dr. A. K. M. Shamsuddin', designation: 'Ex-PUO & Associate Professor', tenure: '15/03/2009 to 31/12/2017', remarks: 'Pioneered modernized parade ground facilities.', badge: 'Veteran Commander' },
  { id: 'cmd-3', category: 'commanders', sl: 3, name: 'Prof. Md. Asaduzzaman', designation: 'Founder Platoon Commander & PUO', tenure: '01/07/1979 to 14/03/2009', remarks: 'Established the NGDC BNCC Platoon in 1979.', badge: 'Founder Commander' },
  { id: 'bnc-1', category: 'bnccos', sl: 1, name: 'Havildar Anisur Rahman', designation: 'Army Detachment BNCCO Instructor', tenure: '01/06/2022 to Present', remarks: 'In charge of squad drills & arms handling.', badge: 'Senior BNCCO' },
  { id: 'snr-1', category: 'seniors', sl: 1, name: 'Mahmudul Hasan (Rahman)', designation: 'Cadet Under Officer (CUO)', tenure: '01/01/2023 to 31/12/2024', remarks: 'Platoon Senior. YEP India Delegate.', badge: 'CUO Senior' },
];

export const DEFAULT_HEADER_LEFT_LOGO_URL = 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789061196/header-branding/al5oiphcqnhr0fixrhx8.png';
export const DEFAULT_HEADER_RIGHT_LOGO_URL = 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789061203/header-branding/eci8potgebwytbrxuo54.png';
export const DEFAULT_HEADER_TITLE = 'NGDC-BNCC';
export const DEFAULT_HEADER_SUBTITLE = 'New Govt. Degree College, Rajshahi BNCC Platoon';
export const DEFAULT_SITE_FAVICON = '/favicon.png';

export const DEFAULT_PRINCIPAL_MESSAGE: ExecutiveMessageConfig = {
  name: 'Professor Dr. Shikha Sarkar',
  designation: 'Principal',
  subDesignation: 'New Govt. Degree College, Rajshahi',
  badge: 'Patron & Leadership',
  quote: '"The Bangladesh National Cadet Corps (BNCC) instills an unshakeable sense of patriotism, moral integrity, and discipline among our students."',
  message: 'At New Govt. Degree College, Rajshahi, the BNCC platoon serves as a prestigious crucible of character building and leadership development.',
  photoUrl: '',
  enabled: true,
};

export const DEFAULT_VICE_PRINCIPAL_MESSAGE: ExecutiveMessageConfig = {
  name: 'Professor Md. Matiur Rahman',
  designation: 'Vice-Principal',
  subDesignation: 'New Govt. Degree College, Rajshahi',
  badge: 'Vice-Patron & Leadership',
  quote: '"Cadet training at NGDC tempers youth with fortitude, resilience, and brotherhood."',
  message: 'The BNCC platoon of New Govt. Degree College continues to be an inspiring emblem of dedication within our campus.',
  photoUrl: '',
  enabled: true,
};

export const DEFAULT_PLATOON_COMMANDER_MESSAGE: ExecutiveMessageConfig = {
  name: 'Md. Abdul Matin',
  designation: 'Professor Under Officer (PUO) & Platoon Commander',
  subDesignation: 'NGDC BNCC Platoon, 31 BNCC Battalion',
  badge: 'Platoon Commander & PUO',
  quote: '"Discipline, leadership, and national service form the bedrock of our cadet training."',
  message: 'As Platoon Commander of the NGDC BNCC Platoon, I am privileged to lead dedicated young cadets who uphold national pride and community service.',
  photoUrl: '',
  enabled: true,
};

export const DEFAULT_BNCCO1_MESSAGE: ExecutiveMessageConfig = {
  name: 'Havildar Anisur Rahman',
  designation: 'BNCCO Instructor 1',
  subDesignation: 'Army Detachment, 31 BNCC Battalion',
  badge: 'Senior BNCCO Instructor',
  quote: '"Flawless drill and disciplined execution are the signatures of an elite cadet squad."',
  message: 'Guiding NGDC cadets in parade ground mechanics, tactical drill, and physical endurance.',
  photoUrl: '',
  enabled: true,
};

export const DEFAULT_BNCCO2_MESSAGE: ExecutiveMessageConfig = {
  name: 'Corporal M. A. Karim',
  designation: 'BNCCO Instructor 2',
  subDesignation: 'Army Detachment, 31 BNCC Battalion',
  badge: 'BNCCO Instructor',
  quote: '"Endurance, precision, and team unity overcome every obstacle."',
  message: 'Instructing cadets in arms drill, fieldcraft, and ceremonial protocols.',
  photoUrl: '',
  enabled: true,
};

export const DEFAULT_ABOUT_OVERVIEW: AboutOverviewConfig = {
  badge: 'About Our Platoon',
  title: 'Bangladesh National Cadet Corps',
  subtitle: 'New Govt. Degree College, Rajshahi BNCC Platoon, 31 BNCC Battalion, Mahasthan Regiment',
  established: 'Established 1979',
  motto: 'Knowledge & Discipline',
  content: `BNCC activities began at this college in 1979, starting from the establishment of the No. 1 Mahasthan Battalion. Rooms 123 and 124 are allocated as the BNCC office.`,
};

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  addressTitle: 'NGDC BNCC Platoon HQ',
  roomAndBuilding: 'Room 123, Front Building',
  fullAddress: 'New Govt. Degree College, N6 Highway, Rajshahi - 6000, Bangladesh',
  phonePrimary: '+880 1712-345678',
  phoneSecondary: '+880 2588-861234',
  emailPrimary: 'bnccngdc123@gmail.com',
  emailSecondary: 'puo.matin@ngdc.ac.bd',
  officeHours: 'Sunday to Thursday: 09:00 AM - 04:00 PM',
  mapEmbedUrl: 'https://maps.google.com/maps?q=New%20Govt.%20Degree%20College%20Rajshahi&output=embed',
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  col1Title: 'Platoon Address & Contact',
  hqTitle: 'NGDC BNCC Platoon HQ',
  roomDetails: 'Room 123, Front Building,',
  locationDetails: 'New Govt. Degree College, N6, Rajshahi',
  phone: '+880 1712-345678',
  email: 'bnccngdc123@gmail.com',
  col2Title: 'Important Links',
  importantLinks: [],
  col3Title: 'Legal & Policies',
  legalLinks: [],
  col4Title: 'Follow Us',
  col4Subtitle: 'Connect with our platoon on official social channels:',
  socialLinks: [],
  copyrightText: 'NGDC-BNCC Platoon, New Govt. Degree College, Rajshahi. All rights reserved.',
  mottoText: 'Knowledge & Discipline • জ্ঞান ও শৃঙ্খলা',
  aboutText: 'The official contingent of Bangladesh National Cadet Corps (BNCC) at New Govt. Degree College.',
};

interface SiteContentContextType {
  headerLeftLogoUrl: string;
  updateHeaderLeftLogoUrl: (url: string) => Promise<boolean> | void;
  resetHeaderLeftLogoUrl: () => Promise<boolean> | void;
  headerRightLogoUrl: string;
  updateHeaderRightLogoUrl: (url: string) => Promise<boolean> | void;
  resetHeaderRightLogoUrl: () => Promise<boolean> | void;
  headerTitle: string;
  updateHeaderTitle: (title: string) => Promise<boolean> | void;
  resetHeaderTitle: () => Promise<boolean> | void;
  headerSubtitle: string;
  updateHeaderSubtitle: (subtitle: string) => Promise<boolean> | void;
  resetHeaderSubtitle: () => Promise<boolean> | void;
  updateHeaderBranding: (branding: {
    headerLeftLogoUrl?: string;
    headerRightLogoUrl?: string;
    headerTitle?: string;
    headerSubtitle?: string;
  }) => Promise<boolean>;

  siteFavicon: string;
  updateSiteFavicon: (url: string) => Promise<boolean> | void;
  resetSiteFavicon: () => Promise<boolean> | void;
  heroSlides: HeroSlide[];
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateHeroSlide: (id: string, slide: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: string) => void;
  principalMessage: ExecutiveMessageConfig;
  updatePrincipalMessage: (config: Partial<ExecutiveMessageConfig>) => Promise<boolean> | void;
  resetPrincipalMessage: () => Promise<boolean> | void;
  vicePrincipalMessage: ExecutiveMessageConfig;
  updateVicePrincipalMessage: (config: Partial<ExecutiveMessageConfig>) => Promise<boolean> | void;
  resetVicePrincipalMessage: () => Promise<boolean> | void;

  aboutOverview: AboutOverviewConfig;
  updateAboutOverview: (config: Partial<AboutOverviewConfig>) => Promise<boolean> | void;
  resetAboutOverview: () => Promise<boolean> | void;
  bncco1Message: ExecutiveMessageConfig;
  updateBncco1Message: (config: Partial<ExecutiveMessageConfig>) => Promise<boolean> | void;
  resetBncco1Message: () => Promise<boolean> | void;
  bncco2Message: ExecutiveMessageConfig;
  updateBncco2Message: (config: Partial<ExecutiveMessageConfig>) => Promise<boolean> | void;
  resetBncco2Message: () => Promise<boolean> | void;
  platoonCommanderMessage: ExecutiveMessageConfig;
  updatePlatoonCommanderMessage: (config: Partial<ExecutiveMessageConfig>) => Promise<boolean> | void;
  resetPlatoonCommanderMessage: () => Promise<boolean> | void;
  aboutSections: CustomAboutSection[];
  addAboutSection: (sec: Omit<CustomAboutSection, 'id'>) => void;
  updateAboutSection: (id: string, sec: Partial<CustomAboutSection>) => void;
  deleteAboutSection: (id: string) => void;

  trainingAnnouncements: TrainingAnnouncement[];
  addTrainingAnnouncement: (ann: Omit<TrainingAnnouncement, 'id'>) => void;
  updateTrainingAnnouncement: (id: string, ann: Partial<TrainingAnnouncement>) => void;
  deleteTrainingAnnouncement: (id: string) => void;
  trainingFormFields: FormFieldConfig[];
  setTrainingFormFields: React.Dispatch<React.SetStateAction<FormFieldConfig[]>>;
  trainingSubmissions: CustomFormSubmission[];
  addTrainingSubmission: (submission: Omit<CustomFormSubmission, 'id' | 'submittedAt'>) => void;
  updateTrainingSubmissionStatus: (id: string, status: string) => void;
  deleteTrainingSubmission: (id: string) => void;
  platoonRoutineConfig: PlatoonRoutineConfig;
  updatePlatoonRoutineConfig: (config: Partial<PlatoonRoutineConfig>) => void;

  notices: NoticeItem[];
  addNotice: (notice: Omit<NoticeItem, 'id'>) => void;
  updateNotice: (id: string, notice: Partial<NoticeItem>) => void;
  deleteNotice: (id: string) => void;
  blogs: BlogItem[];
  addBlog: (blog: Omit<BlogItem, 'id'>) => void;
  updateBlog: (id: string, blog: Partial<BlogItem>) => void;
  deleteBlog: (id: string) => void;

  memories: MemoryItem[];
  addMemory: (mem: Omit<MemoryItem, 'id'>) => void;
  updateMemory: (id: string, mem: Partial<MemoryItem>) => void;
  deleteMemory: (id: string) => void;

  honorEntries: HonorEntryItem[];
  addHonorEntry: (entry: Omit<HonorEntryItem, 'id'>) => void;
  updateHonorEntry: (id: string, entry: Partial<HonorEntryItem>) => void;
  deleteHonorEntry: (id: string) => void;

  contactConfig: ContactConfig;
  updateContactConfig: (config: Partial<ContactConfig>) => void;
  contactMessages: ContactMessage[];
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'timestamp'>) => void;
  markContactMessageRead: (id: string) => void;
  deleteContactMessage: (id: string) => void;

  footerConfig: FooterConfig;
  updateFooterConfig: (config: Partial<FooterConfig>) => void;

  maintenanceConfig: MaintenanceConfig;
  updateMaintenanceConfig: (config: Partial<MaintenanceConfig>) => Promise<boolean>;
  setMaintenanceMode: (mode: MaintenanceMode) => Promise<boolean>;
  adminPreviewMode: 'none' | 'banner' | 'lockdown';
  setAdminPreviewMode: (mode: 'none' | 'banner' | 'lockdown') => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headerLeftLogoUrl, setHeaderLeftLogoUrl] = useState<string>(DEFAULT_HEADER_LEFT_LOGO_URL);
  const [headerRightLogoUrl, setHeaderRightLogoUrl] = useState<string>(DEFAULT_HEADER_RIGHT_LOGO_URL);
  const [headerTitle, setHeaderTitle] = useState<string>(DEFAULT_HEADER_TITLE);
  const [headerSubtitle, setHeaderSubtitle] = useState<string>(DEFAULT_HEADER_SUBTITLE);
  const [siteFavicon, setSiteFavicon] = useState<string>(DEFAULT_SITE_FAVICON);

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(HERO_SLIDES_DATA);
  const [notices, setNotices] = useState<NoticeItem[]>(NOTICES_DATA);
  const [blogs, setBlogs] = useState<BlogItem[]>(BLOGS_DATA);
  const [memories, setMemories] = useState<MemoryItem[]>(MEMORIES_DATA);
  const [honorEntries, setHonorEntries] = useState<HonorEntryItem[]>(DEFAULT_HONOR_ENTRIES);

  const [principalMessage, setPrincipalMessage] = useState<ExecutiveMessageConfig>(DEFAULT_PRINCIPAL_MESSAGE);
  const [vicePrincipalMessage, setVicePrincipalMessage] = useState<ExecutiveMessageConfig>(DEFAULT_VICE_PRINCIPAL_MESSAGE);
  const [aboutOverview, setAboutOverview] = useState<AboutOverviewConfig>(DEFAULT_ABOUT_OVERVIEW);
  const [bncco1Message, setBncco1Message] = useState<ExecutiveMessageConfig>(DEFAULT_BNCCO1_MESSAGE);
  const [bncco2Message, setBncco2Message] = useState<ExecutiveMessageConfig>(DEFAULT_BNCCO2_MESSAGE);
  const [platoonCommanderMessage, setPlatoonCommanderMessage] = useState<ExecutiveMessageConfig>(DEFAULT_PLATOON_COMMANDER_MESSAGE);
  const [aboutSections, setAboutSections] = useState<CustomAboutSection[]>([]);

  const [trainingAnnouncements, setTrainingAnnouncements] = useState<TrainingAnnouncement[]>([]);
  const [trainingFormFields, setTrainingFormFields] = useState<FormFieldConfig[]>([]);
  const updateTrainingFormFields = (action: React.SetStateAction<FormFieldConfig[]>) => {
    setTrainingFormFields((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveSetting('ngdc_training_form_fields', next);
      return next;
    });
  };
  const [trainingSubmissions, setTrainingSubmissions] = useState<CustomFormSubmission[]>([]);
  const [platoonRoutineConfig, setPlatoonRoutineConfig] = useState<PlatoonRoutineConfig>({
    isPublished: false,
    title: '',
    effectiveDate: '',
    pdfUrl: '',
    fileName: '',
    instructions: '',
    updatedAt: '',
  });

  const [contactConfig, setContactConfig] = useState<ContactConfig>(DEFAULT_CONTACT_CONFIG);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>(DEFAULT_MAINTENANCE_CONFIG);
  const [adminPreviewMode, setAdminPreviewMode] = useState<'none' | 'banner' | 'lockdown'>('none');

  useEffect(() => {
    // 1. Initial Local Storage Hydration
    try {
      const leftLogo = localStorage.getItem('ngdc_header_left_logo');
      if (leftLogo) setHeaderLeftLogoUrl(JSON.parse(leftLogo));

      const rightLogo = localStorage.getItem('ngdc_header_right_logo');
      if (rightLogo) setHeaderRightLogoUrl(JSON.parse(rightLogo));

      const title = localStorage.getItem('ngdc_header_title');
      if (title) setHeaderTitle(JSON.parse(title));

      const subtitle = localStorage.getItem('ngdc_header_subtitle');
      if (subtitle) setHeaderSubtitle(JSON.parse(subtitle));

      const fav = localStorage.getItem('ngdc_site_favicon');
      if (fav) setSiteFavicon(JSON.parse(fav));

      const pm = localStorage.getItem('ngdc_principal_message');
      if (pm) setPrincipalMessage(JSON.parse(pm));

      const vpm = localStorage.getItem('ngdc_vice_principal_message');
      if (vpm) setVicePrincipalMessage(JSON.parse(vpm));

      const abt = localStorage.getItem('ngdc_about_overview');
      if (abt) setAboutOverview(JSON.parse(abt));

      const b1 = localStorage.getItem('ngdc_bncco1_message');
      if (b1) setBncco1Message(JSON.parse(b1));

      const b2 = localStorage.getItem('ngdc_bncco2_message');
      if (b2) setBncco2Message(JSON.parse(b2));

      const pcm = localStorage.getItem('ngdc_platoon_commander_message');
      if (pcm) setPlatoonCommanderMessage(JSON.parse(pcm));

      const secs = localStorage.getItem('ngdc_about_sections');
      if (secs) setAboutSections(JSON.parse(secs));

      const trs = localStorage.getItem('ngdc_trainings');
      if (trs) setTrainingAnnouncements(JSON.parse(trs));

      const tff = localStorage.getItem('ngdc_training_form_fields');
      if (tff) setTrainingFormFields(JSON.parse(tff));

      const tsub = localStorage.getItem('ngdc_training_submissions');
      if (tsub) setTrainingSubmissions(JSON.parse(tsub));

      const prc = localStorage.getItem('ngdc_platoon_routine');
      if (prc) setPlatoonRoutineConfig(JSON.parse(prc));

      const cc = localStorage.getItem('ngdc_contact_config');
      if (cc) setContactConfig(JSON.parse(cc));

      const cm = localStorage.getItem('ngdc_contact_messages');
      if (cm) setContactMessages(JSON.parse(cm));

      const fc = localStorage.getItem('ngdc_footer_config');
      if (fc) setFooterConfig(JSON.parse(fc));

      const mc = localStorage.getItem('ngdc_maintenance_config');
      if (mc) setMaintenanceConfig(JSON.parse(mc));
    } catch {}

    // 2. Fetch Remote Database Settings
    fetchSiteSettingsFromApi().then((data) => {
      if (!data) return;
      if (data.ngdc_notices && Array.isArray(data.ngdc_notices)) setNotices(data.ngdc_notices);
      if (data.ngdc_blogs && Array.isArray(data.ngdc_blogs)) setBlogs(data.ngdc_blogs);
      if (data.ngdc_memories && Array.isArray(data.ngdc_memories)) setMemories(data.ngdc_memories);
      if (data.ngdc_honor_entries && Array.isArray(data.ngdc_honor_entries)) setHonorEntries(data.ngdc_honor_entries);
      if (data.ngdc_hero_slides && Array.isArray(data.ngdc_hero_slides)) setHeroSlides(data.ngdc_hero_slides);
      if (data.ngdc_header_left_logo) setHeaderLeftLogoUrl(data.ngdc_header_left_logo);
      if (data.ngdc_header_right_logo) setHeaderRightLogoUrl(data.ngdc_header_right_logo);
      if (data.ngdc_header_title) setHeaderTitle(data.ngdc_header_title);
      if (data.ngdc_header_subtitle) setHeaderSubtitle(data.ngdc_header_subtitle);
      if (data.ngdc_site_favicon) setSiteFavicon(data.ngdc_site_favicon);
      if (data.ngdc_principal_message) setPrincipalMessage(data.ngdc_principal_message);
      if (data.ngdc_vice_principal_message) setVicePrincipalMessage(data.ngdc_vice_principal_message);
      if (data.ngdc_about_overview) setAboutOverview(data.ngdc_about_overview);
      if (data.ngdc_bncco1_message) setBncco1Message(data.ngdc_bncco1_message);
      if (data.ngdc_bncco2_message) setBncco2Message(data.ngdc_bncco2_message);
      if (data.ngdc_platoon_commander_message) setPlatoonCommanderMessage(data.ngdc_platoon_commander_message);
      if (data.ngdc_about_sections && Array.isArray(data.ngdc_about_sections)) setAboutSections(data.ngdc_about_sections);
      if (data.ngdc_trainings && Array.isArray(data.ngdc_trainings)) setTrainingAnnouncements(data.ngdc_trainings);
      if (data.ngdc_training_form_fields && Array.isArray(data.ngdc_training_form_fields)) setTrainingFormFields(data.ngdc_training_form_fields);
      if (data.ngdc_training_submissions && Array.isArray(data.ngdc_training_submissions)) setTrainingSubmissions(data.ngdc_training_submissions);
      if (data.ngdc_platoon_routine) setPlatoonRoutineConfig(data.ngdc_platoon_routine);
      if (data.ngdc_contact_config) setContactConfig(data.ngdc_contact_config);
      if (data.ngdc_contact_messages && Array.isArray(data.ngdc_contact_messages)) setContactMessages(data.ngdc_contact_messages);
      if (data.ngdc_footer_config) setFooterConfig(data.ngdc_footer_config);
      if (data.ngdc_maintenance_config) setMaintenanceConfig(data.ngdc_maintenance_config);
    }).catch(() => {});
  }, []);

  const saveSetting = (key: string, val: any) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    try { upsertSiteSettingToApi(key, val); } catch {}
  };

  const updateHeaderLeftLogoUrl = (url: string) => { setHeaderLeftLogoUrl(url); saveSetting('ngdc_header_left_logo', url); };
  const resetHeaderLeftLogoUrl = () => { setHeaderLeftLogoUrl(DEFAULT_HEADER_LEFT_LOGO_URL); saveSetting('ngdc_header_left_logo', DEFAULT_HEADER_LEFT_LOGO_URL); };

  const updateHeaderRightLogoUrl = (url: string) => { setHeaderRightLogoUrl(url); saveSetting('ngdc_header_right_logo', url); };
  const resetHeaderRightLogoUrl = () => { setHeaderRightLogoUrl(DEFAULT_HEADER_RIGHT_LOGO_URL); saveSetting('ngdc_header_right_logo', DEFAULT_HEADER_RIGHT_LOGO_URL); };

  const updateHeaderTitle = (title: string) => { setHeaderTitle(title); saveSetting('ngdc_header_title', title); };
  const resetHeaderTitle = () => { setHeaderTitle(DEFAULT_HEADER_TITLE); saveSetting('ngdc_header_title', DEFAULT_HEADER_TITLE); };

  const updateHeaderSubtitle = (subtitle: string) => { setHeaderSubtitle(subtitle); saveSetting('ngdc_header_subtitle', subtitle); };
  const resetHeaderSubtitle = () => { setHeaderSubtitle(DEFAULT_HEADER_SUBTITLE); saveSetting('ngdc_header_subtitle', DEFAULT_HEADER_SUBTITLE); };

  const updateHeaderBranding = async (branding: {
    headerLeftLogoUrl?: string;
    headerRightLogoUrl?: string;
    headerTitle?: string;
    headerSubtitle?: string;
  }) => {
    if (branding.headerLeftLogoUrl !== undefined) updateHeaderLeftLogoUrl(branding.headerLeftLogoUrl);
    if (branding.headerRightLogoUrl !== undefined) updateHeaderRightLogoUrl(branding.headerRightLogoUrl);
    if (branding.headerTitle !== undefined) updateHeaderTitle(branding.headerTitle);
    if (branding.headerSubtitle !== undefined) updateHeaderSubtitle(branding.headerSubtitle);
    return true;
  };

  const updateSiteFavicon = (url: string) => { setSiteFavicon(url); saveSetting('ngdc_site_favicon', url); };
  const resetSiteFavicon = () => { setSiteFavicon(DEFAULT_SITE_FAVICON); saveSetting('ngdc_site_favicon', DEFAULT_SITE_FAVICON); };

  const addHeroSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const next = [...heroSlides, { ...slide, id: `slide-${Date.now()}` }];
    setHeroSlides(next); saveSetting('ngdc_hero_slides', next);
  };
  const updateHeroSlide = (id: string, slide: Partial<HeroSlide>) => {
    const next = heroSlides.map((s) => (s.id === id ? { ...s, ...slide } : s));
    setHeroSlides(next); saveSetting('ngdc_hero_slides', next);
  };
  const deleteHeroSlide = (id: string) => {
    const next = heroSlides.filter((s) => s.id !== id);
    setHeroSlides(next); saveSetting('ngdc_hero_slides', next);
  };

  const updatePrincipalMessage = (config: Partial<ExecutiveMessageConfig>) => {
    const next = { ...principalMessage, ...config };
    setPrincipalMessage(next); saveSetting('ngdc_principal_message', next);
  };
  const resetPrincipalMessage = () => { setPrincipalMessage(DEFAULT_PRINCIPAL_MESSAGE); saveSetting('ngdc_principal_message', DEFAULT_PRINCIPAL_MESSAGE); };

  const updateVicePrincipalMessage = (config: Partial<ExecutiveMessageConfig>) => {
    const next = { ...vicePrincipalMessage, ...config };
    setVicePrincipalMessage(next); saveSetting('ngdc_vice_principal_message', next);
  };
  const resetVicePrincipalMessage = () => { setVicePrincipalMessage(DEFAULT_VICE_PRINCIPAL_MESSAGE); saveSetting('ngdc_vice_principal_message', DEFAULT_VICE_PRINCIPAL_MESSAGE); };

  const updateAboutOverview = (config: Partial<AboutOverviewConfig>) => {
    const next = { ...aboutOverview, ...config };
    setAboutOverview(next); saveSetting('ngdc_about_overview', next);
  };
  const resetAboutOverview = () => { setAboutOverview(DEFAULT_ABOUT_OVERVIEW); saveSetting('ngdc_about_overview', DEFAULT_ABOUT_OVERVIEW); };

  const updateBncco1Message = (config: Partial<ExecutiveMessageConfig>) => {
    setBncco1Message((prev) => {
      const next = { ...prev, ...config };
      saveSetting('ngdc_bncco1_message', next);
      return next;
    });
  };
  const resetBncco1Message = () => {
    setBncco1Message(DEFAULT_BNCCO1_MESSAGE);
    saveSetting('ngdc_bncco1_message', DEFAULT_BNCCO1_MESSAGE);
  };

  const updateBncco2Message = (config: Partial<ExecutiveMessageConfig>) => {
    setBncco2Message((prev) => {
      const next = { ...prev, ...config };
      saveSetting('ngdc_bncco2_message', next);
      return next;
    });
  };
  const resetBncco2Message = () => {
    setBncco2Message(DEFAULT_BNCCO2_MESSAGE);
    saveSetting('ngdc_bncco2_message', DEFAULT_BNCCO2_MESSAGE);
  };

  const updatePlatoonCommanderMessage = (config: Partial<ExecutiveMessageConfig>) => {
    setPlatoonCommanderMessage((prev) => {
      const next = { ...prev, ...config };
      saveSetting('ngdc_platoon_commander_message', next);
      return next;
    });
  };
  const resetPlatoonCommanderMessage = () => {
    setPlatoonCommanderMessage(DEFAULT_PLATOON_COMMANDER_MESSAGE);
    saveSetting('ngdc_platoon_commander_message', DEFAULT_PLATOON_COMMANDER_MESSAGE);
  };

  const addAboutSection = (sec: Omit<CustomAboutSection, 'id'>) => {
    setAboutSections((prev) => {
      const next = [...prev, { ...sec, id: `sec-${Date.now()}` }];
      saveSetting('ngdc_about_sections', next);
      return next;
    });
  };
  const updateAboutSection = (id: string, sec: Partial<CustomAboutSection>) => {
    setAboutSections((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...sec } : s));
      saveSetting('ngdc_about_sections', next);
      return next;
    });
  };
  const deleteAboutSection = (id: string) => {
    setAboutSections((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveSetting('ngdc_about_sections', next);
      return next;
    });
  };

  const addTrainingAnnouncement = (ann: Omit<TrainingAnnouncement, 'id'>) => {
    const next = [{ ...ann, id: `tr-${Date.now()}` }, ...trainingAnnouncements];
    setTrainingAnnouncements(next); saveSetting('ngdc_trainings', next);
  };
  const updateTrainingAnnouncement = (id: string, ann: Partial<TrainingAnnouncement>) => {
    const next = trainingAnnouncements.map((a) => (a.id === id ? { ...a, ...ann } : a));
    setTrainingAnnouncements(next); saveSetting('ngdc_trainings', next);
  };
  const deleteTrainingAnnouncement = (id: string) => {
    const next = trainingAnnouncements.filter((a) => a.id !== id);
    setTrainingAnnouncements(next); saveSetting('ngdc_trainings', next);
  };

  const addTrainingSubmission = (submission: Omit<CustomFormSubmission, 'id' | 'submittedAt'>) => {
    const next = [{ ...submission, id: `sub-${Date.now()}`, submittedAt: new Date().toLocaleString() }, ...trainingSubmissions];
    setTrainingSubmissions(next); saveSetting('ngdc_training_submissions', next);
  };
  const updateTrainingSubmissionStatus = (id: string, status: string) => {
    const next = trainingSubmissions.map((s) => (s.id === id ? { ...s, status } : s));
    setTrainingSubmissions(next); saveSetting('ngdc_training_submissions', next);
  };
  const deleteTrainingSubmission = (id: string) => {
    const next = trainingSubmissions.filter((s) => s.id !== id);
    setTrainingSubmissions(next); saveSetting('ngdc_training_submissions', next);
  };

  const updatePlatoonRoutineConfig = (config: Partial<PlatoonRoutineConfig>) => {
    setPlatoonRoutineConfig((prev) => {
      const next = { ...prev, ...config };
      saveSetting('ngdc_platoon_routine', next);
      return next;
    });
  };

  const addNotice = (notice: Omit<NoticeItem, 'id'>) => {
    const next = [{ ...notice, id: `not-${Date.now()}` }, ...notices];
    setNotices(next); saveSetting('ngdc_notices', next);
  };
  const updateNotice = (id: string, notice: Partial<NoticeItem>) => {
    const next = notices.map((n) => (n.id === id ? { ...n, ...notice } : n));
    setNotices(next); saveSetting('ngdc_notices', next);
  };
  const deleteNotice = (id: string) => {
    const next = notices.filter((n) => n.id !== id);
    setNotices(next); saveSetting('ngdc_notices', next);
  };

  const addBlog = (blog: Omit<BlogItem, 'id'>) => {
    const next = [{ ...blog, id: `blog-${Date.now()}` }, ...blogs];
    setBlogs(next); saveSetting('ngdc_blogs', next);
  };
  const updateBlog = (id: string, blog: Partial<BlogItem>) => {
    const next = blogs.map((b) => (b.id === id ? { ...b, ...blog } : b));
    setBlogs(next); saveSetting('ngdc_blogs', next);
  };
  const deleteBlog = (id: string) => {
    const next = blogs.filter((b) => b.id !== id);
    setBlogs(next); saveSetting('ngdc_blogs', next);
  };

  const addMemory = (mem: Omit<MemoryItem, 'id'>) => {
    const next = [{ ...mem, id: `mem-${Date.now()}` }, ...memories];
    setMemories(next); saveSetting('ngdc_memories', next);
  };
  const updateMemory = (id: string, mem: Partial<MemoryItem>) => {
    const next = memories.map((m) => (m.id === id ? { ...m, ...mem } : m));
    setMemories(next); saveSetting('ngdc_memories', next);
  };
  const deleteMemory = (id: string) => {
    const next = memories.filter((m) => m.id !== id);
    setMemories(next); saveSetting('ngdc_memories', next);
  };

  const addHonorEntry = (entry: Omit<HonorEntryItem, 'id'>) => {
    const next = [{ ...entry, id: `honor-${Date.now()}` }, ...honorEntries];
    setHonorEntries(next); saveSetting('ngdc_honor_entries', next);
  };
  const updateHonorEntry = (id: string, entry: Partial<HonorEntryItem>) => {
    const next = honorEntries.map((h) => (h.id === id ? { ...h, ...entry } : h));
    setHonorEntries(next); saveSetting('ngdc_honor_entries', next);
  };
  const deleteHonorEntry = (id: string) => {
    const next = honorEntries.filter((h) => h.id !== id);
    setHonorEntries(next); saveSetting('ngdc_honor_entries', next);
  };

  const updateContactConfig = (config: Partial<ContactConfig>) => {
    setContactConfig((prev) => {
      const next = { ...prev, ...config };
      saveSetting('ngdc_contact_config', next);
      return next;
    });
  };

  const addContactMessage = (msg: Omit<ContactMessage, 'id' | 'timestamp'>) => {
    const newMsg: ContactMessage = { ...msg, id: `msg-${Date.now()}`, timestamp: new Date().toLocaleString() };
    setContactMessages((prev) => {
      const next = [newMsg, ...prev];
      saveSetting('ngdc_contact_messages', next);
      return next;
    });
  };

  const markContactMessageRead = (id: string) => {
    setContactMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, read: true } : m));
      saveSetting('ngdc_contact_messages', next);
      return next;
    });
  };

  const deleteContactMessage = (id: string) => {
    setContactMessages((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveSetting('ngdc_contact_messages', next);
      return next;
    });
  };

  const updateFooterConfig = (config: Partial<FooterConfig>) => {
    setFooterConfig((prev) => {
      const next = { ...prev, ...config };
      saveSetting('ngdc_footer_config', next);
      return next;
    });
  };

  const updateMaintenanceConfig = async (config: Partial<MaintenanceConfig>) => {
    setMaintenanceConfig((prev) => {
      const next = { ...prev, ...config };
      saveSetting('ngdc_maintenance_config', next);
      return next;
    });
    return true;
  };

  const setMaintenanceMode = async (mode: MaintenanceMode) => {
    return updateMaintenanceConfig({ mode, enabled: mode !== 'disabled' });
  };

  const value = useMemo<SiteContentContextType>(
    () => ({
      headerLeftLogoUrl,
      updateHeaderLeftLogoUrl,
      resetHeaderLeftLogoUrl,
      headerRightLogoUrl,
      updateHeaderRightLogoUrl,
      resetHeaderRightLogoUrl,
      headerTitle,
      updateHeaderTitle,
      resetHeaderTitle,
      headerSubtitle,
      updateHeaderSubtitle,
      resetHeaderSubtitle,
      updateHeaderBranding,
      siteFavicon,
      updateSiteFavicon,
      resetSiteFavicon,
      heroSlides,
      addHeroSlide,
      updateHeroSlide,
      deleteHeroSlide,
      principalMessage,
      updatePrincipalMessage,
      resetPrincipalMessage,
      vicePrincipalMessage,
      updateVicePrincipalMessage,
      resetVicePrincipalMessage,
      aboutOverview,
      updateAboutOverview,
      resetAboutOverview,
      bncco1Message,
      updateBncco1Message,
      resetBncco1Message,
      bncco2Message,
      updateBncco2Message,
      resetBncco2Message,
      platoonCommanderMessage,
      updatePlatoonCommanderMessage,
      resetPlatoonCommanderMessage,
      aboutSections,
      addAboutSection,
      updateAboutSection,
      deleteAboutSection,
      trainingAnnouncements,
      addTrainingAnnouncement,
      updateTrainingAnnouncement,
      deleteTrainingAnnouncement,
      trainingFormFields,
      setTrainingFormFields: updateTrainingFormFields,
      trainingSubmissions,
      addTrainingSubmission,
      updateTrainingSubmissionStatus,
      deleteTrainingSubmission,
      platoonRoutineConfig,
      updatePlatoonRoutineConfig,
      notices,
      addNotice,
      updateNotice,
      deleteNotice,
      blogs,
      addBlog,
      updateBlog,
      deleteBlog,
      memories,
      addMemory,
      updateMemory,
      deleteMemory,
      honorEntries,
      addHonorEntry,
      updateHonorEntry,
      deleteHonorEntry,
      contactConfig,
      updateContactConfig,
      contactMessages,
      addContactMessage,
      markContactMessageRead,
      deleteContactMessage,
      footerConfig,
      updateFooterConfig,
      maintenanceConfig,
      updateMaintenanceConfig,
      setMaintenanceMode,
      adminPreviewMode,
      setAdminPreviewMode,
    }),
    [
      headerLeftLogoUrl,
      headerRightLogoUrl,
      headerTitle,
      headerSubtitle,
      siteFavicon,
      heroSlides,
      principalMessage,
      vicePrincipalMessage,
      aboutOverview,
      bncco1Message,
      bncco2Message,
      platoonCommanderMessage,
      aboutSections,
      trainingAnnouncements,
      trainingFormFields,
      trainingSubmissions,
      platoonRoutineConfig,
      notices,
      blogs,
      memories,
      honorEntries,
      contactConfig,
      contactMessages,
      footerConfig,
      maintenanceConfig,
      adminPreviewMode,
    ]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};
