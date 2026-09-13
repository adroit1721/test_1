import React from 'react';
import { TabType, FooterSocialLink } from '../types';
import { useAdminData } from '../context/AdminDataContext';
import { MapPin, Phone, Mail, ExternalLink, ShieldCheck, Shield, Globe } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: TabType) => void;
  onOpenAdminLogin: () => void;
  onOpenPrivacyModal: () => void;
  onOpenTermsModal: () => void;
}

// Helper to render platform-specific brand SVG icons dynamically
const renderSocialIcon = (platform: string) => {
  const p = platform.toLowerCase().trim();
  if (p.includes('facebook') || p === 'fb') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p.includes('twitter') || p.includes('x.com') || p === 'x') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#1c1c18] dark:text-[#f0eee8]" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p.includes('youtube') || p === 'yt') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#FF0000]" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (p.includes('instagram') || p === 'ig') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#E1306C]" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }
  if (p.includes('whatsapp') || p === 'wa') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#25D366]" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.122-.529-1.611-.667-2.646-2.31-2.727-2.417-.08-.107-.655-.87-.655-1.66 0-.789.414-1.177.56-1.336.146-.159.32-.198.427-.198.106 0 .213.001.306.006.098.005.23-.037.36.275.134.321.458 1.115.498 1.196.04.081.066.175.013.281-.053.107-.08.175-.16.268-.08.093-.168.208-.24.281-.08.081-.164.169-.071.328.094.16.417.689.897 1.117.618.552 1.139.723 1.301.803.161.08.255.068.35-.041.094-.108.401-.468.508-.629.107-.161.214-.134.36-.08.147.054.935.441 1.095.521.161.08.268.12.308.188.04.068.04.394-.104.799z" />
      </svg>
    );
  }
  if (p.includes('telegram') || p === 'tg') {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#229ED9]" viewBox="0 0 24 24">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.968z" />
      </svg>
    );
  }
  if (p.includes('tiktok')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#ee1d52]" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.83c0 1.94-.48 3.86-1.49 5.48-1.44 2.3-4.04 3.73-6.76 3.68-3.41-.05-6.3-2.48-6.98-5.83-.8-3.9 1.69-7.79 5.61-8.52.88-.16 1.78-.18 2.67-.06v4.14c-.62-.23-1.32-.27-1.96-.13-1.62.34-2.77 1.83-2.65 3.48.11 1.55 1.29 2.82 2.84 2.95 1.77.15 3.37-1.12 3.55-2.89.04-.37.04-.74.04-1.11V.02z" />
      </svg>
    );
  }
  if (p.includes('github')) {
    return (
      <svg className="w-3.5 h-3.5 fill-current text-[#1c1c18] dark:text-[#f0eee8]" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }
  return <Globe className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />;
};

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onOpenAdminLogin,
  onOpenPrivacyModal,
  onOpenTermsModal,
}) => {
  const { footerConfig, contactConfig } = useAdminData();

  const handleNav = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build active list of social links from footerConfig or defaults
  const activeSocialLinks: FooterSocialLink[] = [
    { id: 'soc-fb', platform: 'facebook', label: 'Facebook', url: footerConfig.facebookUrl || 'https://www.facebook.com/ngdcbncc' },
    { id: 'soc-yt', platform: 'youtube', label: 'YouTube', url: footerConfig.youtubeUrl || 'https://youtube.com/@ngdcbnccunit?si=vS5hmgUWKrPzkVGm' },
    { id: 'soc-ig', platform: 'instagram', label: 'Instagram', url: footerConfig.instagramUrl || 'https://www.instagram.com/bnccngdc?stkn=bWdpcGV5Y3YybWc1' },
    { id: 'soc-tw', platform: 'twitter', label: 'X (Twitter)', url: footerConfig.twitterUrl || 'https://x.com' },
  ];

  return (
    <footer className="max-w-[1120px] mx-auto mt-14 sm:mt-18 mb-6 sm:mb-8 border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl md:rounded-3xl relative bg-transparent w-full pt-8 pb-6 px-5 sm:px-8 md:px-10 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
        {/* Col 1: Platoon Address & Contact */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#eedc82]/40 dark:bg-[#eedc82]/15 flex items-center justify-center text-[#6b5e10] dark:text-[#eedc82]">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#f0eee8] uppercase tracking-wider">
              {footerConfig.col1Title || footerConfig.hqTitle || 'Platoon Address'}
            </h3>
          </div>

          <div className="space-y-2.5 text-xs sm:text-[13px] text-[#555042] dark:text-[#9e9788]">
            {footerConfig.aboutText && (
              <p className="text-xs text-[#695c4e] dark:text-[#aca596] leading-relaxed pb-1 border-b border-[#cdc6b3]/30 dark:border-[#423e35]">
                {footerConfig.aboutText}
              </p>
            )}

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-[#1c1c18] dark:text-[#e4ded3] block">
                  {contactConfig.addressTitle || 'NGDC BNCC Platoon HQ'}
                </span>
                <span>{footerConfig.roomDetails || contactConfig.roomAndBuilding}</span>
                <span className="block">{footerConfig.locationDetails || contactConfig.fullAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Phone className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
              <a
                href={`tel:${footerConfig.phone || contactConfig.phonePrimary}`}
                className="hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors"
              >
                {footerConfig.phone || contactConfig.phonePrimary} {footerConfig.phone2 ? `/ ${footerConfig.phone2}` : (contactConfig.phoneSecondary ? `/ ${contactConfig.phoneSecondary}` : '')}
              </a>
            </div>

            {footerConfig.emergencyPhone && (
              <div className="flex items-center gap-2.5 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Duty / Hotline: {footerConfig.emergencyPhone}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
              <a
                href={`mailto:${footerConfig.email || contactConfig.emailPrimary}`}
                className="hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors font-mono text-[11.5px]"
              >
                {footerConfig.email || contactConfig.emailPrimary}
              </a>
            </div>
          </div>
        </div>

        {/* Col 2: Important Links */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-[#1c1c18] dark:text-[#f0eee8] uppercase tracking-wider">
            {footerConfig.col2Title || 'Important Links'}
          </h4>
          <ul className="flex flex-col space-y-2 text-xs sm:text-[13px]">
            {footerConfig.importantLinks && footerConfig.importantLinks.length > 0 ? (
              footerConfig.importantLinks.map((link) => (
                <li key={link.id}>
                  {link.isExternal && link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors inline-flex items-center gap-1.5 font-medium group"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 text-[#8c8474] group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleNav((link.tab as TabType) || 'about')}
                      className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))
            ) : (
              <>
                <li>
                  <a
                    href={footerConfig.collegeOfficialUrl || 'https://ngdc.ac.bd'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors inline-flex items-center gap-1.5 font-medium group"
                  >
                    <span>NGDC College Official Website</span>
                    <ExternalLink className="w-3 h-3 text-[#8c8474] group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors" />
                  </a>
                </li>
                <li>
                  <a
                    href={footerConfig.bnccGovUrl || 'https://bncc.info/'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors inline-flex items-center gap-1.5 font-medium group"
                  >
                    <span>BNCC Official Directorate (Govt)</span>
                    <ExternalLink className="w-3 h-3 text-[#8c8474] group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors" />
                  </a>
                </li>
                <li>
                  <button
                    id="footer-link-cadets"
                    onClick={() => handleNav('cadets')}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    Cadets Corner & Directory
                  </button>
                </li>
                <li>
                  <button
                    id="footer-link-training"
                    onClick={() => handleNav('training')}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    Training Routines & Camps
                  </button>
                </li>
                <li>
                  <button
                    id="footer-link-honor"
                    onClick={() => handleNav('honor')}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    Platoon Honor Board
                  </button>
                </li>
                <li>
                  <button
                    id="footer-link-notices"
                    onClick={() => handleNav('notices')}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    Notice Board & Blogs
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Col 3: Legal & Policy */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-[#1c1c18] dark:text-[#f0eee8] uppercase tracking-wider">
            {footerConfig.col3Title || 'Legal & Policy'}
          </h4>
          <ul className="flex flex-col space-y-2 text-xs sm:text-[13px]">
            {footerConfig.legalLinks && footerConfig.legalLinks.length > 0 ? (
              footerConfig.legalLinks.map((link) => (
                <li key={link.id}>
                  {link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{link.label}</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        if (link.tab === 'privacy') onOpenPrivacyModal();
                        else if (link.tab === 'terms') onOpenTermsModal();
                        else handleNav((link.tab as TabType) || 'about');
                      }}
                      className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))
            ) : (
              <>
                <li>
                  <button
                    id="footer-link-privacy"
                    onClick={onOpenPrivacyModal}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    id="footer-link-terms"
                    onClick={onOpenTermsModal}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    id="footer-link-bncc-act"
                    onClick={() => handleNav('about')}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    BNCC Act 2016 Guidelines
                  </button>
                </li>
                <li>
                  <button
                    id="footer-link-code"
                    onClick={() => handleNav('about')}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    Cadet Code of Conduct
                  </button>
                </li>
                <li>
                  <button
                    id="footer-link-bylaws"
                    onClick={() => handleNav('about')}
                    className="text-left text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] transition-colors cursor-pointer"
                  >
                    Platoon Standard By-laws
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Col 4: Follow Us / Dynamic Social Links with auto-rendering icons */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-[#1c1c18] dark:text-[#f0eee8] uppercase tracking-wider">
            {footerConfig.col4Title || 'Follow Us'}
          </h4>
          <p className="text-xs text-[#695c4e] dark:text-[#8f887a]">
            {footerConfig.col4Subtitle || 'Connect with our platoon on official social channels:'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs sm:text-[13px]">
            {activeSocialLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-1.5 rounded-lg text-[#555042] dark:text-[#9e9788] hover:text-[#6b5e10] dark:hover:text-[#eedc82] hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
              >
                <span className="w-7 h-7 rounded-full bg-[#f0eee8] dark:bg-[#1a1915] border border-transparent dark:border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  {renderSocialIcon(item.platform || item.label)}
                </span>
                <span className="font-medium truncate">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar with Centered Copyright & STEALTH Admin Portal Login (Completely invisible until hovered) */}
      <div className="mt-8 pt-5 border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex flex-col items-center justify-center text-center relative group/footerbottom">
        {/* Centered Copyright Text */}
        <p className="text-xs sm:text-[13px] text-[#695c4e] dark:text-[#8f887a] font-medium leading-relaxed max-w-2xl px-2">
          {footerConfig.copyrightText || `© ${new Date().getFullYear()} NGDC-BNCC Platoon, New Govt. Degree College, Rajshahi. All rights reserved.`}
        </p>

        {/* Subtle Platoon Motto */}
        <p className="text-[11px] text-[#8c8474] dark:text-[#706a5e] mt-1">
          {footerConfig.mottoText || 'Knowledge & Discipline • জ্ঞান ও শৃঙ্খলা'}
        </p>

        {/* STEALTH PUO / Cadet Admin Login button:
            100% invisible (opacity-0 and pointer-events-none) by default.
            Only appears on explicit hover over this exact bottom area */}
        <div className="mt-2.5 min-h-[28px] flex items-center justify-center">
          <a
            id="btn-admin-login-footer"
            href="/ngdc_bncc_admin/login"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenAdminLogin) {
                onOpenAdminLogin();
              } else {
                window.history.pushState({}, '', '/ngdc_bncc_admin/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="opacity-0 pointer-events-none group-hover/footerbottom:opacity-100 group-hover/footerbottom:pointer-events-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6b5e10] dark:text-[#faec9c] bg-[#f0eee8] dark:bg-[#1c1b17] hover:bg-[#eedc82]/30 dark:hover:bg-[#eedc82]/15 px-3 py-1 rounded-full transition-all duration-300 cursor-pointer border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs"
            title="Command Officer Authentication Console"
            aria-label="PUO and Cadet Officer Admin Login"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
            <span>Officer Authentication Console</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
