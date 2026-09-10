import { useState, useEffect } from 'react';
import { ASSETS } from '../data/bnccData';
import { CANONICAL_SETTINGS } from '../data/canonicalProductionData';
import { upsertSiteSettingToApi } from './apiClient';

const STORAGE_KEY = 'ngdc_puo_custom_image_data';
const PUO_EVENT_NAME = 'ngdc_puo_photo_changed';

export function getStoredPuoImage(): string {
  const canonicalPuo = CANONICAL_SETTINGS[STORAGE_KEY];
  const defaultFallback = (typeof canonicalPuo === 'string' && canonicalPuo.trim().length > 0)
    ? canonicalPuo.trim()
    : ASSETS.puoRahman;

  if (typeof window === 'undefined') return defaultFallback;
  try {
    const custom = localStorage.getItem(STORAGE_KEY);
    if (custom && custom.trim().length > 0) {
      return custom;
    }
  } catch {
    // Local storage might be disabled or restricted
  }
  return defaultFallback;
}

export function savePuoImage(imageDataUrl: string, syncToApi: boolean = true) {
  try {
    localStorage.setItem(STORAGE_KEY, imageDataUrl);
    window.dispatchEvent(new CustomEvent(PUO_EVENT_NAME, { detail: imageDataUrl }));
    if (syncToApi) {
      upsertSiteSettingToApi(STORAGE_KEY, imageDataUrl).catch((err) => {
        console.warn('Failed to sync PUO image to backend:', err);
      });
    }
  } catch (err) {
    console.error('Failed to save PUO image', err);
  }
}

export function resetPuoImage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    const canonicalPuo = CANONICAL_SETTINGS[STORAGE_KEY];
    const fallback = (typeof canonicalPuo === 'string' && canonicalPuo.trim().length > 0)
      ? canonicalPuo.trim()
      : ASSETS.puoRahman;
    window.dispatchEvent(new CustomEvent(PUO_EVENT_NAME, { detail: fallback }));
    upsertSiteSettingToApi(STORAGE_KEY, '').catch(() => {});
  } catch (err) {
    console.error('Failed to reset PUO image', err);
  }
}

export function usePuoImage() {
  const [imageSrc, setImageSrc] = useState<string>(getStoredPuoImage);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setImageSrc(customEvent.detail);
      } else {
        setImageSrc(getStoredPuoImage());
      }
    };

    window.addEventListener(PUO_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PUO_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updatePhoto = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          savePuoImage(result);
          resolve();
        } else {
          reject(new Error('Failed to read image data'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  return {
    imageSrc,
    updatePhoto,
    resetToDefault: resetPuoImage,
    isCustom: imageSrc !== ASSETS.puoRahman,
  };
}
