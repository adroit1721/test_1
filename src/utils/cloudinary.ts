export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName =
    (typeof window !== 'undefined' ? localStorage.getItem('ngdc_cloudinary_cloud_name') : null) ||
    'hqmx8juj';
  const uploadPreset =
    (typeof window !== 'undefined' ? localStorage.getItem('ngdc_cloudinary_upload_preset') : null) ||
    'ngdc_bncc';
  return { cloudName, uploadPreset };
}

export function isCloudinaryConfigured(): boolean {
  const config = getCloudinaryConfig();
  return !!(config.cloudName && config.uploadPreset);
}

export function getOptimizedImageUrl(url?: string, _width?: number, _height?: number, _quality?: string | number): string {
  if (!url) return '';
  return url;
}

export async function compressAndConvertToDataUrl(
  file: File,
  maxWidthOrSize: number = 600,
  maxHeight: number = 600,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        resolve('');
        return;
      }
      // If SVG or very small already, return directly
      if (file.type === 'image/svg+xml' || file.size < 20 * 1024) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const maxW = typeof maxWidthOrSize === 'number' && maxWidthOrSize > 50 ? maxWidthOrSize : 600;
          const maxH = typeof maxHeight === 'number' && maxHeight > 50 ? maxHeight : 600;

          if (width > maxW || height > maxH) {
            const ratio = Math.min(maxW / width, maxH / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with high quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality || 0.85);
          resolve(compressedDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'branding'
): Promise<string> {
  const config = getCloudinaryConfig();
  if (config.cloudName && config.uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.uploadPreset);
      if (folder) {
        formData.append('folder', folder);
      }
      const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.secure_url) {
          return data.secure_url;
        }
      }
    } catch (err) {
      console.warn('Direct Cloudinary upload failed, falling back to local compressed data URL:', err);
    }
  }
  // Safe fallback to browser-side compressed data URL
  return await compressAndConvertToDataUrl(file, 600, 600, 0.85);
}

export async function compressDataUrlIfNeeded(dataUrl: string, maxDim: number = 300, quality: number = 0.70): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) return dataUrl;
  // If smaller than 40KB, return as is
  if (dataUrl.length < 50000) return dataUrl;

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = Math.max(w, 1);
        canvas.height = Math.max(h, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function processPassportPhoto(
  file: File | string,
  _maxSizeKB: number = 300
): Promise<{ url: string; fileSizeKb: number; isCompliant: boolean }> {
  if (typeof file === 'string') {
    const compressed = await compressDataUrlIfNeeded(file, 300, 0.70);
    return {
      url: compressed,
      fileSizeKb: Math.round(compressed.length / 1024),
      isCompliant: true,
    };
  }

  // If Cloudinary CDN is configured, upload to Cloudinary directly!
  if (isCloudinaryConfigured()) {
    try {
      const cUrl = await uploadImageToCloudinary(file, 'cadet-passport-photos');
      if (cUrl && (cUrl.startsWith('http://') || cUrl.startsWith('https://'))) {
        return {
          url: cUrl,
          fileSizeKb: Math.round(file.size / 1024),
          isCompliant: true,
        };
      }
    } catch (e) {
      console.warn('Cloudinary upload failed in processPassportPhoto:', e);
    }
  }

  // Fallback: Generate 300x300 passport-spec compressed JPEG image (quality 0.70 for lightweight size ~15KB)
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      if (!raw) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(raw);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Square center crop
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);
          resolve(canvas.toDataURL('image/jpeg', 0.70));
        } catch {
          resolve(raw);
        }
      };
      img.onerror = () => resolve(raw);
      img.src = raw;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

  const fileSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
  return {
    url: dataUrl,
    fileSizeKb,
    isCompliant: true,
  };
}
