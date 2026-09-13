import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { safeStorage } from '../utils/safeStorage';
import {
  RecruitmentApplicant,
  RecruitmentAnnouncementConfig,
  RecruitmentSignatoriesConfig,
  FormFieldConfig,
} from '../types';
import {
  fetchRecruitmentApplicantsFromApi,
  submitRecruitmentApplicationToApi,
  deleteRecruitmentApplicantFromApi,
} from '../utils/apiClient';

const localStorage = {
  getItem: (k: string) => safeStorage.getItem(k),
  setItem: (k: string, v: string) => safeStorage.setItem(k, v),
  removeItem: (k: string) => safeStorage.removeItem(k),
  clear: () => safeStorage.clear(),
  key: (i: number) => safeStorage.key(i),
  get length() { return safeStorage.length; },
};

export const DEFAULT_RECRUITMENT_ANNOUNCEMENT: RecruitmentAnnouncementConfig = {
  isActive: true,
  title: 'Cadet Recruitment Batch 2025-2026 Enrolment Circular',
  batch: 'Batch 24',
  deadline: '2026-10-15',
  startDate: '2026-09-01T08:00',
  endDate: '2026-10-15T23:59',
  venue: 'Main Parade Ground, NGDC',
  description: 'Join the Bangladesh National Cadet Corps (Army Wing) at New Government Degree College, Rajshahi.',
  eligibilityCriteria: [
    'Regular student of New Govt. Degree College (HSC 1st/2nd Year or Degree/Honours)',
    'Minimum height: Male 5\'4", Female 5\'0"',
    'Good physical fitness, mental resilience, and medically sound',
  ],
  headerImageUrl: '',
  footerImageUrl: '',
  footerText: 'For recruitment inquiries, visit Platoon HQ Room 123 or call +880 1712-345678.',
};

export const DEFAULT_RECRUITMENT_SIGNATORIES: RecruitmentSignatoriesConfig = {
  countersignedName: 'PUO Md. Abdul Matin',
  countersignedPNo: 'P-819',
  countersignedBattalion: '31 BNCC Battalion',
  countersignedRegiment: 'Mahasthan Regiment',
  countersignedTitle: 'Platoon Commander',
  countersignedInstitution: 'New Govt. Degree College, Rajshahi',
  countersignedSignatureUrl: '',

  seniorCadetRankAndName: 'Cadet Sergeant Touhid',
  seniorCadetNo: '',
  seniorCadetBattalion: '31 BNCC Battalion',
  seniorCadetRegiment: 'Mahasthan Regiment',
  seniorCadetInstitution: 'New Govt. Degree College, Rajshahi',
  seniorCadetSignatureUrl: '',

  formProviderTitle: 'Signature of Form Provider:',
  attachments: [
    'Photocopy of College ID Card / Admission Receipt',
    'Photocopy of SSC / HSC Marksheet',
    'Blood Group Certificate (if available)',
  ],
};

