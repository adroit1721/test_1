import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { FooterConfig } from '../../../types';
import {
  Sliders,
  CheckCircle2,
  Save,
  Globe,
  Facebook,
  Youtube,
  Linkedin,
  Instagram,
  Share2,
  FileText,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export const FooterTab: React.FC = () => {
  const { footerConfig, updateFooterConfig } = useAdminData();
  const [form, setForm] = useState<FooterConfig>(footerConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(footerConfig);
  }, [footerConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateFooterConfig(form);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Dynamic 4-Column Footer Configuration
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Customize column titles, contact numbers, official portals, social channels, and legal labels. Changes publish in real time.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/80 px-3.5 py-2 rounded-full border border-emerald-300 shrink-0">
            <CheckCircle2 className="w-4 h-4" /> Published Immediately!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= COLUMN 1 ================= */}
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-2">
            <Shield className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>Column 1: Platoon Address, Identity & Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Column 1 Title
              </label>
              <input
                type="text"
                value={form.col1Title || ''}
                placeholder="Platoon Address"
                onChange={(e) => setForm({ ...form, col1Title: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Official Platoon Email
              </label>
              <input
                type="email"
                value={form.email || ''}
                placeholder="bncc@ngdc.ac.bd"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
              About Bio / Intro Narrative (Optional, shown under Column 1 header)
            </label>
            <textarea
              rows={2}
              value={form.aboutText || ''}
              placeholder="NGDC BNCC Platoon is an elite contingent committed to discipline, leadership, and national defense."
              onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Primary Contact Phone
              </label>
              <input
                type="text"
                value={form.phone || ''}
                placeholder="+880 1711-000000"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Secondary Phone
              </label>
              <input
                type="text"
                value={form.phone2 || ''}
                placeholder="+880 1812-345678"
                onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Emergency Hotline / Duty Phone
              </label>
              <input
                type="text"
                value={form.emergencyPhone || ''}
                placeholder="+880 1712-999999"
                onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Room & Building Details
              </label>
              <input
                type="text"
                value={form.roomDetails || ''}
                placeholder="Room 204, Academic Building-1"
                onChange={(e) => setForm({ ...form, roomDetails: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                College Campus & City Address
              </label>
              <input
                type="text"
                value={form.locationDetails || ''}
                placeholder="New Govt. Degree College, Rajshahi-6205, Bangladesh"
                onChange={(e) => setForm({ ...form, locationDetails: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2 ================= */}
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-2">
            <ExternalLink className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>Column 2: Important Links & Official Resources</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Column 2 Title
              </label>
              <input
                type="text"
                value={form.col2Title || ''}
                placeholder="Important Links"
                onChange={(e) => setForm({ ...form, col2Title: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                NGDC College Official Website
              </label>
              <input
                type="text"
                value={form.collegeOfficialUrl || ''}
                placeholder="https://ngdc.ac.bd"
                onChange={(e) => setForm({ ...form, collegeOfficialUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                BNCC Directorate Official Portal
              </label>
              <input
                type="text"
                value={form.bnccGovUrl || ''}
                placeholder="https://bncc.info/"
                onChange={(e) => setForm({ ...form, bnccGovUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3 ================= */}
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-2">
            <FileText className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>Column 3: Legal & Regulatory Policies</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Column 3 Title
              </label>
              <input
                type="text"
                value={form.col3Title || ''}
                placeholder="Legal & Policy"
                onChange={(e) => setForm({ ...form, col3Title: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
              />
            </div>
            <div className="flex items-center text-xs text-[#695c4e] dark:text-[#aca596] pt-5">
              <span>Links include Privacy Policy, Terms of Service, BNCC Act 2016 Guidelines, and Cadet By-laws.</span>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 4 ================= */}
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-2">
            <Share2 className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>Column 4: Social Media Channels & Follow Us</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Column 4 Title
              </label>
              <input
                type="text"
                value={form.col4Title || ''}
                placeholder="Follow Us"
                onChange={(e) => setForm({ ...form, col4Title: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Column 4 Subtitle
              </label>
              <input
                type="text"
                value={form.col4Subtitle || ''}
                placeholder="Connect with our platoon on official social channels:"
                onChange={(e) => setForm({ ...form, col4Subtitle: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Facebook Page / Group</span>
              </label>
              <input
                type="text"
                value={form.facebookUrl || ''}
                placeholder="https://facebook.com/ngdcbncc"
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>YouTube Channel</span>
              </label>
              <input
                type="text"
                value={form.youtubeUrl || ''}
                placeholder="https://youtube.com/@ngdcbncc"
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Profile</span>
              </label>
              <input
                type="text"
                value={form.instagramUrl || ''}
                placeholder="https://instagram.com/ngdcbncc"
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-sky-700" />
                <span>LinkedIn Organization</span>
              </label>
              <input
                type="text"
                value={form.linkedinUrl || ''}
                placeholder="https://linkedin.com/company/ngdc-bncc"
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#1c1c18] dark:text-[#fcfbf7]" />
                <span>X (formerly Twitter)</span>
              </label>
              <input
                type="text"
                value={form.twitterUrl || ''}
                placeholder="https://x.com/ngdcbncc"
                onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-6 rounded-3xl space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-2">
            <Layers className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>Footer Bottom Bar & Legal Copyright</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Platoon Motto / Sub-motto
              </label>
              <input
                type="text"
                value={form.mottoText || ''}
                placeholder="Knowledge • Discipline • Unity"
                onChange={(e) => setForm({ ...form, mottoText: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                Copyright Notice Text
              </label>
              <input
                type="text"
                value={form.copyrightText || ''}
                placeholder="© 2025 New Govt. Degree College BNCC Platoon. All rights reserved."
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="japandi-btn-primary text-xs py-3 px-7 font-bold flex items-center gap-2 cursor-pointer shadow-md hover:scale-102 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Footer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
