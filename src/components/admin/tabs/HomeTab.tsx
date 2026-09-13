import React, { useState, useEffect, useRef } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { HeroSlide, ExecutiveMessageConfig } from '../../../types';
import { CloudinaryUploader } from '../../common/CloudinaryUploader';
import { HeaderBrandingTab } from './HeaderBrandingTab';
import { compressAndConvertToDataUrl } from '../../../utils/cloudinary';
import { ASSETS } from '../../../data/bnccData';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  X,
  UploadCloud,
  Sliders,
  Sparkles,
  GraduationCap,
  Award,
  RotateCcw,
  Save,
  Shield,
  Check,
  Loader2,
  Link2,
  Globe,
  ExternalLink,
} from 'lucide-react';

export const HomeTab: React.FC = () => {
  const {
    siteFavicon,
    updateSiteFavicon,
    resetSiteFavicon,
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    principalMessage,
    updatePrincipalMessage,
    resetPrincipalMessage,
    vicePrincipalMessage,
    updateVicePrincipalMessage,
    resetVicePrincipalMessage,
  } = useAdminData();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'slider' | 'favicon' | 'principal' | 'vicePrincipal'>('branding');

  // Slider State
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [slideFormData, setSlideFormData] = useState<Omit<HeroSlide, 'id'>>({
    imageUrl: '',
    badge: '',
    title: '',
    subtitle: '',
    altText: '',
    isActive: true,
  });

  // Principal Form State & Dirty Tracking
  const [principalForm, setPrincipalForm] = useState<ExecutiveMessageConfig>({ ...principalMessage });
  const [principalSavedToast, setPrincipalSavedToast] = useState(false);
  const [isPrincipalDirty, setIsPrincipalDirty] = useState(false);
  const [isSavingPrincipal, setIsSavingPrincipal] = useState(false);
  const isPrincipalLoaded = useRef(false);

  // Vice-Principal Form State & Dirty Tracking
  const [vicePrincipalForm, setVicePrincipalForm] = useState<ExecutiveMessageConfig>({ ...vicePrincipalMessage });
  const [vicePrincipalSavedToast, setVicePrincipalSavedToast] = useState(false);
  const [isVicePrincipalDirty, setIsVicePrincipalDirty] = useState(false);
  const [isSavingVicePrincipal, setIsSavingVicePrincipal] = useState(false);
  const isVicePrincipalLoaded = useRef(false);

  // Favicon State & Dirty Tracking
  const [faviconUrl, setFaviconUrl] = useState<string>(siteFavicon || '/favicon.png');
  const [faviconSavedToast, setFaviconSavedToast] = useState(false);
  const [isFaviconDirty, setIsFaviconDirty] = useState(false);
  const [isSavingFavicon, setIsSavingFavicon] = useState(false);
  const isFaviconLoaded = useRef(false);

  useEffect(() => {
    if (!isFaviconDirty && siteFavicon) {
      setFaviconUrl(siteFavicon);
    }
  }, [siteFavicon, isFaviconDirty]);

  const handleFaviconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimizedUrl = await compressAndConvertToDataUrl(file, 256, 256, 0.9);
      if (optimizedUrl) {
        setFaviconUrl(optimizedUrl);
        setIsFaviconDirty(true);
      }
    } catch (err) {
      console.warn('Favicon file processing failed:', err);
    }
  };

  const handleSaveFavicon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingFavicon(true);
    try {
      await updateSiteFavicon(faviconUrl);
      setIsFaviconDirty(false);
      setFaviconSavedToast(true);
      setTimeout(() => setFaviconSavedToast(false), 3500);
    } catch (err) {
      console.error('Failed to save favicon:', err);
    } finally {
      setIsSavingFavicon(false);
    }
  };

  const handleResetFavicon = async () => {
    setIsSavingFavicon(true);
    try {
      await resetSiteFavicon();
      setFaviconUrl('/favicon.png');
      setIsFaviconDirty(false);
      setFaviconSavedToast(true);
      setTimeout(() => setFaviconSavedToast(false), 3500);
    } catch (err) {
      console.error('Failed to reset favicon:', err);
    } finally {
      setIsSavingFavicon(false);
    }
  };

  useEffect(() => {
    if (!isPrincipalDirty && principalMessage) {
      setPrincipalForm({ ...principalMessage });
    }
  }, [principalMessage, isPrincipalDirty]);

  useEffect(() => {
    if (!isVicePrincipalDirty && vicePrincipalMessage) {
      setVicePrincipalForm({ ...vicePrincipalMessage });
    }
  }, [vicePrincipalMessage, isVicePrincipalDirty]);

  // Slide Handlers
  const handleStartAddSlide = () => {
    setSlideFormData({
      imageUrl: '',
      badge: '',
      title: '',
      subtitle: '',
      altText: '',
      isActive: true,
    });
    setIsAddingNew(true);
    setEditingSlide(null);
  };

  const handleStartEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideFormData({
      imageUrl: slide.imageUrl,
      badge: slide.badge,
      title: slide.title,
      subtitle: slide.subtitle,
      altText: slide.altText,
      isActive: slide.isActive !== false,
    });
    setIsAddingNew(false);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      updateHeroSlide(editingSlide.id, slideFormData);
      setEditingSlide(null);
    } else {
      addHeroSlide(slideFormData);
      setIsAddingNew(false);
    }
  };

  const handleSlideFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimizedUrl = await compressAndConvertToDataUrl(file, 1600, 1200, 0.8);
      if (optimizedUrl) {
        setSlideFormData((prev) => ({ ...prev, imageUrl: optimizedUrl }));
      }
    } catch (err) {
      console.warn('Slide image processing failed:', err);
    }
  };

  // Principal Image Upload
  const handlePrincipalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimizedUrl = await compressAndConvertToDataUrl(file, 800, 800, 0.8);
      if (optimizedUrl) {
        setPrincipalForm((prev) => ({ ...prev, photoUrl: optimizedUrl }));
        setIsPrincipalDirty(true);
      }
    } catch (err) {
      console.warn('Principal image processing failed:', err);
    }
  };

  // Vice Principal Image Upload
  const handleVicePrincipalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimizedUrl = await compressAndConvertToDataUrl(file, 800, 800, 0.8);
      if (optimizedUrl) {
        setVicePrincipalForm((prev) => ({ ...prev, photoUrl: optimizedUrl }));
        setIsVicePrincipalDirty(true);
      }
    } catch (err) {
      console.warn('Vice principal image processing failed:', err);
    }
  };

  // Save Principal Message
  const handleSavePrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrincipal(true);
    try {
      await updatePrincipalMessage(principalForm);
      setIsPrincipalDirty(false);
      setPrincipalSavedToast(true);
      setTimeout(() => setPrincipalSavedToast(false), 3500);
    } catch (err) {
      console.error('Failed to save principal message:', err);
    } finally {
      setIsSavingPrincipal(false);
    }
  };

  // Save Vice-Principal Message
  const handleSaveVicePrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVicePrincipal(true);
    try {
      await updateVicePrincipalMessage(vicePrincipalForm);
      setIsVicePrincipalDirty(false);
      setVicePrincipalSavedToast(true);
      setTimeout(() => setVicePrincipalSavedToast(false), 3500);
    } catch (err) {
      console.error('Failed to save vice-principal message:', err);
    } finally {
      setIsSavingVicePrincipal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Controls */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#f6f3ed] dark:bg-[#161512] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#3a372e]">
        <button
          onClick={() => setActiveSubTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'branding'
              ? 'bg-[#1c1c18] text-[#eedc82] shadow-sm'
              : 'text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Header & Dynamic Branding</span>
        </button>

        <button
          onClick={() => setActiveSubTab('slider')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'slider'
              ? 'bg-[#1c1c18] text-[#eedc82] shadow-sm'
              : 'text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Hero Image Slider</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#eedc82]/20 text-[#eedc82]">
            {heroSlides?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('favicon')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'favicon'
              ? 'bg-[#1c1c18] text-[#eedc82] shadow-sm'
              : 'text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Site Favicon</span>
          {siteFavicon && (
            <img
              src={siteFavicon}
              alt="Favicon"
              className="w-4 h-4 rounded-full object-contain bg-white/20 border border-white/20"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('principal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'principal'
              ? 'bg-[#1c1c18] text-[#eedc82] shadow-sm'
              : 'text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Message from the Principal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vicePrincipal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'vicePrincipal'
              ? 'bg-[#1c1c18] text-[#eedc82] shadow-sm'
              : 'text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Message from the Vice-Principal</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW 0: HEADER & DYNAMIC BRANDING
          ========================================================================= */}
      {activeSubTab === 'branding' && <HeaderBrandingTab />}

      {/* =========================================================================
          VIEW A: HERO SLIDER MANAGEMENT
          ========================================================================= */}
      {activeSubTab === 'slider' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                  <Sliders className="w-5 h-5" />
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Home Slider Management
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                Customize the main carousel hero slides, background photos, badges, headlines, and subtitles.
              </p>
            </div>

            <button
              onClick={handleStartAddSlide}
              className="japandi-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Slide</span>
            </button>
          </div>

          {/* Slide Modal Editor (Add/Edit) */}
          {(isAddingNew || editingSlide) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
                  <h3 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7]">
                    {editingSlide ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingSlide(null);
                      setIsAddingNew(false);
                    }}
                    className="text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Badge / Tag Label
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Knowledge & Discipline"
                      value={slideFormData.badge}
                      onChange={(e) => setSlideFormData({ ...slideFormData, badge: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Main Headline (Title)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangladesh National Cadet Corps"
                      value={slideFormData.title}
                      onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. New Govt. Degree College, Rajshahi BNCC Platoon..."
                      value={slideFormData.subtitle}
                      onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <CloudinaryUploader
                      value={slideFormData.imageUrl}
                      onChange={(url) => setSlideFormData((prev) => ({ ...prev, imageUrl: url }))}
                      label="Slide Photo (Compressed & CDN Optimized)"
                      helperText="Auto-compresses large photos before uploading directly to Cloudinary."
                      aspectRatio="banner"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="slideActive"
                      checked={slideFormData.isActive}
                      onChange={(e) => setSlideFormData({ ...slideFormData, isActive: e.target.checked })}
                      className="rounded text-[#6b5e10]"
                    />
                    <label htmlFor="slideActive" className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                      Active in Carousel
                    </label>
                  </div>

                  <div className="pt-3 border-t border-[#cdc6b3]/50 dark:border-[#423e35] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlide(null);
                        setIsAddingNew(false);
                      }}
                      className="japandi-btn-secondary text-xs py-2 px-4 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="japandi-btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
                    >
                      Save Slide
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Slide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(heroSlides || []).map((slide, index) => (
              <div
                key={slide.id}
                className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs group hover:border-[#6b5e10] transition-all"
              >
                <div className="relative h-44 bg-[#f0eee8] dark:bg-[#141311]">
                  <img
                    src={slide.imageUrl}
                    alt={slide.altText || slide.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#1c1c18]/80 backdrop-blur-xs text-[#eedc82] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Slide #{index + 1} • {slide.badge}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        slide.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}
                    >
                      {slide.isActive !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-grow">
                  <h3 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7] leading-snug">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-[#695c4e] dark:text-[#aca596] line-clamp-2">
                    {slide.subtitle}
                  </p>
                </div>

                <div className="p-3 bg-[#f6f3ed] dark:bg-[#161512] border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex items-center justify-between">
                  <span className="text-[10px] text-[#7c7767] dark:text-[#888] font-mono truncate max-w-[160px]">
                    {slide.id}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEditSlide(slide)}
                      className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this slide?')) {
                          deleteHeroSlide(slide.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: SITE FAVICON & BROWSER TAB BRANDING
          ========================================================================= */}
      {activeSubTab === 'favicon' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                  <Globe className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Site Favicon & Browser Icon
                  </h2>
                  <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-0.5">
                    Customize the official portal icon displayed in web browser tabs, bookmarks, taskbars, and mobile shortcuts.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Active in Browser
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {faviconSavedToast && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Site favicon updated and applied across the browser tab and portal successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live Browser Tab Mockup & Resolutions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Browser Window Simulation */}
              <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#cdc6b3]/30 dark:border-[#423e35]/60">
                  <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                    Browser Tab Preview Simulation
                  </span>
                  <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] uppercase font-mono">Live Preview</span>
                </div>

                {/* Simulated Desktop Browser Frame */}
                <div className="rounded-2xl overflow-hidden border border-[#cdc6b3] dark:border-[#423e35] bg-[#ece7dd] dark:bg-[#151412] shadow-sm">
                  {/* Browser Tab Strip */}
                  <div className="pt-2.5 px-3 flex items-center gap-2 bg-[#e4dfd4] dark:bg-[#100f0d] border-b border-[#cdc6b3]/40 dark:border-[#38352d]">
                    <div className="flex items-center gap-1.5 mr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#e76e63]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#e5c05c]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#57c269]" />
                    </div>

                    {/* Active Browser Tab */}
                    <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] rounded-t-xl px-3 py-1.5 flex items-center gap-2 max-w-[210px] shadow-xs border-t border-x border-[#cdc6b3]/60 dark:border-[#423e35]">
                      <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-white/40">
                        <img
                          src={faviconUrl || '/favicon.png'}
                          alt="Tab Favicon"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#1c1c18] dark:text-[#fcfbf7] truncate">
                        NGDC-BNCC Platoon Portal
                      </span>
                      <X className="w-3 h-3 text-[#7c7767] shrink-0 ml-auto cursor-pointer" />
                    </div>
                  </div>

                  {/* Simulated URL Bar */}
                  <div className="p-2.5 bg-[#fcf9f3] dark:bg-[#1e1d19] flex items-center gap-2 text-[11px]">
                    <div className="flex-1 bg-[#f4efe4] dark:bg-[#141311] border border-[#cdc6b3]/50 dark:border-[#3a372e] rounded-xl px-3 py-1 flex items-center gap-2 text-[#695c4e] dark:text-[#aca596] font-mono text-[10px]">
                      <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">https://</span>
                      <span className="text-[#1c1c18] dark:text-[#fcfbf7]">ngdc-bncc.edu.bd</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Size Icon Showcase */}
                <div className="mt-5 space-y-3">
                  <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Multi-Resolution Renderings
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {/* 16x16 */}
                    <div className="p-3 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/40 dark:border-[#38352d] flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/40 rounded-lg p-1 shadow-2xs mb-2">
                        <img
                          src={faviconUrl || '/favicon.png'}
                          alt="16px"
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">16×16</span>
                      <span className="text-[9px] text-[#7c7767] dark:text-[#aca596]">Tab</span>
                    </div>

                    {/* 32x32 */}
                    <div className="p-3 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/40 dark:border-[#38352d] flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/40 rounded-lg p-1 shadow-2xs mb-2">
                        <img
                          src={faviconUrl || '/favicon.png'}
                          alt="32px"
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">32×32</span>
                      <span className="text-[9px] text-[#7c7767] dark:text-[#aca596]">Bookmark</span>
                    </div>

                    {/* 48x48 */}
                    <div className="p-3 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/40 dark:border-[#38352d] flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 flex items-center justify-center bg-white/80 dark:bg-black/40 rounded-lg p-1 shadow-2xs mb-2">
                        <img
                          src={faviconUrl || '/favicon.png'}
                          alt="48px"
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">48×48</span>
                      <span className="text-[9px] text-[#7c7767] dark:text-[#aca596]">Taskbar</span>
                    </div>

                    {/* 96x96 */}
                    <div className="p-3 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/40 dark:border-[#38352d] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 flex items-center justify-center bg-white/80 dark:bg-black/40 rounded-lg p-1 shadow-2xs mb-2">
                        <img
                          src={faviconUrl || '/favicon.png'}
                          alt="96px"
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">96×96</span>
                      <span className="text-[9px] text-[#7c7767] dark:text-[#aca596]">App Icon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Controls & Uploader (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Preset Quick Chooser */}
              <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                    Quick Emblem Presets
                  </h3>
                  <span className="text-[11px] text-[#7c7767] dark:text-[#aca596]">Click to select</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Preset 1: Official BNCC (Uploaded) */}
                  <button
                    type="button"
                    onClick={() => {
                      setFaviconUrl('/favicon.png');
                      setIsFaviconDirty(true);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                      faviconUrl === '/favicon.png' || faviconUrl === ASSETS.bnccLogo
                        ? 'border-[#eedc82] bg-[#eedc82]/15 shadow-xs ring-2 ring-[#eedc82]/50'
                        : 'border-[#cdc6b3]/50 dark:border-[#423e35] bg-[#f6f3ed] dark:bg-[#141311] hover:border-[#cdc6b3] dark:hover:border-[#524d42]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 shadow-xs border border-black/5 flex items-center justify-center">
                      <img
                        src="/favicon.png"
                        alt="BNCC Official Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                          BNCC Official Emblem
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#eedc82] text-[#1c1c18] font-bold">
                          Uploaded
                        </span>
                      </div>
                      <p className="text-[10px] text-[#695c4e] dark:text-[#aca596] mt-0.5">
                        Uploaded official circular corps crest (Knowledge & Discipline)
                      </p>
                    </div>
                  </button>

                  {/* Preset 2: NGDC College Crest */}
                  <button
                    type="button"
                    onClick={() => {
                      setFaviconUrl(ASSETS.ngdcLogo);
                      setIsFaviconDirty(true);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                      faviconUrl === ASSETS.ngdcLogo
                        ? 'border-[#eedc82] bg-[#eedc82]/15 shadow-xs ring-2 ring-[#eedc82]/50'
                        : 'border-[#cdc6b3]/50 dark:border-[#423e35] bg-[#f6f3ed] dark:bg-[#141311] hover:border-[#cdc6b3] dark:hover:border-[#524d42]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 shadow-xs border border-black/5 flex items-center justify-center">
                      <img
                        src={ASSETS.ngdcLogo}
                        alt="NGDC Crest"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">
                        NGDC College Crest
                      </span>
                      <p className="text-[10px] text-[#695c4e] dark:text-[#aca596] mt-0.5">
                        New Govt. Degree College institutional emblem
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upload & URL Input Card */}
              <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                  Upload or Change Favicon
                </h3>

                {/* Direct File Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-2">
                    Upload Icon File (.png, .ico, .svg, .jpg, .webp)
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#cdc6b3] dark:border-[#423e35] hover:border-[#6b5e10] dark:hover:border-[#eedc82] rounded-2xl bg-[#f6f3ed] dark:bg-[#141311] cursor-pointer transition-colors group">
                    <div className="p-3 rounded-full bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82] mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      Click to choose an image file or drag & drop here
                    </span>
                    <span className="text-[10px] text-[#7c7767] dark:text-[#aca596] mt-1">
                      Square ratio recommended (e.g. 512×512 or 256×256)
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFaviconFileUpload}
                    />
                  </label>
                </div>

                {/* Direct URL Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Or Enter Favicon Image URL
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        placeholder="https://example.com/icon.png or /favicon.png"
                        value={faviconUrl}
                        onChange={(e) => {
                          setFaviconUrl(e.target.value);
                          setIsFaviconDirty(true);
                        }}
                        className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono focus:border-[#eedc82]"
                      />
                      {faviconUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFaviconUrl('');
                            setIsFaviconDirty(true);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cloudinary Support Option */}
                <div className="pt-2 border-t border-[#cdc6b3]/30 dark:border-[#3a372e]">
                  <CloudinaryUploader
                    value={faviconUrl}
                    onChange={(url) => {
                      setFaviconUrl(url);
                      setIsFaviconDirty(true);
                    }}
                    onUploadComplete={(url) => {
                      setFaviconUrl(url);
                      setIsFaviconDirty(true);
                    }}
                    label="Or Upload via Cloudinary CDN"
                    helperText="Upload to cloud storage (PNG/ICO/SVG/WEBP)"
                    aspectRatio="square"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#cdc6b3]/40 dark:border-[#38352d]">
                  <button
                    type="button"
                    onClick={handleResetFavicon}
                    disabled={isSavingFavicon}
                    className="px-4 py-2.5 rounded-xl border border-[#cdc6b3] dark:border-[#423e35] text-xs font-semibold text-[#5d5242] dark:text-[#aca596] hover:bg-[#ede3d1] dark:hover:bg-[#221f18] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Default BNCC</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveFavicon()}
                      disabled={isSavingFavicon}
                      className="japandi-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      {isSavingFavicon ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Applying Favicon...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{isFaviconDirty ? 'Save & Apply Favicon' : 'Favicon Saved'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: MESSAGE FROM THE PRINCIPAL CONTROLS
          ========================================================================= */}
      {activeSubTab === 'principal' && (
        <div className="space-y-6">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Message from the Principal Controls
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                Configure the Principal's portrait picture, full name, designation, highlighted quote, and speech message shown below the image slider.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (confirm('Reset Principal message to factory default values?')) {
                  await resetPrincipalMessage();
                  setIsPrincipalDirty(false);
                }
              }}
              className="japandi-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Reset to Default</span>
            </button>
          </div>

          {principalSavedToast && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Principal message updated successfully! The home page section is live with the new changes.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Form */}
            <form onSubmit={handleSavePrincipal} className="lg:col-span-7 space-y-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Principal's Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor Dr. Shikha Sarkar"
                    value={principalForm.name}
                    onChange={(e) => {
                      setPrincipalForm({ ...principalForm, name: e.target.value });
                      setIsPrincipalDirty(true);
                    }}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Principal"
                    value={principalForm.designation}
                    onChange={(e) => {
                      setPrincipalForm({ ...principalForm, designation: e.target.value });
                      setIsPrincipalDirty(true);
                    }}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Institution / Sub-Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Govt. Degree College, Rajshahi"
                    value={principalForm.subDesignation}
                    onChange={(e) => {
                      setPrincipalForm({ ...principalForm, subDesignation: e.target.value });
                      setIsPrincipalDirty(true);
                    }}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Honorary Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Patron & Leadership"
                    value={principalForm.badge || ''}
                    onChange={(e) => {
                      setPrincipalForm({ ...principalForm, badge: e.target.value });
                      setIsPrincipalDirty(true);
                    }}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload with Cloudinary & Direct URL Fallback */}
              <div className="space-y-2">
                <CloudinaryUploader
                  value={principalForm.photoUrl}
                  onChange={(url) => {
                    setPrincipalForm((prev) => ({ ...prev, photoUrl: url }));
                    setIsPrincipalDirty(true);
                  }}
                  label="Principal's Portrait (Cloudinary CDN)"
                  helperText="Upload image to Cloudinary CDN with automatic client-side compression."
                  aspectRatio="square"
                />
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Or paste direct image URL (https://...)"
                      value={principalForm.photoUrl}
                      onChange={(e) => {
                        setPrincipalForm((prev) => ({ ...prev, photoUrl: e.target.value }));
                        setIsPrincipalDirty(true);
                      }}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] pl-8 pr-3 py-2 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                    />
                    <Link2 className="w-3.5 h-3.5 text-[#7c7767] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#efeae0] dark:bg-[#26241e] hover:bg-[#e4ddce] text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] border border-[#cdc6b3] dark:border-[#423e35] whitespace-nowrap flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                    <span>Browse</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePrincipalPhotoUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Highlighted Quote */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Highlighted Quote (Opening Highlight)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter inspiring quote or keynote..."
                  value={principalForm.quote}
                  onChange={(e) => {
                    setPrincipalForm({ ...principalForm, quote: e.target.value });
                    setIsPrincipalDirty(true);
                  }}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none italic leading-relaxed"
                />
              </div>

              {/* Full Message Body */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Full Speech / Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed message from the Principal..."
                  value={principalForm.message}
                  onChange={(e) => {
                    setPrincipalForm({ ...principalForm, message: e.target.value });
                    setIsPrincipalDirty(true);
                  }}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed resize-y"
                />
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="principalEnabled"
                  checked={principalForm.enabled !== false}
                  onChange={(e) => {
                    setPrincipalForm({ ...principalForm, enabled: e.target.checked });
                    setIsPrincipalDirty(true);
                  }}
                  className="rounded text-[#6b5e10]"
                />
                <label htmlFor="principalEnabled" className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                  Display "Message from the Principal" section on Home page
                </label>
              </div>

              <div className="pt-3 border-t border-[#cdc6b3]/50 dark:border-[#423e35] flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSavingPrincipal}
                  className="japandi-btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingPrincipal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Principal Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Visual Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#695c4e] dark:text-[#aca596] px-1">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                  Live Home Page Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82]">
                  {principalForm.enabled !== false ? 'Active On Home' : 'Disabled'}
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-[#f6f3ed] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#cdc6b3] dark:border-[#464237] shadow-sm mb-3">
                    <img
                      src={principalForm.photoUrl}
                      alt={principalForm.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    {principalForm.name || 'Principal Name'}
                  </h4>
                  <p className="text-xs font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                    {principalForm.designation || 'Principal'}
                  </p>
                  <p className="text-[10px] text-[#7c7767] dark:text-[#aca596] mt-0.5">
                    {principalForm.subDesignation || 'New Govt. Degree College, Rajshahi'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#cdc6b3]/40 dark:border-[#38352d]">
                  <h5 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Message from the Principal
                  </h5>
                  <blockquote className="border-l-3 border-[#eedc82] pl-3 italic text-[11px] text-[#4a4738] dark:text-[#aca596] leading-relaxed">
                    {principalForm.quote}
                  </blockquote>
                  <p className="text-[11px] text-[#4a4738] dark:text-[#aca596] leading-relaxed line-clamp-4">
                    {principalForm.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW C: MESSAGE FROM THE VICE-PRINCIPAL CONTROLS
          ========================================================================= */}
      {activeSubTab === 'vicePrincipal' && (
        <div className="space-y-6">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                  <Award className="w-5 h-5" />
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Message from the Vice-Principal Controls
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
                Configure the Vice-Principal's portrait picture, full name, designation, highlighted quote, and speech message shown below the image slider.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (confirm('Reset Vice-Principal message to factory default values?')) {
                  await resetVicePrincipalMessage();
                  setIsVicePrincipalDirty(false);
                }
              }}
              className="japandi-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Reset to Default</span>
            </button>
          </div>

          {vicePrincipalSavedToast && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Vice-Principal message updated successfully! The home page section is live with the new changes.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Form */}
            <form onSubmit={handleSaveVicePrincipal} className="lg:col-span-7 space-y-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Vice-Principal's Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor Md. Motiur Rahman"
                    value={vicePrincipalForm.name}
                    onChange={(e) => {
                      setVicePrincipalForm({ ...vicePrincipalForm, name: e.target.value });
                      setIsVicePrincipalDirty(true);
                    }}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vice-Principal"
                    value={vicePrincipalForm.designation}
                    onChange={(e) => {
                      setVicePrincipalForm({ ...vicePrincipalForm, designation: e.target.value });
                      setIsVicePrincipalDirty(true);
                    }}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Institution / Sub-Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Govt. Degree College, Rajshahi"
                    value={vicePrincipalForm.subDesignation}
                    onChange={(e) => {
                      setVicePrincipalForm({ ...vicePrincipalForm, subDesignation: e.target.value });
                      setIsVicePrincipalDirty(true);
                    }}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Honorary Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vice-Patron & Leadership"
                    value={vicePrincipalForm.badge || ''}
                    onChange={(e) => {
                      setVicePrincipalForm({ ...vicePrincipalForm, badge: e.target.value });
                      setIsVicePrincipalDirty(true);
                    }}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload with Cloudinary & Direct URL Fallback */}
              <div className="space-y-2">
                <CloudinaryUploader
                  value={vicePrincipalForm.photoUrl}
                  onChange={(url) => {
                    setVicePrincipalForm((prev) => ({ ...prev, photoUrl: url }));
                    setIsVicePrincipalDirty(true);
                  }}
                  label="Vice-Principal's Portrait (Cloudinary CDN)"
                  helperText="Upload image to Cloudinary CDN with automatic client-side compression."
                  aspectRatio="square"
                />
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Or paste direct image URL (https://...)"
                      value={vicePrincipalForm.photoUrl}
                      onChange={(e) => {
                        setVicePrincipalForm((prev) => ({ ...prev, photoUrl: e.target.value }));
                        setIsVicePrincipalDirty(true);
                      }}
                      className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] pl-8 pr-3 py-2 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                    />
                    <Link2 className="w-3.5 h-3.5 text-[#7c7767] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#efeae0] dark:bg-[#26241e] hover:bg-[#e4ddce] text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] border border-[#cdc6b3] dark:border-[#423e35] whitespace-nowrap flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                    <span>Browse</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleVicePrincipalPhotoUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Highlighted Quote */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Highlighted Quote (Opening Highlight)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter inspiring quote or keynote..."
                  value={vicePrincipalForm.quote}
                  onChange={(e) => {
                    setVicePrincipalForm({ ...vicePrincipalForm, quote: e.target.value });
                    setIsVicePrincipalDirty(true);
                  }}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none italic leading-relaxed"
                />
              </div>

              {/* Full Message Body */}
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Full Speech / Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed message from the Vice-Principal..."
                  value={vicePrincipalForm.message}
                  onChange={(e) => {
                    setVicePrincipalForm({ ...vicePrincipalForm, message: e.target.value });
                    setIsVicePrincipalDirty(true);
                  }}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none leading-relaxed resize-y"
                />
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vicePrincipalEnabled"
                  checked={vicePrincipalForm.enabled !== false}
                  onChange={(e) => {
                    setVicePrincipalForm({ ...vicePrincipalForm, enabled: e.target.checked });
                    setIsVicePrincipalDirty(true);
                  }}
                  className="rounded text-[#6b5e10]"
                />
                <label htmlFor="vicePrincipalEnabled" className="text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                  Display "Message from the Vice-Principal" section on Home page
                </label>
              </div>

              <div className="pt-3 border-t border-[#cdc6b3]/50 dark:border-[#423e35] flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSavingVicePrincipal}
                  className="japandi-btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingVicePrincipal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Vice-Principal Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Visual Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#695c4e] dark:text-[#aca596] px-1">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                  Live Home Page Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82]">
                  {vicePrincipalForm.enabled !== false ? 'Active On Home' : 'Disabled'}
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-[#fcf9f3] dark:bg-[#181714] border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#cdc6b3] dark:border-[#464237] shadow-sm mb-3">
                    <img
                      src={vicePrincipalForm.photoUrl}
                      alt={vicePrincipalForm.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    {vicePrincipalForm.name || 'Vice-Principal Name'}
                  </h4>
                  <p className="text-xs font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                    {vicePrincipalForm.designation || 'Vice-Principal'}
                  </p>
                  <p className="text-[10px] text-[#7c7767] dark:text-[#aca596] mt-0.5">
                    {vicePrincipalForm.subDesignation || 'New Govt. Degree College, Rajshahi'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#cdc6b3]/40 dark:border-[#38352d]">
                  <h5 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Message from the Vice-Principal
                  </h5>
                  <blockquote className="border-l-3 border-[#eedc82] pl-3 italic text-[11px] text-[#4a4738] dark:text-[#aca596] leading-relaxed">
                    {vicePrincipalForm.quote}
                  </blockquote>
                  <p className="text-[11px] text-[#4a4738] dark:text-[#aca596] leading-relaxed line-clamp-4">
                    {vicePrincipalForm.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