const DEFAULT_RECRUITMENT_FORM_FIELDS: FormFieldConfig[] = [
  { id: 'rec-1', label: 'Full Name in English', type: 'text', placeholder: 'As registered in SSC/HSC Certificate', required: true },
  { id: 'rec-2', label: 'Active Email Address', type: 'email', placeholder: 'student@example.com', required: true },
  { id: 'rec-3', label: 'Applicant Mobile Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
  { id: 'rec-4', label: 'College Roll / Admission ID', type: 'text', placeholder: 'e.g. 24-SCI-0142', required: true },
  { id: 'rec-5', label: 'Class / Department', type: 'select', required: true, options: ['HSC 1st Year (Science)', 'HSC 1st Year (Humanities)', 'HSC 1st Year (Business Studies)', 'Degree / Honours 1st Year (Science)', 'Degree / Honours 1st Year (Arts)', 'Degree / Honours 1st Year (Commerce)'] },
  { id: 'rec-6', label: 'Academic Session', type: 'text', placeholder: 'e.g. 2024 - 2025', required: true },
  { id: 'rec-7', label: 'Height (Feet & Inches)', type: 'text', placeholder: 'e.g. 5 Feet 8 Inches', required: true },
  { id: 'rec-8', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 62', required: true },
  { id: 'rec-9', label: 'Blood Group', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  { id: 'rec-10', label: 'Motivation to Join BNCC', type: 'textarea', placeholder: 'Why do you wish to earn the BNCC uniform?', required: true },
];

interface RecruitmentContextType {
  isRecruitmentOpen: boolean;
  setIsRecruitmentOpen: (open: boolean) => void;
  recruitmentNoticeTitle: string;
  setRecruitmentNoticeTitle: (title: string) => void;
  recruitmentAnnouncement: RecruitmentAnnouncementConfig | null;
  updateRecruitmentAnnouncement: (ann: Partial<RecruitmentAnnouncementConfig> | null) => void;
  deleteRecruitmentAnnouncement: () => void;
  recruitmentConfig: {
    noticeTitle: string;
    batchName: string;
    isOpen: boolean;
  };
  recruitmentFormFields: FormFieldConfig[];
  setRecruitmentFormFields: React.Dispatch<React.SetStateAction<FormFieldConfig[]>>;
  recruitmentFields: FormFieldConfig[];
  setRecruitmentFields: React.Dispatch<React.SetStateAction<FormFieldConfig[]>>;
  recruitmentApplicants: RecruitmentApplicant[];
  applicants: RecruitmentApplicant[];
  addRecruitmentApplicant: (applicant: Omit<RecruitmentApplicant, 'id' | 'token' | 'appliedAt' | 'status'>) => string;
  addApplicant: (applicant: any) => string;
  updateApplicantStatus: (id: string, status: RecruitmentApplicant['status']) => void;
  updateRecruitmentApplicant: (id: string, applicant: Partial<RecruitmentApplicant>) => void;
  deleteRecruitmentApplicant: (id: string) => void;
  deleteApplicant: (id: string) => void;
  exportApplicantsToExcel: () => void;
  refreshRecruitmentApplicants: () => Promise<void>;
  recruitmentSignatories: RecruitmentSignatoriesConfig;
  updateRecruitmentSignatories: (config: Partial<RecruitmentSignatoriesConfig>) => void;
  resetRecruitmentSignatories: () => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRecruitmentOpen, setIsRecruitmentOpenState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_open');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const setIsRecruitmentOpen = (open: boolean) => {
    setIsRecruitmentOpenState(open);
    try { localStorage.setItem('ngdc_recruitment_open', String(open)); } catch {}
  };

  const [recruitmentNoticeTitleState, setRecruitmentNoticeTitleState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_notice_title');
      if (saved) return saved;
    }
    return 'Cadet Recruitment Batch 2025-2026 Enrolment Circular';
  });

  const setRecruitmentNoticeTitle = (title: string) => {
    setRecruitmentNoticeTitleState(title);
    try { localStorage.setItem('ngdc_recruitment_notice_title', title); } catch {}
  };

  const [recruitmentAnnouncement, setRecruitmentAnnouncement] = useState<RecruitmentAnnouncementConfig | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_announcement');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_RECRUITMENT_ANNOUNCEMENT;
  });

  const updateRecruitmentAnnouncement = (ann: Partial<RecruitmentAnnouncementConfig> | null) => {
    setRecruitmentAnnouncement((prev) => {
      const next = ann ? ({ ...(prev || DEFAULT_RECRUITMENT_ANNOUNCEMENT), ...ann } as RecruitmentAnnouncementConfig) : null;
      try { localStorage.setItem('ngdc_recruitment_announcement', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const deleteRecruitmentAnnouncement = () => {
    setRecruitmentAnnouncement(null);
    try { localStorage.removeItem('ngdc_recruitment_announcement'); } catch {}
  };

  const [recruitmentFields, setRecruitmentFieldsState] = useState<FormFieldConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_fields');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DEFAULT_RECRUITMENT_FORM_FIELDS;
  });

  const setRecruitmentFields = useCallback((action: React.SetStateAction<FormFieldConfig[]>) => {
    setRecruitmentFieldsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      try { localStorage.setItem('ngdc_recruitment_fields', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const [recruitmentApplicants, setRecruitmentApplicants] = useState<RecruitmentApplicant[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_applicants');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
    return [];
  });

  const saveApplicants = (list: RecruitmentApplicant[]) => {
    setRecruitmentApplicants(list);
    try { localStorage.setItem('ngdc_recruitment_applicants', JSON.stringify(list)); } catch {}
  };

  const refreshRecruitmentApplicants = useCallback(async () => {
    try {
      const dbApps = await fetchRecruitmentApplicantsFromApi();
      if (Array.isArray(dbApps)) {
        setRecruitmentApplicants(dbApps);
        try { localStorage.setItem('ngdc_recruitment_applicants', JSON.stringify(dbApps)); } catch {}
      }
    } catch (err) {
      console.warn('Failed to fetch recruitment applicants:', err);
    }
  }, []);

  useEffect(() => {
    refreshRecruitmentApplicants();
  }, [refreshRecruitmentApplicants]);

  const addRecruitmentApplicant = (applicant: Omit<RecruitmentApplicant, 'id' | 'token' | 'appliedAt' | 'status'>) => {
    const token = `NGDC-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApplicant: RecruitmentApplicant = {
      ...applicant,
      id: `app-${Date.now()}`,
      token,
      appliedAt: new Date().toLocaleString(),
      status: 'Submitted',
    };

    saveApplicants([newApplicant, ...recruitmentApplicants]);

    try {
      submitRecruitmentApplicationToApi(newApplicant);
    } catch (err) {
      console.warn('Failed to submit application to API:', err);
    }
    return token;
  };

  const updateApplicantStatus = (id: string, status: RecruitmentApplicant['status']) => {
    const list = recruitmentApplicants.map((a) => (a.id === id ? { ...a, status } : a));
    saveApplicants(list);
    const updated = list.find((a) => a.id === id);
    if (updated) {
      try { submitRecruitmentApplicationToApi(updated); } catch {}
    }
  };

  const updateRecruitmentApplicant = (id: string, applicant: Partial<RecruitmentApplicant>) => {
    const list = recruitmentApplicants.map((a) => (a.id === id ? { ...a, ...applicant } : a));
    saveApplicants(list);
    const updated = list.find((a) => a.id === id);
    if (updated) {
      try { submitRecruitmentApplicationToApi(updated); } catch {}
    }
  };

  const deleteRecruitmentApplicant = (id: string) => {
    saveApplicants(recruitmentApplicants.filter((a) => a.id !== id));
    try { deleteRecruitmentApplicantFromApi(id); } catch {}
  };

  const [recruitmentSignatories, setRecruitmentSignatories] = useState<RecruitmentSignatoriesConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_signatories');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_RECRUITMENT_SIGNATORIES;
  });

  const updateRecruitmentSignatories = (config: Partial<RecruitmentSignatoriesConfig>) => {
    setRecruitmentSignatories((prev) => {
      const next = { ...prev, ...config };
      try { localStorage.setItem('ngdc_recruitment_signatories', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const resetRecruitmentSignatories = () => {
    setRecruitmentSignatories(DEFAULT_RECRUITMENT_SIGNATORIES);
    try { localStorage.removeItem('ngdc_recruitment_signatories'); } catch {}
  };

  const exportApplicantsToExcel = () => {
    try {
      const dataToExport = recruitmentApplicants.map((app, index) => ({
        'SL No': index + 1,
        'Token / Roll': app.token || app.serialNo || '',
        'Full Name': app.fullName || app.name || '',
        'Mobile Number': app.phone || app.mobile || '',
        Email: app.email || '',
        'College Roll': app.collegeRoll || '',
        Department: app.department || app.classYear || '',
        Session: app.academicSession || app.session || '',
        'Height (ft/in)': app.height || '',
        'Weight (kg)': app.weight || '',
        'Blood Group': app.bloodGroup || '',
        Status: app.status || 'Submitted',
        'Applied At': app.appliedAt || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Recruitment_Applicants');

      const fileName = `NGDC_BNCC_Recruitment_Applicants_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting recruitment applicants to Excel:', err);
    }
  };

  const value = useMemo<RecruitmentContextType>(
    () => ({
      isRecruitmentOpen,
      setIsRecruitmentOpen,
      recruitmentNoticeTitle: recruitmentNoticeTitleState,
      setRecruitmentNoticeTitle,
      recruitmentAnnouncement,
      updateRecruitmentAnnouncement,
      deleteRecruitmentAnnouncement,
      recruitmentConfig: {
        noticeTitle: recruitmentNoticeTitleState,
        batchName: recruitmentAnnouncement?.batch || 'Batch 24',
        isOpen: isRecruitmentOpen,
      },
      recruitmentFormFields: recruitmentFields,
      setRecruitmentFormFields: setRecruitmentFields,
      recruitmentFields,
      setRecruitmentFields,
      recruitmentApplicants,
      applicants: recruitmentApplicants,
      addRecruitmentApplicant,
      addApplicant: addRecruitmentApplicant,
      updateApplicantStatus,
      updateRecruitmentApplicant,
      deleteRecruitmentApplicant,
      deleteApplicant: deleteRecruitmentApplicant,
      exportApplicantsToExcel,
      refreshRecruitmentApplicants,
      recruitmentSignatories,
      updateRecruitmentSignatories,
      resetRecruitmentSignatories,
    }),
    [
      isRecruitmentOpen,
      recruitmentNoticeTitleState,
      recruitmentAnnouncement,
      recruitmentFields,
      recruitmentApplicants,
      addRecruitmentApplicant,
      updateApplicantStatus,
      updateRecruitmentApplicant,
      deleteRecruitmentApplicant,
      exportApplicantsToExcel,
      refreshRecruitmentApplicants,
      recruitmentSignatories,
      updateRecruitmentSignatories,
      resetRecruitmentSignatories,
      updateRecruitmentAnnouncement,
      deleteRecruitmentAnnouncement,
    ]
  );

  return <RecruitmentContext.Provider value={value}>{children}</RecruitmentContext.Provider>;
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
};
