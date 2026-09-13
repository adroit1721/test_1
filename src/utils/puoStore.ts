import { useState, useEffect } from 'react';

const PUO_STORAGE_KEY = 'ngdc_puo_custom_image_data';

export function getPuoImage(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(PUO_STORAGE_KEY);
  }
  return null;
}

export function savePuoImage(url: string, _broadcast?: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PUO_STORAGE_KEY, url);
    window.dispatchEvent(new Event('puo-image-updated'));
  }
}

export function usePuoImage(defaultUrl: string = '') {
  const [imageUrl, setImageUrl] = useState<string>(() => getPuoImage() || defaultUrl);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getPuoImage();
      if (updated) setImageUrl(updated);
    };

    window.addEventListener('puo-image-updated', handleUpdate);
    return () => window.removeEventListener('puo-image-updated', handleUpdate);
  }, []);

  const updatePhoto = async (urlOrFile: string | File) => {
    let url = '';
    if (typeof urlOrFile === 'string') {
      url = urlOrFile;
    } else {
      url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = reject;
        reader.readAsDataURL(urlOrFile);
      });
    }
    savePuoImage(url);
    setImageUrl(url);
  };

  const resetToDefault = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PUO_STORAGE_KEY);
      window.dispatchEvent(new Event('puo-image-updated'));
    }
    setImageUrl(defaultUrl);
  };

  const isCustom = Boolean(getPuoImage());

  const result = [imageUrl, updatePhoto] as any;
  result.imageSrc = imageUrl;
  result.updatePhoto = updatePhoto;
  result.resetToDefault = resetToDefault;
  result.isCustom = isCustom;

  return result as [string, (urlOrFile: string | File) => void] & {
    imageSrc: string;
    updatePhoto: (urlOrFile: string | File) => Promise<void> | void;
    resetToDefault: () => void;
    isCustom: boolean;
  };
}
