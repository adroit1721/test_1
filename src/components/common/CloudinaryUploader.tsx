import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { compressAndConvertToDataUrl } from '../../utils/cloudinary';

export interface CloudinaryUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  onUploadComplete?: (url: string) => void;
  helperText?: string;
  helpText?: string;
  folder?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'banner' | 'any';
  maxSizeMB?: number;
  label?: string;
  currentImageUrl?: string;
  [key: string]: any;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  value,
  onChange,
  onUploadComplete,
  helperText = 'Upload an image file',
  label = 'Image Upload',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const dataUrl = await compressAndConvertToDataUrl(file);
      if (onChange) onChange(dataUrl);
      if (onUploadComplete) onUploadComplete(dataUrl);
    } catch (err: unknown) {
      setError('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
        )}
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition-colors">
          <Upload className="w-3.5 h-3.5" />
          {loading ? 'Processing...' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
      {helperText && <p className="text-[11px] text-gray-500">{helperText}</p>}
      {error && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
};
