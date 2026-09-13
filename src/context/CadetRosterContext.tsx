import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { safeStorage } from '../utils/safeStorage';
import {
  CadetUserAccount,
  CadetRankHierarchyItem,
  FormFieldConfig,
  PlatoonCategory,
  PlatoonSection,
  CadetPendingUpdate,
  TrainingManual,
} from '../types';
import {
  fetchCadetsFromApi,
  upsertCadetToApi,
  registerPublicCadetToApi,
  deleteCadetFromApi,
  submitCadetProfileUpdateRequestToApi,
  fetchPendingProfileUpdatesFromApi,
  resolvePendingProfileUpdateFromApi,
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

const sessionStorage = {
  getItem: (k: string) => safeStorage.getSessionItem(k),
  setItem: (k: string, v: string) => safeStorage.setSessionItem(k, v),
  removeItem: (k: string) => safeStorage.removeSessionItem(k),
  clear: () => {},
};

export const isSampleCadet = (id?: string): boolean => {
  if (!id) return false;
  const str = String(id).trim().toLowerCase();
  return str.startsWith('c-male-') || str.startsWith('c-female-') || str.startsWith('c-band-');
};

const DEFAULT_CADET_RANKS: CadetRankHierarchyItem[] = [
  { id: 'rank-1', rank: 'Cadet (Cdt)', holderName: 'Basic Trainee Cadets', description: 'Entry rank awarded upon physical assessment, enrolment clearance, and preliminary uniform issue.', order: 1, image: '' },
  { id: 'rank-2', rank: 'Lance Corporal (LCpl)', holderName: 'Tanvir Hossain & 4 Others', description: 'Assistant Section 2IC. Earned through passing written theory, drill cadence, and first aid qualification.', order: 2, image: '' },
  { id: 'rank-3', rank: 'Corporal (Cpl)', holderName: 'Tariqul Karim & 3 Others', description: 'Section 2IC. Commands squad files on parade ground and assists in platoon armory logistics.', order: 3, image: '' },
  { id: 'rank-4', rank: 'Sergeant (Sgt)', holderName: 'Sumaiya Akter & Nahid Islam', description: 'Section Commander. Directs tactical field maneuvers, squad firing lines, and disaster relief.', order: 4, image: '' },
  { id: 'rank-5', rank: 'Cadet Sergeant Major (CSM)', holderName: 'Ariful Islam', description: 'Platoon Senior NCO. Enforces parade ground discipline, uniform standards, and daily roll calls.', order: 5, image: '' },
  { id: 'rank-6', rank: 'Cadet Under Officer (CUO)', holderName: 'Hasan Mahmud', description: 'Highest Cadet Rank. Commands the entire New Govt. Degree College Platoon under the PUO.', order: 6, image: '' },
];

const DEFAULT_CADET_CORNER_MODULES = [
  { id: 'mod-1', title: 'Platoon Roll Call & Attendance', description: 'Daily morning parade attendance registers and physical fitness scoring.', icon: 'ClipboardCheck', status: 'Active' },
  { id: 'mod-2', title: 'Camp Preparation & Kit List', description: 'Standard kit checklist, webbing, bayonet scabbard, and uniform alignment guide.', icon: 'Shield', status: 'Active' },
  { id: 'mod-3', title: 'Cadet Knowledge Vault', description: 'Military abbreviations, BNCC Act regulations, drill commands, and firing fundamentals.', icon: 'BookOpen', status: 'Active' },
];

const DEFAULT_CADET_REG_FIELDS: FormFieldConfig[] = [
  { id: 'cr-1', label: 'Cadet Full Name', type: 'text', placeholder: 'Enter cadet full name', required: true },
  { id: 'cr-2', label: 'Platoon Category', type: 'select', required: true, options: ['Male Platoon', 'Female Platoon', 'Band Platoon', 'Ex-cadets'] },
  { id: 'cr-3', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female'] },
  { id: 'cr-4', label: 'Cadet Rank / Desired Rank', type: 'select', required: true, options: ['Cadet Under Officer/CUO', 'Cadet Seargent', 'Cadet Corporal', 'Cadet Lance Corporal', 'Cadet'] },
  { id: 'cr-5', label: 'College Roll / Student ID', type: 'text', placeholder: 'e.g. NGDC-110492 or Roll 204', required: true },
  { id: 'cr-6', label: 'Department / Group', type: 'text', placeholder: 'e.g. Dept. of Physics', required: true },
  { id: 'cr-7', label: 'Batch / Enrolment Session', type: 'text', placeholder: 'e.g. Batch 24 (2024-2025)', required: true },
  { id: 'cr-8', label: 'Blood Group', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  { id: 'cr-9', label: 'Contact Mobile Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
  { id: 'cr-10', label: 'Email Address', type: 'email', placeholder: 'cadet@example.com', required: false },
  { id: 'cr-11', label: 'Section Preference / Designation', type: 'select', required: false, options: ['Section 01', 'Section 02', 'Section 03', 'Band Section', 'Platoon HQ', 'Ex-Cadet Alumni'] },
];

const DEFAULT_TRAINING_MANUALS: TrainingManual[] = [
  {
    id: 'tm-1',
    title: 'BNCC Squad & Platoon Drill Manual 2024',
    category: 'Drill',
    description: 'Official Bangladesh National Cadet Corps foot drill movements, words of command, and ceremonial parade protocol.',
    fileUrl: 'https://bncc.gov.bd/sites/default/files/files/bncc.portal.gov.bd/publications/drill_manual.pdf',
    fileSize: '2.4 MB',
    addedAt: '2026-01-15',
    uploadedBy: 'Platoon HQ',
  },
  {
    id: 'tm-2',
    title: 'Small Arms & Rifle Firing Technique Guide',
    category: 'Weapons',
    description: 'Basic safety precautions, stripping and assembling, loading/unloading rules, and target aiming techniques.',
    fileUrl: 'https://bncc.gov.bd/sites/default/files/files/bncc.portal.gov.bd/publications/weapon_training.pdf',
    fileSize: '1.8 MB',
    addedAt: '2026-02-01',
    uploadedBy: 'Platoon HQ',
  },
  {
    id: 'tm-3',
    title: 'Military Map Reading & Compass Orientation',
    category: 'Map Reading',
    description: 'Grid references, conventional signs, calculating bearings using prismatic compass, and field sketch drawing.',
    fileUrl: 'https://bncc.gov.bd/sites/default/files/files/bncc.portal.gov.bd/publications/map_reading.pdf',
    fileSize: '3.1 MB',
    addedAt: '2026-02-10',
    uploadedBy: 'Platoon HQ',
  },
];

interface CadetRosterContextType {
  cadetUsers: CadetUserAccount[];
  cadetAccounts: CadetUserAccount[];
  cadetRegFields: FormFieldConfig[];
  setCadetRegFields: React.Dispatch<React.SetStateAction<FormFieldConfig[]>>;
  cadetRanks: CadetRankHierarchyItem[];
  rankHierarchy: CadetRankHierarchyItem[];
  cadetCornerModules: any[];
  pendingProfileUpdates: CadetPendingUpdate[];
  activeCadetAuth: CadetUserAccount | null;
  trainingManuals: TrainingManual[];
  
  addCadetUser: (user: Omit<CadetUserAccount, 'id'>) => void;
  updateCadetUser: (id: string, user: Partial<CadetUserAccount>, originalCadetNo?: string) => void;
  deleteCadetUser: (id: string, cadetNo?: string) => void;
  approveCadetApplicant: (
    id: string,
    options: {
      password: string;
      category?: PlatoonCategory;
      section?: string;
      rank?: string;
      cadetNo?: string;
    }
  ) => void;
  clearAllCadetUsers: () => void;
  
  cadetLogin: (cadetNo: string, pass: string) => { success: boolean; message: string; cadet?: CadetUserAccount };
  cadetRegister: (cadetData: Partial<CadetUserAccount>) => { success: boolean; message: string; cadet?: CadetUserAccount };
  cadetLogout: () => void;
  
  refreshPendingProfileUpdates: () => Promise<void>;
  requestProfileUpdate: (cadetNo: string, changes: Partial<CadetUserAccount>) => Promise<{ success: boolean; message: string }>;
  approveProfileUpdate: (requestId: string) => void;
  rejectProfileUpdate: (requestId: string) => void;
  
  addTrainingManual: (manual: Omit<TrainingManual, 'id' | 'addedAt'>) => string;
  deleteTrainingManual: (id: string) => void;
  verifyCadet: (cadetNo: string) => CadetUserAccount | null;
  
  addCadetRank: (rank: Omit<CadetRankHierarchyItem, 'id'>) => void;
  updateCadetRank: (id: string, rank: Partial<CadetRankHierarchyItem>) => void;
  deleteCadetRank: (id: string) => void;
  
  syncCadetsWithCloud: () => Promise<boolean | void>;
  syncCadetsWithSupabase: () => Promise<boolean | void>;
}

const CadetRosterContext = createContext<CadetRosterContextType | undefined>(undefined);

export const CadetRosterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lastLocalWriteTimestamps = useRef<Record<string, number>>({});
  const deletedCadetTombstones = useRef<Set<string>>((() => {
    const s = new Set<string>();
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ngdc_deleted_cadets_tombstones');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr)) {
            arr.forEach((x) => {
              const str = String(x || '').trim();
              if (str && str.startsWith('usr-')) {
                s.add(str);
                s.add(str.toUpperCase());
              }
            });
          }
        }
      } catch {}
    }
    return s;
  })());

  const isCadetTombstoned = useCallback((id?: string): boolean => {
    const cleanId = String(id || '').trim();
    if (cleanId && cleanId.length > 2) {
      return deletedCadetTombstones.current.has(cleanId) || deletedCadetTombstones.current.has(cleanId.toUpperCase());
    }
    return false;
  }, []);

  const addCadetTombstone = useCallback((id: string) => {
    const cleanId = String(id || '').trim();
    if (cleanId && cleanId.length > 2) {
      deletedCadetTombstones.current.add(cleanId);
      deletedCadetTombstones.current.add(cleanId.toUpperCase());
      try {
        localStorage.setItem('ngdc_deleted_cadets_tombstones', JSON.stringify(Array.from(deletedCadetTombstones.current)));
      } catch {}
    }
  }, []);

  const removeCadetTombstone = useCallback((id?: string) => {
    const cleanId = String(id || '').trim();
    if (cleanId) {
      deletedCadetTombstones.current.delete(cleanId);
      deletedCadetTombstones.current.delete(cleanId.toUpperCase());
      try {
        localStorage.setItem('ngdc_deleted_cadets_tombstones', JSON.stringify(Array.from(deletedCadetTombstones.current)));
      } catch {}
    }
  }, []);

  const [cadetRegFields, setCadetRegFieldsState] = useState<FormFieldConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_cadet_reg_fields');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DEFAULT_CADET_REG_FIELDS;
  });

  const setCadetRegFields = useCallback((action: React.SetStateAction<FormFieldConfig[]>) => {
    setCadetRegFieldsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      try {
        localStorage.setItem('ngdc_cadet_reg_fields', JSON.stringify(next));
      } catch {}
      upsertSiteSettingToApi('ngdc_cadet_reg_fields', next);
      return next;
    });
  }, []);

  const [cadetRanks, setCadetRanks] = useState<CadetRankHierarchyItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_cadet_ranks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DEFAULT_CADET_RANKS;
  });

  const setCadetRanksAndSave = useCallback((action: React.SetStateAction<CadetRankHierarchyItem[]>) => {
    setCadetRanks((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      try {
        localStorage.setItem('ngdc_cadet_ranks', JSON.stringify(next));
      } catch {}
      upsertSiteSettingToApi('ngdc_cadet_ranks', next);
      return next;
    });
  }, []);

  const addCadetRank = useCallback((rank: Omit<CadetRankHierarchyItem, 'id'>) => {
    const newRank: CadetRankHierarchyItem = { ...rank, id: `rank-${Date.now()}` };
    setCadetRanksAndSave((prev) => [...prev, newRank]);
  }, [setCadetRanksAndSave]);

  const updateCadetRank = useCallback((id: string, rank: Partial<CadetRankHierarchyItem>) => {
    setCadetRanksAndSave((prev) => prev.map((r) => (r.id === id ? { ...r, ...rank } : r)));
  }, [setCadetRanksAndSave]);

  const deleteCadetRank = useCallback((id: string) => {
    setCadetRanksAndSave((prev) => prev.filter((r) => r.id !== id));
  }, [setCadetRanksAndSave]);

  const [cadetUsers, setCadetUsers] = useState<CadetUserAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const savedV8 = localStorage.getItem('ngdc_cadet_users_v8');
      if (savedV8 !== null) {
        try {
          const parsed = JSON.parse(savedV8);
          if (Array.isArray(parsed)) {
            return parsed.filter((c) => !isCadetTombstoned(c.id) && !isSampleCadet(c.id));
          }
        } catch {}
      }
    }
    return [];
  });

  const setCadetUsersAndSave = useCallback((action: React.SetStateAction<CadetUserAccount[]>) => {
    setCadetUsers((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      try {
        localStorage.setItem('ngdc_cadet_users_v8', JSON.stringify(next));
        localStorage.setItem('ngdc_cadet_users', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const mergeCadetLists = useCallback((existingList: CadetUserAccount[], incomingList: CadetUserAccount[]): CadetUserAccount[] => {
    const map = new Map<string, CadetUserAccount>();
    const now = Date.now();
    for (const item of existingList) {
      if (!item || !item.id) continue;
      if (isCadetTombstoned(item.id) || isSampleCadet(item.id)) continue;
      map.set(item.id, item);
    }
    for (const item of incomingList) {
      if (!item || !item.id) continue;
      if (isCadetTombstoned(item.id) || isSampleCadet(item.id)) continue;
      const targetId = item.id;
      const cadetNo = item.cadetNo ? item.cadetNo.trim().toUpperCase() : '';
      const lastWrittenId = lastLocalWriteTimestamps.current[targetId] || 0;
      const lastWrittenNo = cadetNo ? (lastLocalWriteTimestamps.current[cadetNo] || 0) : 0;
      if (now - lastWrittenId < 10000 || now - lastWrittenNo < 10000) {
        continue;
      }
      map.set(targetId, { ...map.get(targetId), ...item });
    }
    return Array.from(map.values());
  }, [isCadetTombstoned]);

  const syncCadetsWithCloud = useCallback(async () => {
    try {
      const dbCadets = await fetchCadetsFromApi(true);
      if (dbCadets && Array.isArray(dbCadets)) {
        const valid = dbCadets.filter((c) => c && c.id && !isCadetTombstoned(c.id) && !isSampleCadet(c.id));
        setCadetUsers((prev) => {
          const merged = mergeCadetLists(prev, valid);
          try {
            localStorage.setItem('ngdc_cadet_users_v8', JSON.stringify(merged));
            localStorage.setItem('ngdc_cadet_users', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      fetchSiteSettingsFromApi(true).then((settings) => {
        if (settings) {
          if (Array.isArray(settings.ngdc_cadet_reg_fields) && settings.ngdc_cadet_reg_fields.length > 0) {
            setCadetRegFieldsState(settings.ngdc_cadet_reg_fields);
          }
          if (Array.isArray(settings.ngdc_cadet_ranks) && settings.ngdc_cadet_ranks.length > 0) {
            setCadetRanks(settings.ngdc_cadet_ranks);
          }
          if (Array.isArray(settings.ngdc_training_manuals) && settings.ngdc_training_manuals.length > 0) {
            setTrainingManuals(settings.ngdc_training_manuals);
          }
          if (Array.isArray(settings.ngdc_cadet_pending_updates)) {
            setPendingProfileUpdates(settings.ngdc_cadet_pending_updates);
          }
        }
      }).catch(() => {});

      return true;
    } catch (err) {
      console.warn('Manual remote sync failed:', err);
    }
  }, [isCadetTombstoned, mergeCadetLists]);

  useEffect(() => {
    syncCadetsWithCloud();

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      if (detail.collection === 'cadets') {
        if (detail.action === 'delete') {
          const id = detail.payload?.id || detail.payload;
          if (id) {
            setCadetUsers((prev) => prev.filter((c) => c.id !== id && c.cadetNo !== id));
          }
        } else if (detail.action === 'bulk' && Array.isArray(detail.payload)) {
          setCadetUsers((prev) => mergeCadetLists(prev, detail.payload));
        } else if (detail.payload && typeof detail.payload === 'object') {
          const updated = detail.payload;
          if (updated.id) {
            setCadetUsers((prev) => {
              const exists = prev.some((c) => c.id === updated.id);
              if (exists) {
                return prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
              }
              return [updated, ...prev];
            });
          }
        }
      } else if (detail.collection === 'site_settings') {
        if (detail.key === 'ngdc_cadet_reg_fields' && Array.isArray(detail.value)) {
          setCadetRegFieldsState(detail.value);
        } else if (detail.key === 'ngdc_cadet_ranks' && Array.isArray(detail.value)) {
          setCadetRanks(detail.value);
        } else if (detail.key === 'ngdc_training_manuals' && Array.isArray(detail.value)) {
          setTrainingManuals(detail.value);
        } else if (detail.key === 'ngdc_cadet_pending_updates' && Array.isArray(detail.value)) {
          setPendingProfileUpdates(detail.value);
        }
      }
    };

    window.addEventListener('ngdc-sync-event', handleSync);
    return () => {
      window.removeEventListener('ngdc-sync-event', handleSync);
    };
  }, [syncCadetsWithCloud, mergeCadetLists]);

  const addCadetUser = useCallback((user: Omit<CadetUserAccount, 'id'>) => {
    const category: PlatoonCategory = user.category || 'Male Platoon';
    const newUser: CadetUserAccount = {
      ...user,
      id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      category,
      platoon: user.platoon || category,
      section: user.section || (category === 'Band Platoon' ? 'Band Section 01' : 'Section 01'),
      status: user.status || (category === 'Ex-cadets' ? 'Alumni' : 'Active'),
      cadetType: user.cadetType || (category === 'Ex-cadets' ? 'Ex-cadet' : 'Current'),
      isApproved: user.isApproved !== undefined ? user.isApproved : true,
    };

    removeCadetTombstone(newUser.id);
    if (newUser.cadetNo) {
      lastLocalWriteTimestamps.current[newUser.cadetNo.trim().toUpperCase()] = Date.now();
    }
    lastLocalWriteTimestamps.current[newUser.id] = Date.now();

    setCadetUsersAndSave((prev) => [newUser, ...prev]);

    try {
      upsertCadetToApi(newUser);
    } catch (err) {
      console.warn('Failed to upsert cadet to API:', err);
    }
  }, [removeCadetTombstone, setCadetUsersAndSave]);

  const [activeCadetAuth, setActiveCadetAuth] = useState<CadetUserAccount | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('ngdc_active_cadet_auth');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return null;
  });

  const updateCadetUser = useCallback((id: string, user: Partial<CadetUserAccount>, originalCadetNo?: string) => {
    const targetId = String(id || '').trim();
    const targetCadetNo = user.cadetNo ? String(user.cadetNo).trim().toUpperCase() : '';
    const origCadetNo = originalCadetNo ? String(originalCadetNo).trim().toUpperCase() : '';

    removeCadetTombstone(targetId);

    const now = Date.now();
    if (targetId) lastLocalWriteTimestamps.current[targetId] = now;
    if (targetCadetNo) lastLocalWriteTimestamps.current[targetCadetNo] = now;
    if (origCadetNo) lastLocalWriteTimestamps.current[origCadetNo] = now;

    let updatedCadetRef: CadetUserAccount | null = null;

    setCadetUsersAndSave((prev) => {
      const existing = prev.find((u) => {
        if (!u) return false;
        if (targetId && String(u.id || '').trim() === targetId) return true;
        if (origCadetNo && String(u.cadetNo || '').trim().toUpperCase() === origCadetNo) return true;
        if (targetCadetNo && String(u.cadetNo || '').trim().toUpperCase() === targetCadetNo) return true;
        return false;
      });

      const category = (user.category || user.platoon || existing?.category || existing?.platoon || 'Male Platoon') as PlatoonCategory;
      const platoon = (user.platoon || user.category || existing?.platoon || existing?.category || 'Male Platoon') as any;
      const rank = user.rank || existing?.rank || 'Cadet (CDT)';
      const status = user.status || existing?.status || 'Active';
      const isApproved = user.isApproved !== undefined ? user.isApproved : (existing?.isApproved !== undefined ? existing.isApproved : true);

      // Prioritize preserving existing canonical ID so updates never fork or duplicate in MongoDB
      const canonicalId =
        (existing?.id && !/^\d{6,}$/.test(String(existing.id)))
          ? existing.id
          : (targetId && !/^\d{6,}$/.test(targetId))
          ? targetId
          : (existing?.id || targetId || `usr-${Date.now()}`);

      const updatedCadet: CadetUserAccount = {
        ...(existing || {}),
        ...user,
        id: canonicalId,
        cadetNo: targetCadetNo || origCadetNo || existing?.cadetNo || `NGDC-${Math.floor(1000 + Math.random() * 9000)}`,
        password: user.password || existing?.password || 'cadet123',
        name: user.name || existing?.name || 'Cadet',
        category,
        platoon,
        rank,
        status,
        isApproved,
      } as CadetUserAccount;

      updatedCadetRef = updatedCadet;

      if (updatedCadet.id) lastLocalWriteTimestamps.current[updatedCadet.id] = now;
      if (updatedCadet.cadetNo) lastLocalWriteTimestamps.current[updatedCadet.cadetNo.trim().toUpperCase()] = now;

      let found = false;
      const next = prev.map((u) => {
        if (!u) return u;
        const matches =
          (canonicalId && String(u.id || '').trim() === canonicalId) ||
          (origCadetNo && String(u.cadetNo || '').trim().toUpperCase() === origCadetNo) ||
          (targetCadetNo && String(u.cadetNo || '').trim().toUpperCase() === targetCadetNo);
        if (!matches) return u;
        found = true;
        return updatedCadet;
      });

      if (!found) {
        return [updatedCadet, ...next];
      }
      return next;
    });

    if (activeCadetAuth) {
      const activeId = String(activeCadetAuth.id || '').trim();
      const activeNo = String(activeCadetAuth.cadetNo || '').trim().toUpperCase();
      if ((targetId && activeId === targetId) || (targetCadetNo && activeNo === targetCadetNo)) {
        setActiveCadetAuth((prevAuth) => {
          if (!prevAuth) return null;
          const updatedAuth = { ...prevAuth, ...user, ...updatedCadetRef };
          try {
            sessionStorage.setItem('ngdc_active_cadet_auth', JSON.stringify(updatedAuth));
          } catch {}
          return updatedAuth;
        });
      }
    }

    if (updatedCadetRef) {
      try {
        upsertCadetToApi(updatedCadetRef);
      } catch (err) {
        console.warn('Failed to update cadet in API:', err);
      }
    }
  }, [removeCadetTombstone, setCadetUsersAndSave, activeCadetAuth]);

  const deleteCadetUser = useCallback((id: string, cadetNo?: string) => {
    const normalizedId = String(id || '').trim();
    addCadetTombstone(normalizedId);
    if (normalizedId) lastLocalWriteTimestamps.current[normalizedId] = Date.now();

    setCadetUsersAndSave((prev) => prev.filter((u) => u && String(u.id || '').trim() !== normalizedId));

    try {
      deleteCadetFromApi(normalizedId, cadetNo);
    } catch (err) {
      console.warn('Failed to delete cadet from API:', err);
    }
  }, [addCadetTombstone, setCadetUsersAndSave]);

  const approveCadetApplicant = useCallback((
    id: string,
    options: { password: string; category?: PlatoonCategory; section?: string; rank?: string; cadetNo?: string }
  ) => {
    const targetId = String(id || '').trim();
    removeCadetTombstone(targetId);

    const now = Date.now();
    if (targetId) lastLocalWriteTimestamps.current[targetId] = now;

    setCadetUsersAndSave((prev) => {
      const existing = prev.find((c) => c && targetId && String(c.id).trim() === targetId);
      const targetCategory: PlatoonCategory = options.category || (existing ? existing.category : 'Male Platoon') || 'Male Platoon';
      const isExCadet = (existing && existing.cadetType === 'Ex-cadet') || targetCategory === 'Ex-cadets';

      const finalApprovedCadet: CadetUserAccount = existing
        ? {
            ...existing,
            cadetNo: options.cadetNo?.trim() || existing.cadetNo,
            password: options.password?.trim() || existing.password || 'cadet123',
            category: targetCategory,
            platoon: isExCadet ? 'Ex-cadets Alumni' : targetCategory,
            section: options.section || existing.section || 'Section 01',
            rank: options.rank || existing.rank || 'Cadet (CDT)',
            status: isExCadet ? 'Alumni' : 'Active',
            cadetType: isExCadet ? 'Ex-cadet' : 'Current',
            isApproved: true,
          }
        : {
            id: targetId || `usr-${Date.now()}`,
            cadetNo: options.cadetNo?.trim() || `NGDC-${Math.floor(1000 + Math.random() * 9000)}`,
            password: options.password?.trim() || 'cadet123',
            name: 'Cadet',
            category: targetCategory,
            platoon: isExCadet ? 'Ex-cadets Alumni' : targetCategory,
            section: options.section || 'Section 01',
            rank: options.rank || 'Cadet (CDT)',
            status: isExCadet ? 'Alumni' : 'Active',
            cadetType: isExCadet ? 'Ex-cadet' : 'Current',
            isApproved: true,
            gender: targetCategory === 'Female Platoon' ? 'Female' : 'Male',
            appointment: 'Cadet Trainee',
            batch: 'Batch 24',
            collegeId: '',
            department: '',
            bloodGroup: 'B+',
            phone: '',
            email: '',
            joiningDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            attendancePercentage: 100,
            paradesAttended: 24,
            totalParades: 24,
            campsAttended: [],
            certificates: [],
            avatarUrl: '',
          };

      try {
        upsertCadetToApi(finalApprovedCadet);
      } catch (err) {
        console.warn('Failed to upsert approved cadet to API:', err);
      }

      let found = false;
      const next = prev.map((c) => {
        if (c && targetId && String(c.id).trim() === targetId) {
          found = true;
          return finalApprovedCadet;
        }
        return c;
      });
      return found ? next : [finalApprovedCadet, ...next];
    });
  }, [removeCadetTombstone, setCadetUsersAndSave]);

  const clearAllCadetUsers = useCallback(() => {
    cadetUsers.forEach((c) => addCadetTombstone(c.id));
    setCadetUsersAndSave([]);
  }, [cadetUsers, addCadetTombstone, setCadetUsersAndSave]);

  const cadetLogin = useCallback((cadetNo: string, pass: string) => {
    const normalizedNo = cadetNo.trim().toUpperCase();
    const found = cadetUsers.find(
      (u) => u.cadetNo.trim().toUpperCase() === normalizedNo || (u.collegeId && u.collegeId.trim().toUpperCase() === normalizedNo)
    );

    if (!found) {
      return { success: false, message: 'Cadet ID or College Roll not found in platoon directory.' };
    }

    if (!found.isApproved || found.status === 'Pending Approval') {
      return {
        success: false,
        message: 'Your registration is pending review by Platoon Administration.',
        cadet: found,
      };
    }

    if (!found.password || found.password !== pass) {
      return { success: false, message: 'Incorrect Password. Please check with Platoon Admin for assigned password.' };
    }

    setActiveCadetAuth(found);
    try {
      sessionStorage.setItem('ngdc_active_cadet_auth', JSON.stringify(found));
      sessionStorage.setItem('ngdc_bncc_cadet_auth', 'true');
    } catch {}
    return { success: true, message: `Welcome back, ${found.rank} ${found.name}!`, cadet: found };
  }, [cadetUsers]);

  const cadetRegister = useCallback((cadetData: Partial<CadetUserAccount>) => {
    const cadetName = cadetData.name?.trim() || '';
    if (!cadetName) {
      return { success: false, message: 'Cadet Name is required.' };
    }

    const proposedId = cadetData.cadetNo?.trim().toUpperCase() || `NGDC-${Math.floor(1000 + Math.random() * 9000)}`;
    const isEx = cadetData.cadetType === 'Ex-cadet' || cadetData.category === 'Ex-cadets';
    const category: PlatoonCategory = isEx ? 'Ex-cadets' : (cadetData.category || 'Male Platoon');
    const isApproved = cadetData.isApproved !== undefined ? cadetData.isApproved : true;
    const initialStatus = cadetData.status || (isApproved ? (isEx ? 'Alumni' : 'Active') : 'Pending Approval');

    const newCadet: CadetUserAccount = {
      id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      cadetNo: proposedId,
      password: cadetData.password?.trim() || 'cadet123',
      name: cadetName,
      category,
      platoon: isEx ? 'Ex-cadets Alumni' : category,
      section: cadetData.section || 'Section 01',
      rank: cadetData.rank || 'Cadet (CDT)',
      appointment: cadetData.appointment || 'Cadet Trainee',
      batch: cadetData.batch || 'Batch 24',
      collegeId: cadetData.collegeId || proposedId,
      department: cadetData.department || 'General',
      bloodGroup: cadetData.bloodGroup || 'B+',
      phone: cadetData.phone || '',
      email: cadetData.email || '',
      joiningDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      attendancePercentage: 100,
      paradesAttended: 24,
      totalParades: 24,
      campsAttended: [],
      certificates: [],
      status: initialStatus,
      cadetType: isEx ? 'Ex-cadet' : 'Current',
      isApproved,
      avatarUrl: cadetData.avatarUrl || '',
    };

    removeCadetTombstone(newCadet.id);
    setCadetUsersAndSave((prev) => [newCadet, ...prev]);

    try {
      if (!isApproved) {
        registerPublicCadetToApi(newCadet);
      } else {
        upsertCadetToApi(newCadet);
      }
    } catch (err) {
      console.warn('Failed to register cadet to API:', err);
    }

    return {
      success: true,
      message: 'Cadet registered successfully!',
      cadet: newCadet,
    };
  }, [removeCadetTombstone, setCadetUsersAndSave]);

  const cadetLogout = useCallback(() => {
    setActiveCadetAuth(null);
    try {
      sessionStorage.removeItem('ngdc_active_cadet_auth');
      sessionStorage.removeItem('ngdc_bncc_cadet_auth');
    } catch {}
  }, []);

  const [pendingProfileUpdates, setPendingProfileUpdates] = useState<CadetPendingUpdate[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_cadet_pending_updates');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });

  const refreshPendingProfileUpdates = useCallback(async () => {
    try {
      const dbUpdates = await fetchPendingProfileUpdatesFromApi();
      if (Array.isArray(dbUpdates)) {
        setPendingProfileUpdates(dbUpdates);
        try {
          localStorage.setItem('ngdc_cadet_pending_updates', JSON.stringify(dbUpdates));
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to fetch pending profile updates:', err);
    }
  }, []);

  useEffect(() => {
    refreshPendingProfileUpdates();
  }, [refreshPendingProfileUpdates]);

  const requestProfileUpdate = useCallback(async (cadetNo: string, changes: Partial<CadetUserAccount>) => {
    const rawNo = String(cadetNo || '').trim().toUpperCase();
    const existing = cadetUsers.find((c) => String(c.cadetNo || '').trim().toUpperCase() === rawNo);
    const cadetName = changes.name || existing?.name || existing?.fullName || 'Cadet';

    const updateReq: CadetPendingUpdate = {
      id: `upd-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      cadetId: existing?.id,
      cadetNo: rawNo,
      cadetName,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      changes,
    };

    setPendingProfileUpdates((prev) => {
      const next = [updateReq, ...prev.filter((p) => p.id !== updateReq.id)];
      try {
        localStorage.setItem('ngdc_cadet_pending_updates', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      await submitCadetProfileUpdateRequestToApi(updateReq);
    } catch (err) {
      console.warn('Failed to submit profile update to API:', err);
    }
    return { success: true, message: 'Profile update request submitted to Platoon Admin for review.' };
  }, [cadetUsers]);

  const approveProfileUpdate = useCallback(async (requestId: string) => {
    const req = pendingProfileUpdates.find((p) => p.id === requestId);
    if (!req) return;

    // Apply the exact changed fields to the existing cadet
    const targetNo = req.cadetNo ? String(req.cadetNo).trim().toUpperCase() : '';
    const existingCadet = cadetUsers.find((c) =>
      (req.cadetId && c.id === req.cadetId) ||
      (targetNo && String(c.cadetNo || '').trim().toUpperCase() === targetNo)
    );

    const targetId = existingCadet?.id || req.cadetId || req.cadetNo;
    updateCadetUser(targetId, req.changes, targetNo);

    // Update local state and persist remaining
    const remaining = pendingProfileUpdates.filter((p) => p.id !== requestId);
    setPendingProfileUpdates(remaining);
    try {
      localStorage.setItem('ngdc_cadet_pending_updates', JSON.stringify(remaining));
    } catch {}

    // Resolve in backend & MongoDB so it never reappears on tab change
    try {
      await resolvePendingProfileUpdateFromApi(requestId);
    } catch (err) {
      console.warn('Failed to resolve pending update on backend:', err);
    }
  }, [pendingProfileUpdates, cadetUsers, updateCadetUser]);

  const rejectProfileUpdate = useCallback(async (requestId: string) => {
    const remaining = pendingProfileUpdates.filter((p) => p.id !== requestId);
    setPendingProfileUpdates(remaining);
    try {
      localStorage.setItem('ngdc_cadet_pending_updates', JSON.stringify(remaining));
    } catch {}

    // Resolve in backend & MongoDB so it never reappears on tab change
    try {
      await resolvePendingProfileUpdateFromApi(requestId);
    } catch (err) {
      console.warn('Failed to resolve rejected update on backend:', err);
    }
  }, [pendingProfileUpdates]);

  const [trainingManuals, setTrainingManuals] = useState<TrainingManual[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_training_manuals');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_TRAINING_MANUALS;
  });

  const addTrainingManual = useCallback((manual: Omit<TrainingManual, 'id' | 'addedAt'>) => {
    const id = `tm-${Date.now()}`;
    const newManual: TrainingManual = {
      ...manual,
      id,
      addedAt: new Date().toISOString().slice(0, 10),
    };
    setTrainingManuals((prev) => {
      const next = [newManual, ...prev];
      try { localStorage.setItem('ngdc_training_manuals', JSON.stringify(next)); } catch {}
      upsertSiteSettingToApi('ngdc_training_manuals', next);
      return next;
    });
    return id;
  }, []);

  const deleteTrainingManual = useCallback((id: string) => {
    setTrainingManuals((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try { localStorage.setItem('ngdc_training_manuals', JSON.stringify(next)); } catch {}
      upsertSiteSettingToApi('ngdc_training_manuals', next);
      return next;
    });
  }, []);

  const verifyCadet = useCallback((cadetNo: string): CadetUserAccount | null => {
    const norm = cadetNo.trim().toUpperCase();
    return cadetUsers.find((u) => u.cadetNo.trim().toUpperCase() === norm) || null;
  }, [cadetUsers]);

  const value = useMemo<CadetRosterContextType>(
    () => ({
      cadetUsers,
      cadetAccounts: cadetUsers,
      cadetRegFields,
      setCadetRegFields,
      cadetRanks,
      rankHierarchy: cadetRanks,
      cadetCornerModules: DEFAULT_CADET_CORNER_MODULES,
      pendingProfileUpdates,
      activeCadetAuth,
      trainingManuals,
      addCadetUser,
      updateCadetUser,
      deleteCadetUser,
      approveCadetApplicant,
      clearAllCadetUsers,
      cadetLogin,
      cadetRegister,
      cadetLogout,
      refreshPendingProfileUpdates,
      requestProfileUpdate,
      approveProfileUpdate,
      rejectProfileUpdate,
      addTrainingManual,
      deleteTrainingManual,
      verifyCadet,
      addCadetRank,
      updateCadetRank,
      deleteCadetRank,
      syncCadetsWithCloud,
      syncCadetsWithSupabase: syncCadetsWithCloud,
    }),
    [
      cadetUsers,
      cadetRegFields,
      cadetRanks,
      pendingProfileUpdates,
      activeCadetAuth,
      trainingManuals,
      addCadetUser,
      updateCadetUser,
      deleteCadetUser,
      approveCadetApplicant,
      clearAllCadetUsers,
      cadetLogin,
      cadetRegister,
      cadetLogout,
      refreshPendingProfileUpdates,
      requestProfileUpdate,
      approveProfileUpdate,
      rejectProfileUpdate,
      addTrainingManual,
      deleteTrainingManual,
      verifyCadet,
      addCadetRank,
      updateCadetRank,
      deleteCadetRank,
      syncCadetsWithCloud,
    ]
  );

  return <CadetRosterContext.Provider value={value}>{children}</CadetRosterContext.Provider>;
};

export const useCadetRoster = () => {
  const context = useContext(CadetRosterContext);
  if (!context) {
    throw new Error('useCadetRoster must be used within a CadetRosterProvider');
  }
  return context;
};
