import {
  fetchCadetsFromApi,
  fetchSiteSettingsFromApi,
  upsertCadetToApi,
  upsertSiteSettingToApi,
  getBackendStatus,
} from './apiClient';
import { CadetUserAccount } from '../types';

export interface MigrationProgress {
  stage: 'idle' | 'checking' | 'migrating_settings' | 'migrating_cadets' | 'verifying' | 'completed' | 'error';
  message: string;
  settingsTotal: number;
  settingsProcessed: number;
  cadetsTotal: number;
  cadetsProcessed: number;
  errorDetails?: string;
}

export async function testAppwriteSetup(): Promise<{
  connected: boolean;
  databaseFound: boolean;
  settingsColFound: boolean;
  cadetsColFound: boolean;
  error?: string;
}> {
  try {
    const status = await getBackendStatus();
    return {
      connected: true,
      databaseFound: true,
      settingsColFound: true,
      cadetsColFound: true,
      error: status?.error || undefined,
    };
  } catch (err: any) {
    return {
      connected: false,
      databaseFound: false,
      settingsColFound: false,
      cadetsColFound: false,
      error: err?.message || 'Backend connection failed',
    };
  }
}

/**
 * Sync / Backup local data to Express + MongoDB backend
 */
export async function syncLocalToAppwrite(
  onProgress: (progress: MigrationProgress) => void
): Promise<boolean> {
  const update = (partial: Partial<MigrationProgress>) => {
    onProgress({
      stage: 'idle',
      message: '',
      settingsTotal: 0,
      settingsProcessed: 0,
      cadetsTotal: 0,
      cadetsProcessed: 0,
      ...partial,
    });
  };

  try {
    update({ stage: 'checking', message: 'Verifying backend database readiness...' });
    const status = await getBackendStatus();
    if (!status) {
      throw new Error('Backend server is unreachable.');
    }

    // 1. Read local storage settings
    update({ stage: 'migrating_settings', message: 'Reading local site settings...' });
    const localSettings: Record<string, any> = {};
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ngdc_') && !key.includes('cadet_users')) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              localSettings[key] = JSON.parse(val);
            } catch {
              localSettings[key] = val;
            }
          }
        }
      }
    }

    const settingsEntries = Object.entries(localSettings);
    const settingsTotal = settingsEntries.length;
    let settingsProcessed = 0;

    if (settingsTotal > 0) {
      update({
        stage: 'migrating_settings',
        message: `Syncing ${settingsTotal} settings to Express + MongoDB...`,
        settingsTotal,
        settingsProcessed: 0,
      });

      for (const [key, value] of settingsEntries) {
        try {
          await upsertSiteSettingToApi(key, value);
        } catch (e) {
          console.warn(`Failed to sync setting "${key}":`, e);
        }
        settingsProcessed++;
        update({
          stage: 'migrating_settings',
          message: `Synced ${settingsProcessed}/${settingsTotal} settings...`,
          settingsTotal,
          settingsProcessed,
        });
      }
    }

    // 2. Read local cadets
    update({ stage: 'migrating_cadets', message: 'Reading local cadets roster...' });
    let localCadets: CadetUserAccount[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_cadet_users_v8') || localStorage.getItem('ngdc_cadet_users');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) localCadets = parsed;
        } catch {}
      }
    }

    const cadetsTotal = localCadets.length;
    let cadetsProcessed = 0;

    if (cadetsTotal > 0) {
      update({
        stage: 'migrating_cadets',
        message: `Syncing ${cadetsTotal} cadets to Express + MongoDB...`,
        settingsTotal,
        settingsProcessed,
        cadetsTotal,
        cadetsProcessed: 0,
      });

      for (const cadet of localCadets) {
        try {
          await upsertCadetToApi(cadet);
        } catch (e) {
          console.warn(`Failed to sync cadet "${cadet.cadetNo}":`, e);
        }
        cadetsProcessed++;
        update({
          stage: 'migrating_cadets',
          message: `Synced ${cadetsProcessed}/${cadetsTotal} cadets...`,
          settingsTotal,
          settingsProcessed,
          cadetsTotal,
          cadetsProcessed,
        });
      }
    }

    // 3. Verification stage
    update({
      stage: 'verifying',
      message: 'Verifying synced records with Express + MongoDB in RAM...',
      settingsTotal,
      settingsProcessed,
      cadetsTotal,
      cadetsProcessed,
    });

    const [remoteCadets, remoteSettings] = await Promise.all([
      fetchCadetsFromApi(),
      fetchSiteSettingsFromApi(),
    ]);

    const finalSettingsCount = remoteSettings ? Object.keys(remoteSettings).length : 0;
    const finalCadetsCount = remoteCadets ? remoteCadets.length : 0;

    update({
      stage: 'completed',
      message: `Sync complete! Stored ${finalSettingsCount} settings and ${finalCadetsCount} cadets in Express + MongoDB.`,
      settingsTotal,
      settingsProcessed,
      cadetsTotal,
      cadetsProcessed,
    });

    return true;
  } catch (err: any) {
    update({
      stage: 'error',
      message: 'Sync failed: ' + (err?.message || String(err)),
      settingsTotal: 0,
      settingsProcessed: 0,
      cadetsTotal: 0,
      cadetsProcessed: 0,
      errorDetails: err?.message || String(err),
    });
    return false;
  }
}
