const pendingDebounceMap = new Map<string, any>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage access blocked
    }
    return null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (err: any) {
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        // Clear non-essential old items to free space
        try {
          const keysToPrune = ['ngdc_cadet_users', 'ngdc_recruitment_applicants_old'];
          keysToPrune.forEach((k) => window.localStorage.removeItem(k));
          window.localStorage.setItem(key, value);
        } catch {}
      }
    }
  },

  // Non-blocking debounced storage to prevent main-thread freeze during heavy state syncs
  setDebounced: (key: string, value: string, delayMs = 300): void => {
    if (pendingDebounceMap.has(key)) {
      clearTimeout(pendingDebounceMap.get(key));
    }
    const timer = setTimeout(() => {
      safeStorage.setItem(key, value);
      pendingDebounceMap.delete(key);
    }, delayMs);
    pendingDebounceMap.set(key, timer);
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage access blocked
    }
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Storage access blocked
    }
  },

  key: (index: number): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.key(index);
      }
    } catch {
      // Storage access blocked
    }
    return null;
  },

  get length(): number {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.length;
      }
    } catch {
      // Storage access blocked
    }
    return 0;
  },

  getSessionItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch {
      // Storage access blocked
    }
    return null;
  },

  setSessionItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch {
      // Storage access blocked
    }
  },

  removeSessionItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch {
      // Storage access blocked
    }
  },
};
