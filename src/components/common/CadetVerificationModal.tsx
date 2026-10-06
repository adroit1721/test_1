import React, { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, X, CheckCircle2, User, Calendar, Award, Building2 } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { CadetUserAccount } from '../../types';

interface CadetVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCadetNo?: string;
}

export const CadetVerificationModal: React.FC<CadetVerificationModalProps> = ({
  isOpen,
  onClose,
  initialCadetNo = '',
}) => {
  const { verifyCadet } = useAdminData();
  const [searchQuery, setSearchQuery] = useState(initialCadetNo);
  const [searched, setSearched] = useState(false);
  const [foundCadet, setFoundCadet] = useState<CadetUserAccount | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = verifyCadet(searchQuery);
    setFoundCadet(res);
    setSearched(true);
  };

  const isExCadet =
    foundCadet?.cadetType === 'Ex-cadet' ||
    foundCadet?.category === 'Ex-cadets' ||
    foundCadet?.status === 'Alumni';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#fcfbf7] dark:bg-[#1a1917] border border-[#d6cfb8] dark:border-[#38342c] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1c1c18] dark:bg-[#0f0e0d] text-[#fcfbf7] px-6 py-4 flex items-center justify-between border-b border-[#eedc82]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#eedc82]/10 rounded-lg text-[#eedc82]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-wide text-white">Official Cadet Verification</h3>
              <p className="text-xs text-[#a39e8c]">NGDC-BNCC Platoon Roster Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#a39e8c] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-semibold text-[#6b6555] dark:text-[#b0a996] uppercase tracking-wider">
              Enter Cadet Number / ID
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searched) setSearched(false);
                }}
                placeholder="e.g. C-101, 2024-C-001, or Cadet No"
                className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] focus:border-[#6b5e10] dark:focus:border-[#eedc82] px-4 py-3 pl-10 rounded-xl outline-none font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7] transition-colors"
              />
              <Search className="w-4 h-4 absolute left-3.5 text-[#7c7767] dark:text-[#a39e8c]" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-[#6b5e10] hover:bg-[#574c0c] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                Verify
              </button>
            </div>
          </form>

          {/* Verification Results */}
          {searched && (
            <div>
              {foundCadet ? (
                <div className="bg-white dark:bg-[#141311] border border-emerald-500/30 dark:border-emerald-500/20 rounded-xl p-5 shadow-sm space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e3d5] dark:border-[#2d2923]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Verified NGDC-BNCC Cadet
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                        isExCadet
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {isExCadet ? 'Ex-Cadet (Alumni)' : 'Serving Cadet'}
                    </span>
                  </div>

                  {/* Cadet Details Grid */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                    {/* Cadet Photo */}
                    <div className="w-20 h-24 rounded-lg bg-[#f0ebd9] dark:bg-[#262420] border border-[#d4cbaf] dark:border-[#3d382f] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                      {foundCadet.photoUrl || foundCadet.avatarUrl ? (
                        <img
                          src={foundCadet.photoUrl || foundCadet.avatarUrl}
                          alt={foundCadet.fullName || foundCadet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-[#9e9680] dark:text-[#635c4b]" />
                      )}
                    </div>

                    {/* Particulars */}
                    <div className="space-y-2 text-left w-full text-xs">
                      <div>
                        <h4 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                          {foundCadet.fullName || foundCadet.name || 'N/A'}
                        </h4>
                        {foundCadet.nameBangla && (
                          <p className="text-[11px] text-[#6b6555] dark:text-[#a39e8c] font-medium">
                            {foundCadet.nameBangla}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div>
                          <span className="text-[#8c8573] dark:text-[#807968] block">Cadet No:</span>
                          <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                            {foundCadet.cadetNo || foundCadet.cadetNumber || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8c8573] dark:text-[#807968] block">Rank:</span>
                          <span className="font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                            {foundCadet.rank || 'Cadet (CDT)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8c8573] dark:text-[#807968] block">Batch / Session:</span>
                          <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                            {foundCadet.batch || foundCadet.className || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8c8573] dark:text-[#807968] block">Date of Birth:</span>
                          <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                            {foundCadet.dob || 'Confidential / On File'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-5 text-center space-y-2">
                  <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto" />
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-300">No Verified Cadet Found</h4>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    No active or ex-cadet record matches Cadet Number &quot;{searchQuery}&quot;. Please verify the cadet number with NGDC-BNCC Platoon HQ.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f2efe9] dark:bg-[#121110] px-6 py-3 border-t border-[#e3dccb] dark:border-[#2b2721] flex justify-between items-center text-[11px] text-[#7c7767] dark:text-[#8a8372]">
          <span>Official Roster Database</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#ded7c4] dark:bg-[#2b2721] hover:bg-[#cfc6b0] dark:hover:bg-[#38332b] text-[#1c1c18] dark:text-[#fcfbf7] font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
