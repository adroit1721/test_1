// src/utils/siteSettings.ts
import {
  fetchSiteSettingsFromApi,
  upsertSiteSettingToApi,
} from './apiClient';

/** Fetch all site settings from Express backend (with localStorage fallback) */
export async function loadAllSettings(): Promise<Record<string, any>> {
  try {
    const apiSettings = await fetchSiteSettingsFromApi();
    if (apiSettings && Object.keys(apiSettings).length > 0) {
      return apiSettings;
    }
  } catch (err) {
    console.warn('API loadAllSettings error:', err);
  }

  // Fallback to localStorage
  const localMap: Record<string, any> = {};
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ngdc_')) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              localMap[key] = JSON.parse(val);
            } catch {
              localMap[key] = val;
            }
          }
        }
      }
    } catch {}
  }
  return localMap;
}

/** Upsert a single setting to localStorage and Express backend */
export async function upsertSetting(key: string, value: any): Promise<void> {
  // 1. Immediate localStorage synchronous write
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch {}
  }

  // 2. Write to Express backend
  if (key !== 'ngdc_cadet_users_v8' && key !== 'ngdc_cadet_users') {
    upsertSiteSettingToApi(key, value).catch((err) => {
      console.warn(`Failed to sync setting "${key}" to backend:`, err);
    });
  }
}
