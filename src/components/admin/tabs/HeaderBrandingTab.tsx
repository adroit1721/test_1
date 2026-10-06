import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Shield,
  Layers,
  ExternalLink,
  Copy,
  Info,
  Save,
} from 'lucide-react';
import { useAdminData } from '../../../context/AdminDataContext';
import {
  DEFAULT_HEADER_LEFT_LOGO_URL,
  DEFAULT_HEADER_RIGHT_LOGO_URL,
  DEFAULT_HEADER_TITLE,
  DEFAULT_HEADER_SUBTITLE,
} from '../../../data/defaultSiteSettings';
import { uploadImageToCloudinary } from '../../../utils/cloudinary';
import { ASSETS } from '../../../data/bnccData';

export const HeaderBrandingTab: React.FC = () => {
  const {
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
  } = useAdminData();

  // Local draft states for real-time live preview before / during save
  const [draftLeftLogo, setDraftLeftLogo] = useState(headerLeftLogoUrl || DEFAULT_HEADER_LEFT_LOGO_URL);
  const [draftRightLogo, setDraftRightLogo] = useState(headerRightLogoUrl || DEFAULT_HEADER_RIGHT_LOGO_URL);
  const [draftTitle, setDraftTitle] = useState(headerTitle || DEFAULT_HEADER_TITLE);
  const [draftSubtitle, setDraftSubtitle] = useState(headerSubtitle || DEFAULT_HEADER_SUBTITLE);

  // Dirty state flags
  const [isLeftLogoDirty, setIsLeftLogoDirty] = useState(false);
  const [isRightLogoDirty, setIsRightLogoDirty] = useState(false);
  const [isTitleDirty, setIsTitleDirty] = useState(false);
  const [isSubtitleDirty, setIsSubtitleDirty] = useState(false);

  // Sync draft states when context changes (only if not dirty)
  useEffect(() => {
    if (!isLeftLogoDirty) {
      setDraftLeftLogo(headerLeftLogoUrl || DEFAULT_HEADER_LEFT_LOGO_URL);
    }
  }, [headerLeftLogoUrl, isLeftLogoDirty]);

  useEffect(() => {
    if (!isRightLogoDirty) {
      setDraftRightLogo(headerRightLogoUrl || DEFAULT_HEADER_RIGHT_LOGO_URL);
    }
  }, [headerRightLogoUrl, isRightLogoDirty]);

  useEffect(() => {
    if (!isTitleDirty) {
      setDraftTitle(headerTitle || DEFAULT_HEADER_TITLE);
    }
  }, [headerTitle, isTitleDirty]);

  useEffect(() => {
    if (!isSubtitleDirty) {
      setDraftSubtitle(headerSubtitle || DEFAULT_HEADER_SUBTITLE);
    }
  }, [headerSubtitle, isSubtitleDirty]);

  // UI state
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [leftUploading, setLeftUploading] = useState(false);
  const [rightUploading, setRightUploading] = useState(false);
  const [leftDragOver, setLeftDragOver] = useState(false);
  const [rightDragOver, setRightDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges =
    draftLeftLogo !== headerLeftLogoUrl ||
    draftRightLogo !== headerRightLogoUrl ||
    draftTitle !== headerTitle ||
    draftSubtitle !== headerSubtitle;

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Left Logo Upload Handler
  const handleLeftFileUpload = async (file: File) => {
    if (!file) return;
    setLeftUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, 'header-branding');
      setDraftLeftLogo(url);
      await updateHeaderLeftLogoUrl(url);
      showStatus('College Crest uploaded and synchronized successfully!');
    } catch (err) {
      console.error(err);
      showStatus('Failed to upload image. Please check file format.', 'error');
    } finally {
      setLeftUploading(false);
    }
  };

  // Right Logo Upload Handler
  const handleRightFileUpload = async (file: File) => {
    if (!file) return;
    setRightUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, 'header-branding');
      setDraftRightLogo(url);
      await updateHeaderRightLogoUrl(url);
      showStatus('BNCC Emblem uploaded and synchronized successfully!');
    } catch (err) {
      console.error(err);
      showStatus('Failed to upload image. Please check file format.', 'error');
    } finally {
      setRightUploading(false);
    }
  };

  // Drag and Drop handlers for Left
  const handleLeftDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setLeftDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleLeftFileUpload(file);
    }
  };

  // Drag and Drop handlers for Right
  const handleRightDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setRightDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleRightFileUpload(file);
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updateHeaderBranding({
        headerLeftLogoUrl: draftLeftLogo,
        headerRightLogoUrl: draftRightLogo,
        headerTitle: draftTitle,
        headerSubtitle: draftSubtitle,
      });
      setIsLeftLogoDirty(false);
      setIsRightLogoDirty(false);
      setIsTitleDirty(false);
      setIsSubtitleDirty(false);
      setSaveSuccess(true);
      showStatus('Header & Branding saved and broadcast across all visitor screens!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      showStatus('Failed to persist branding changes to backend.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset all to defaults
  const handleResetAll = async () => {
    if (!window.confirm('Reset all header logos, title, and subtitle to official defaults?')) return;
    setSaving(true);
    try {
      setDraftLeftLogo(DEFAULT_HEADER_LEFT_LOGO_URL);
      setDraftRightLogo(DEFAULT_HEADER_RIGHT_LOGO_URL);
      setDraftTitle(DEFAULT_HEADER_TITLE);
      setDraftSubtitle(DEFAULT_HEADER_SUBTITLE);
      setIsLeftLogoDirty(false);
      setIsRightLogoDirty(false);
      setIsTitleDirty(false);
      setIsSubtitleDirty(false);

      await Promise.all([
        resetHeaderLeftLogoUrl(),
        resetHeaderRightLogoUrl(),
        resetHeaderTitle(),
        resetHeaderSubtitle(),
      ]);
      showStatus('All Header & Branding settings reset to defaults.');
    } catch (err) {
      console.error(err);
      showStatus('Failed to reset settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Actions Header */}
      <div className="bg-white dark:bg-[#1a1915] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Header & Dynamic Branding
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Real-time Sync
                  </span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Customize the left College Crest, right BNCC Emblem, and Platoon Header titles. Changes reflect immediately across all public visitor screens.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleResetAll}
              disabled={saving}
              className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-900/40 rounded-xl transition-colors flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 cursor-pointer disabled:opacity-50"
              title="Reset all branding values to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <button
              onClick={handleSaveAll}
              disabled={saving || !hasUnsavedChanges}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 animate-pulse'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {hasUnsavedChanges ? 'Save Changes' : 'All Changes Saved'}
                </>
              )}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Live Interactive Header Preview */}
      <div className="bg-white dark:bg-[#1a1915] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Live Header Preview
            </h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === 'desktop'
                  ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === 'mobile'
                  ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>
        </div>

        {/* Scaled Preview Frame */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-[#f5eee1] to-[#eae0cf] dark:from-[#0d0c0a] dark:to-[#171512] rounded-xl border border-[#cdc6b3]/50 dark:border-white/10 overflow-hidden flex justify-center">
          <div
            className={`w-full transition-all duration-300 ${
              previewMode === 'mobile' ? 'max-w-[390px]' : 'max-w-[1000px]'
            }`}
          >
            <div className="bg-[#fcf9f3]/70 dark:bg-[#12110e]/70 backdrop-blur-2xl border border-[#cdc6b3]/60 dark:border-white/10 rounded-2xl md:rounded-3xl py-2 px-3 sm:px-6 md:py-3 md:px-7 shadow-sm relative overflow-hidden transition-all">
              {/* Glow accents */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#eedc82]/20 dark:bg-[#eedc82]/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#6b5e10]/15 dark:bg-[#6b5e10]/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6 relative z-10">
                {/* Left Side Logo */}
                <div className="shrink-0 flex items-center">
                  <img
                    src={draftLeftLogo || DEFAULT_HEADER_LEFT_LOGO_URL}
                    alt="College Logo Preview"
                    className="h-9 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ASSETS.ngdcLogo;
                    }}
                  />
                </div>

                {/* Centered Text */}
                <div className="flex-1 min-w-0 text-center select-none px-1 sm:px-4">
                  <h1 className="text-base sm:text-2xl md:text-3xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight uppercase leading-none font-sans drop-shadow-2xs">
                    {draftTitle || 'NGDC-BNCC'}
                  </h1>
                  <p className="text-[7.5px] min-[360px]:text-[8.5px] min-[400px]:text-[9.5px] sm:text-xs md:text-sm font-medium text-[#695c4e] dark:text-[#aca596] tracking-normal mt-0.5 sm:mt-1 flex items-center justify-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span>{draftSubtitle || 'New Govt. Degree College, Rajshahi BNCC Platoon'}</span>
                  </p>
                </div>

                {/* Right Side Logo */}
                <div className="shrink-0 flex items-center">
                  <img
                    src={draftRightLogo || DEFAULT_HEADER_RIGHT_LOGO_URL}
                    alt="BNCC Crest Preview"
                    className="h-9 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ASSETS.bnccLogo;
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-2 font-mono">
              Live Preview • Exact styling as rendered on the public landing portal
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Logo Management Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: College Crest */}
        <div className="bg-white dark:bg-[#1a1915] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/40">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Left Logo: College Crest
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    New Govt. Degree College, Rajshahi Emblem
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  setDraftLeftLogo(DEFAULT_HEADER_LEFT_LOGO_URL);
                  await resetHeaderLeftLogoUrl();
                  showStatus('Left logo reset to default College Crest.');
                }}
                className="text-[11px] text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset to default College logo"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Default
              </button>
            </div>

            {/* Current Preview Box */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-4">
              <div className="w-16 h-16 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                <img
                  src={draftLeftLogo || DEFAULT_HEADER_LEFT_LOGO_URL}
                  alt="Left Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block truncate">
                  Active College Crest
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 font-mono">
                  {draftLeftLogo}
                </p>
                <span className="inline-block mt-1 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                  Recommended: Transparent PNG (approx 200×200)
                </span>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setLeftDragOver(true);
              }}
              onDragLeave={() => setLeftDragOver(false)}
              onDrop={handleLeftDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer mb-4 ${
                leftDragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/50 dark:bg-white/[0.02]'
              }`}
              onClick={() => leftFileInputRef.current?.click()}
            >
              <input
                ref={leftFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLeftFileUpload(file);
                }}
                className="hidden"
              />

              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-2">
                {leftUploading ? (
                  <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {leftUploading ? 'Uploading to Cloudinary...' : 'Drag & Drop file or click to browse'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Supports PNG, JPG, WebP, SVG with automatic compression
              </p>
            </div>

            {/* Direct Image URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                Or enter image URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftLeftLogo}
                  onChange={(e) => {
                    setDraftLeftLogo(e.target.value);
                    setIsLeftLogoDirty(true);
                  }}
                  placeholder="https://... or /assets/..."
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
                <button
                  onClick={async () => {
                    await updateHeaderLeftLogoUrl(draftLeftLogo);
                    showStatus('Left logo URL updated.');
                  }}
                  className="px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: BNCC Emblem */}
        <div className="bg-white dark:bg-[#1a1915] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/40">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Right Logo: BNCC Emblem
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Bangladesh National Cadet Corps Crest
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  setDraftRightLogo(DEFAULT_HEADER_RIGHT_LOGO_URL);
                  await resetHeaderRightLogoUrl();
                  showStatus('Right logo reset to default BNCC Crest.');
                }}
                className="text-[11px] text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset to default BNCC logo"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Default
              </button>
            </div>

            {/* Current Preview Box */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 mb-4">
              <div className="w-16 h-16 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                <img
                  src={draftRightLogo || DEFAULT_HEADER_RIGHT_LOGO_URL}
                  alt="Right Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block truncate">
                  Active BNCC Crest / Emblem
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 font-mono">
                  {draftRightLogo}
                </p>
                <span className="inline-block mt-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                  Recommended: High-resolution BNCC Crest
                </span>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setRightDragOver(true);
              }}
              onDragLeave={() => setRightDragOver(false)}
              onDrop={handleRightDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer mb-4 ${
                rightDragOver
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/50 dark:bg-white/[0.02]'
              }`}
              onClick={() => rightFileInputRef.current?.click()}
            >
              <input
                ref={rightFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleRightFileUpload(file);
                }}
                className="hidden"
              />

              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-2">
                {rightUploading ? (
                  <div className="w-5 h-5 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {rightUploading ? 'Uploading to Cloudinary...' : 'Drag & Drop file or click to browse'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Upload your new BNCC crest / right-side emblem
              </p>
            </div>

            {/* Direct Image URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                Or enter image URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftRightLogo}
                  onChange={(e) => {
                    setDraftRightLogo(e.target.value);
                    setIsRightLogoDirty(true);
                  }}
                  placeholder="https://... or /assets/..."
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
                <button
                  onClick={async () => {
                    await updateHeaderRightLogoUrl(draftRightLogo);
                    showStatus('Right logo URL updated.');
                  }}
                  className="px-3 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platoon Title & Subtitle Configuration */}
      <div className="bg-white dark:bg-[#1a1915] border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/40">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Platoon Title & Subtitle Typography
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Center text displayed between the college crest and BNCC emblem
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Platoon Title (Main Heading)
              </label>
              <button
                onClick={() => setDraftTitle(DEFAULT_HEADER_TITLE)}
                className="text-[10px] text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            </div>
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => {
                setDraftTitle(e.target.value);
                setIsTitleDirty(true);
              }}
              placeholder="e.g. NGDC-BNCC"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold uppercase"
            />
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Default: <strong className="text-gray-700 dark:text-gray-300">NGDC-BNCC</strong></span>
              <span>{draftTitle.length} characters</span>
            </div>
          </div>

          {/* Subtitle Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Platoon Subtitle (College & Unit Name)
              </label>
              <button
                onClick={() => setDraftSubtitle(DEFAULT_HEADER_SUBTITLE)}
                className="text-[10px] text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            </div>
            <input
              type="text"
              value={draftSubtitle}
              onChange={(e) => {
                setDraftSubtitle(e.target.value);
                setIsSubtitleDirty(true);
              }}
              placeholder="e.g. New Govt. Degree College, Rajshahi BNCC Platoon"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Default: <strong className="text-gray-700 dark:text-gray-300">New Govt. Degree College, Rajshahi BNCC Platoon</strong></span>
              <span>{draftSubtitle.length} characters</span>
            </div>
          </div>
        </div>

        {/* Action button bar */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4 text-amber-500" />
            <span>Changes will be broadcast over real-time WebSockets to all visitors without reloading.</span>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving || !hasUnsavedChanges}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 animate-pulse'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving to Server...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved & Synchronized!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {hasUnsavedChanges ? 'Save All Header Settings' : 'Settings Up to Date'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
