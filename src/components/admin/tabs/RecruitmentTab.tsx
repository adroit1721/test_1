import React, { useState, useEffect } from 'react';
import { useRecruitment } from '../../../context/RecruitmentContext';
import { FormFieldConfig, RecruitmentApplicant, RecruitmentSignatoriesConfig } from '../../../types';
import { RecruitmentApplicationSlipA4 } from '../../common/RecruitmentApplicationSlipA4';
import { RecruitmentApplicationEditModal } from '../RecruitmentApplicationEditModal';
import { CloudinaryUploader } from '../../common/CloudinaryUploader';
import {
  UserPlus,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  ListPlus,
  Download,
  Megaphone,
  Award,
  Filter,
  Search,
  Printer,
  Calendar,
  Image,
  Eye,
  X,
  FileText,
  RotateCcw,
  Building,
  Check,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

export const RecruitmentTab: React.FC = () => {
  const {
    recruitmentAnnouncement,
    updateRecruitmentAnnouncement,
    deleteRecruitmentAnnouncement,
    isRecruitmentOpen,
    setIsRecruitmentOpen,
    recruitmentFields,
    setRecruitmentFields,
    applicants,
    recruitmentApplicants,
    updateApplicantStatus,
    updateRecruitmentApplicant,
    deleteApplicant,
    addApplicant,
    recruitmentSignatories,
    updateRecruitmentSignatories,
    resetRecruitmentSignatories,
    refreshRecruitmentApplicants,
  } = useRecruitment();

  // Safeguard applicant list
  const applicantList = applicants || recruitmentApplicants || [];

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (refreshRecruitmentApplicants) {
      refreshRecruitmentApplicants();
    }
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshRecruitmentApplicants) {
        await refreshRecruitmentApplicants();
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Subtabs: 'announcement' | 'applicants' | 'selectedList' | 'signatories'
  const [activeSubtab, setActiveSubtab] = useState<'announcement' | 'applicants' | 'selectedList' | 'signatories'>('applicants');

  // Edit Applicant Modal state
  const [editingApplicant, setEditingApplicant] = useState<RecruitmentApplicant | null>(null);

  // A4 PDF Print / Download state
  const [printingApplicant, setPrintingApplicant] = useState<RecruitmentApplicant | null>(null);
  const [printBlankModal, setPrintBlankModal] = useState(false);

  // Signatories Form State
  const [signatoriesForm, setSignatoriesForm] = useState<RecruitmentSignatoriesConfig>(recruitmentSignatories);
  const [signatoriesSaved, setSignatoriesSaved] = useState(false);
  const [newAttachmentText, setNewAttachmentText] = useState('');

  useEffect(() => {
    if (recruitmentSignatories) {
      setSignatoriesForm(recruitmentSignatories);
    }
  }, [recruitmentSignatories]);

  const DEFAULT_CIRCULAR_DRAFT = {
    isActive: true,
    title: 'Cadet Recruitment Batch 2026 Enrolment Circular',
    batch: 'Batch 26',
    deadline: '2026-10-15',
    startDate: '2026-09-01T08:00',
    endDate: '2026-10-15T23:59',
    venue: 'College Gymnasium & Main Parade Ground, NGDC',
    description: 'Join the Bangladesh National Cadet Corps (Army Wing) at New Government Degree College, Rajshahi. Experience military drill discipline, adventure camps, firing, leadership training, and national service.',
    eligibilityCriteria: [
      'Regular student of New Govt. Degree College (HSC 1st/2nd Year or Degree/Honours)',
      'Minimum height: Male 5\'4", Female 5\'0"',
      'Good physical fitness, mental resilience, and medically sound',
      'High standard of discipline, moral character, and dedication to national defense',
    ],
    headerImageUrl: '',
    footerImageUrl: '',
    footerText: 'For recruitment inquiries, visit Platoon HQ Room 123 or call +880 1712-345678. Official Army Wing Circular.',
  };

  const hasActiveCircular = Boolean(
    recruitmentAnnouncement &&
    recruitmentAnnouncement.title &&
    recruitmentAnnouncement.title.trim().length > 0 &&
    !recruitmentAnnouncement.isDeleted
  );

  const [isEditingCircular, setIsEditingCircular] = useState(false);

  // Announcement Form state
  const [announcementForm, setAnnouncementForm] = useState(
    recruitmentAnnouncement && recruitmentAnnouncement.title
      ? recruitmentAnnouncement
      : DEFAULT_CIRCULAR_DRAFT
  );

  useEffect(() => {
    if (recruitmentAnnouncement && recruitmentAnnouncement.title && !recruitmentAnnouncement.isDeleted) {
      setAnnouncementForm(recruitmentAnnouncement);
    }
  }, [recruitmentAnnouncement]);

  const [announcementSaved, setAnnouncementSaved] = useState(false);

  const handleStartNewCircular = () => {
    setAnnouncementForm(DEFAULT_CIRCULAR_DRAFT);
    setIsEditingCircular(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateRecruitmentAnnouncement) {
      updateRecruitmentAnnouncement({
        ...announcementForm,
        isActive: true,
        isDeleted: false,
      });
    }
    setAnnouncementSaved(true);
    setIsEditingCircular(false);
    setTimeout(() => setAnnouncementSaved(false), 2500);
  };

  const handleDeleteCircular = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this recruitment circular announcement?\n\nOnce deleted, the public recruitment portal will display: "Currently recruitment is Unavailable".'
      )
    ) {
      if (deleteRecruitmentAnnouncement) {
        deleteRecruitmentAnnouncement();
      }
      setAnnouncementForm({ ...DEFAULT_CIRCULAR_DRAFT, title: '', isDeleted: true });
      setIsEditingCircular(false);
    }
  };

  // Applicant search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Selected' | 'Pending' | 'Rejected'>('All');

  // Selected List new cadet state
  const [newSelectedRoll, setNewSelectedRoll] = useState('');
  const [newSelectedName, setNewSelectedName] = useState('');
  const [newSelectedDept, setNewSelectedDept] = useState('');

  // Add Eligibility Criterion
  const handleAddCriterion = (criterion: string) => {
    if (!criterion.trim()) return;
    setAnnouncementForm((prev) => ({
      ...prev,
      eligibilityCriteria: [...(prev.eligibilityCriteria || []), criterion.trim()],
    }));
  };

  const handleRemoveCriterion = (index: number) => {
    setAnnouncementForm((prev) => ({
      ...prev,
      eligibilityCriteria: (prev.eligibilityCriteria || []).filter((_, i) => i !== index),
    }));
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  // Export Applicants to Excel with categorized filtering (All, Selected, Rejected, Pending)
  const handleExportToExcel = async (category: 'All' | 'Selected' | 'Rejected' | 'Pending' = 'All') => {
    let listToExport = applicantList;
    if (category === 'Selected') {
      listToExport = applicantList.filter((a) => a.status === 'Selected' || a.status === 'Shortlisted');
    } else if (category === 'Rejected') {
      listToExport = applicantList.filter((a) => a.status === 'Rejected');
    } else if (category === 'Pending') {
      listToExport = applicantList.filter((a) => a.status === 'Pending');
    }

    if (listToExport.length === 0) {
      alert(`No ${category.toLowerCase()} applicants found to export.`);
      return;
    }

    const XLSX = await import('xlsx');
    const exportData = listToExport.map((app, index) => ({
      'SL No': index + 1,
      'Serial / Token No.': app.serialNo || app.token || app.id,
      'Enrolment Status': app.status || 'Pending',
      'Application Date': app.appliedAt || '',
      'Full Name (English)': app.nameEnglish || app.fullName || '',
      'Full Name (Bangla)': app.nameBangla || '',
      'Father Name (English)': app.fatherNameEnglish || '',
      'Father Name (Bangla)': app.fatherNameBangla || '',
      'Mother Name (English)': app.motherNameEnglish || '',
      'Mother Name (Bangla)': app.motherNameBangla || '',
      'Gender': app.gender || '',
      'Class / Year': app.studentClass || '',
      'Department': app.department || '',
      'College Roll': app.collegeRoll || '',
      'Session': app.session || '',
      'Date of Birth': app.dateOfBirth || '',
      'Religion': app.religion || '',
      'Blood Group': app.bloodGroup || '',
      'Height (Feet)': app.heightFeet || '',
      'Height (Inches)': app.heightInches || '',
      'Height (Combined)': app.heightFeet ? `${app.heightFeet}' ${app.heightInches || 0}"` : (app.height || ''),
      'Weight (kg)': app.weightKg || app.weight || '',
      'Chest (Normal)': app.chestNormal || '',
      'Chest (Expanded)': app.chestExpanded || '',
      'Applicant Mobile (Self)': app.phoneSelf || app.phone || '',
      'Guardian Mobile': app.phoneGuardian || '',
      'Email Address': app.email || '',
      'Present Address - Division': app.presentAddress?.division || '',
      'Present Address - District': app.presentAddress?.district || '',
      'Present Address - Upazila/Thana': app.presentAddress?.upazila || '',
      'Present Address - Post Office': app.presentAddress?.post || '',
      'Present Address - Village/Road': app.presentAddress?.village || '',
      'Permanent Address - Division': app.permanentAddress?.division || '',
      'Permanent Address - District': app.permanentAddress?.district || '',
      'Permanent Address - Upazila/Thana': app.permanentAddress?.upazila || '',
      'Permanent Address - Post Office': app.permanentAddress?.post || '',
      'Permanent Address - Village/Road': app.permanentAddress?.village || '',
      'Qualification 1 Exam': app.qualifications?.[0]?.examName || 'SSC',
      'Qualification 1 Group': app.qualifications?.[0]?.divisionOrGroup || '',
      'Qualification 1 Board': app.qualifications?.[0]?.board || '',
      'Qualification 1 Passing Year': app.qualifications?.[0]?.passingYear || '',
      'Qualification 1 GPA': app.qualifications?.[0]?.gpa || '',
      'Qualification 2 Exam': app.qualifications?.[1]?.examName || '',
      'Qualification 2 Group': app.qualifications?.[1]?.divisionOrGroup || '',
      'Qualification 2 Board': app.qualifications?.[1]?.board || '',
      'Qualification 2 Passing Year': app.qualifications?.[1]?.passingYear || '',
      'Qualification 2 GPA': app.qualifications?.[1]?.gpa || '',
      'Additional Skills': app.additionalSkills || '',
      'Reason / Motivation': app.reason || '',
      'Pledge Accepted': app.pledgeAccepted ? 'Yes' : 'No',
      'Guardian Consent Accepted': app.guardianConsentAccepted ? 'Yes' : 'No',
      'Photo Attached': app.avatarUrl ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const sheetTitle = category === 'All' ? 'All_Applicants' : `${category}_Applicants`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);

    XLSX.writeFile(workbook, `NGDC_BNCC_${category}_Applicants_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setShowExportMenu(false);
  };

  // Add to Selected List
  const handleAddSelectedCadet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSelectedRoll.trim() || !newSelectedName.trim()) return;

    if (addApplicant) {
      addApplicant({
        fullName: newSelectedName.trim(),
        collegeRoll: newSelectedRoll.trim(),
        department: newSelectedDept.trim() || 'General Science',
        session: '2024-2025',
        phone: '+880 1700-000000',
        email: 'cadet@example.com',
        bloodGroup: 'B+',
        heightFeet: '5',
        heightInches: '7',
        weightKg: '62',
        reason: 'Selected as probationary recruit for the platoon.',
        status: 'Shortlisted',
      });
    }

    setNewSelectedRoll('');
    setNewSelectedName('');
    setNewSelectedDept('');
  };

  // Signatories Handlers
  const handleSaveSignatories = (e: React.FormEvent) => {
    e.preventDefault();
    updateRecruitmentSignatories(signatoriesForm);
    setSignatoriesSaved(true);
    setTimeout(() => setSignatoriesSaved(false), 2500);
  };

  const handleResetSignatories = () => {
    if (confirm('Reset recruitment form signatories to default platoon officers?')) {
      resetRecruitmentSignatories();
      setSignatoriesSaved(true);
      setTimeout(() => setSignatoriesSaved(false), 2000);
    }
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentText.trim()) return;
    setSignatoriesForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAttachmentText.trim()],
    }));
    setNewAttachmentText('');
  };

  const handleRemoveAttachment = (index: number) => {
    setSignatoriesForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  // Filtered applicants
  const filteredApplicants = applicantList.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (app.fullName || '').toLowerCase().includes(q) ||
      (app.nameEnglish || '').toLowerCase().includes(q) ||
      (app.nameBangla || '').toLowerCase().includes(q) ||
      (app.token || '').toLowerCase().includes(q) ||
      (app.serialNo || '').toLowerCase().includes(q) ||
      (app.collegeRoll || '').toLowerCase().includes(q) ||
      (app.department || '').toLowerCase().includes(q) ||
      (app.session || '').toLowerCase().includes(q) ||
      (app.phone || '').includes(q);

    const matchesStatus =
      statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedApplicants = applicantList.filter((a) => a.status === 'Selected' || a.status === 'Shortlisted');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <UserPlus className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Cadet Recruitment & Selection Hub
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Publish circulars, review recruit applications, export records directly to Excel (.xlsx), and publish selected cadet rolls.
          </p>
        </div>

        {/* Action Buttons: Export to Excel with Categories */}
        <div className="relative self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExportToExcel('All')}
              className="japandi-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#1c1c18]" />
              <span>Export All (.xlsx)</span>
            </button>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2.5 rounded-xl border border-[#cdc6b3] dark:border-[#423e35] bg-[#e4dfd3] dark:bg-[#2a2824] hover:bg-[#eedc82] text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer transition-colors"
              title="More export categories"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#23211c] border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl shadow-xl z-30 p-1.5 space-y-1 text-xs">
              <button
                onClick={() => handleExportToExcel('All')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f3ed] dark:hover:bg-[#2e2b24] font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center justify-between"
              >
                <span>All Applicants</span>
                <span className="text-[10px] bg-[#eedc82]/50 px-1.5 py-0.5 rounded text-[#6b5e10]">{applicantList.length}</span>
              </button>
              <button
                onClick={() => handleExportToExcel('Selected')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between"
              >
                <span>Selected Cadets</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-200">
                  {applicantList.filter((a) => a.status === 'Selected' || a.status === 'Shortlisted').length}
                </span>
              </button>
              <button
                onClick={() => handleExportToExcel('Pending')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between"
              >
                <span>Pending Applicants</span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">
                  {applicantList.filter((a) => a.status === 'Pending').length}
                </span>
              </button>
              <button
                onClick={() => handleExportToExcel('Rejected')}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-rose-800 dark:text-rose-300 flex items-center justify-between"
              >
                <span>Rejected Applications</span>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-900 px-1.5 py-0.5 rounded text-rose-800 dark:text-rose-200">
                  {applicantList.filter((a) => a.status === 'Rejected').length}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-[#f0eee8] dark:bg-[#141311] p-1.5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35]">
        <button
          onClick={() => setActiveSubtab('applicants')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubtab === 'applicants'
              ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
              : 'text-[#695c4e] dark:text-[#aca596]'
          }`}
        >
          Applicants Pool ({applicantList.length})
        </button>
        <button
          onClick={() => setActiveSubtab('selectedList')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubtab === 'selectedList'
              ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
              : 'text-[#695c4e] dark:text-[#aca596]'
          }`}
        >
          Selected Cadet List ({selectedApplicants.length})
        </button>
        <button
          onClick={() => setActiveSubtab('announcement')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubtab === 'announcement'
              ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
              : 'text-[#695c4e] dark:text-[#aca596]'
          }`}
        >
          Recruitment Circular & Eligibility
        </button>
        <button
          onClick={() => setActiveSubtab('signatories')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubtab === 'signatories'
              ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
              : 'text-[#695c4e] dark:text-[#aca596]'
          }`}
        >
          Yearly Form Signatories
        </button>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="ml-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-[#e4dfd3] dark:bg-[#2a2824] hover:bg-[#eedc82] text-[#1c1c18] dark:text-[#fcfbf7] disabled:opacity-50"
          title="Reload fresh applicants from database"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh List'}</span>
        </button>
      </div>

      {/* SUBTAB 1: APPLICANTS POOL */}
      {activeSubtab === 'applicants' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#fcf9f3] dark:bg-[#1e1d19] p-4 rounded-2xl border border-[#cdc6b3]/40 dark:border-[#423e35]">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7c7767]" />
              <input
                type="text"
                placeholder="Search applicant by name, roll, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] pl-9 pr-3 py-1.5 rounded-xl text-xs text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#f6f3ed] dark:bg-[#141311] p-1 rounded-xl border border-[#cdc6b3]/50 dark:border-[#423e35] text-xs">
                {(['All', 'Selected', 'Pending', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#eedc82] text-[#1c1c18]'
                        : 'text-[#695c4e] dark:text-[#aca596]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f6f3ed] dark:bg-[#161512] border-b border-[#cdc6b3]/50 dark:border-[#423e35] text-[#555042] dark:text-[#aca596] font-bold">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">College Roll</th>
                    <th className="py-3 px-4">Department & Session</th>
                    <th className="py-3 px-4">Physical / Blood</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdc6b3]/30 dark:divide-[#333]">
                  {filteredApplicants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[#7c7767]">
                        No applicants found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map((app, appIdx) => (
                      <tr key={app.id ? `applicant-${app.id}-${appIdx}` : `applicant-${appIdx}`} className="hover:bg-[#f6f3ed]/60 dark:hover:bg-[#23211c]/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">
                            {app.fullName}
                          </span>
                          <span className="text-[10px] text-[#7c7767]">Applied: {app.appliedAt}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#6b5e10] dark:text-[#eedc82]">
                          {app.collegeRoll}
                        </td>
                        <td className="py-3 px-4 text-[#555042] dark:text-[#cdc6b3]">
                          <div>{app.department}</div>
                          <div className="text-[10px] text-[#7c7767]">{app.session}</div>
                        </td>
                        <td className="py-3 px-4 text-[#555042] dark:text-[#cdc6b3]">
                          <div>{app.height} • {app.weight}</div>
                          <span className="inline-block text-[10px] font-mono font-bold bg-[#eedc82]/30 text-[#6b5e10] px-1.5 rounded">
                            {app.bloodGroup}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#555042] dark:text-[#cdc6b3]">
                          <div>{app.phone}</div>
                          <div className="text-[10px] text-[#7c7767]">{app.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              app.status === 'Selected'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : app.status === 'Rejected'
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* A4 PDF Slip Download / Print */}
                            <button
                              onClick={() => setPrintingApplicant(app)}
                              title="Download / Print A4 PDF Application Slip"
                              className="p-1.5 rounded-lg text-[#6b5e10] dark:text-[#eedc82] hover:bg-[#eedc82]/20 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Application (Full Form Modal) */}
                            <button
                              onClick={() => setEditingApplicant(app)}
                              title="Update / Edit Application Data (Full Form)"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/10 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Retrieve / Restore Rejected Applicant */}
                            {app.status === 'Rejected' ? (
                              <button
                                onClick={() => {
                                  updateApplicantStatus(app.id, 'Pending');
                                }}
                                title="Retrieve / Restore Application (Move back to Pending)"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 cursor-pointer flex items-center gap-1 font-bold"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <>
                                {/* Select Candidate */}
                                <button
                                  onClick={() => updateApplicantStatus(app.id, 'Selected')}
                                  title="Select Candidate"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                {/* Reject Candidate */}
                                <button
                                  onClick={() => updateApplicantStatus(app.id, 'Rejected')}
                                  title="Reject Candidate"
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`Delete recruitment application for "${app.fullName}"? This action cannot be undone.`)) {
                                  deleteApplicant(app.id);
                                }
                              }}
                              title="Permanently Delete Application"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SELECTED CADET LIST */}
      {activeSubtab === 'selectedList' && (
        <div className="space-y-4">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-5 rounded-3xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cdc6b3]/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Official Selected Cadet Roll Notice</span>
                </h3>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                  This list will appear on the public recruitment page and notice board under &quot;Final Selected Cadets&quot;.
                </p>
              </div>
            </div>

            {/* Quick Add Selected Cadet */}
            <form onSubmit={handleAddSelectedCadet} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <input
                type="text"
                required
                placeholder="College Roll / Cadet ID (e.g. 24018)"
                value={newSelectedRoll}
                onChange={(e) => setNewSelectedRoll(e.target.value)}
                className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
              />
              <input
                type="text"
                required
                placeholder="Cadet Full Name"
                value={newSelectedName}
                onChange={(e) => setNewSelectedName(e.target.value)}
                className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
              <input
                type="text"
                placeholder="Department (e.g. English)"
                value={newSelectedDept}
                onChange={(e) => setNewSelectedDept(e.target.value)}
                className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              />
              <button
                type="submit"
                className="japandi-btn-primary text-xs py-2 px-3 font-bold cursor-pointer"
              >
                + Add to Selected Roll
              </button>
            </form>

            <div className="divide-y divide-[#cdc6b3]/30 dark:divide-[#333] pt-2">
              {selectedApplicants.map((sel, idx) => (
                <div key={sel.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#eedc82] text-[#1c1c18] font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                        {sel.fullName}
                      </span>
                      <span className="text-[#7c7767] ml-2 font-mono">
                        (Roll: {sel.collegeRoll})
                      </span>
                      <span className="text-[#7c7767] ml-2">
                        • {sel.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateApplicantStatus(sel.id, 'Pending')}
                      className="japandi-btn-secondary text-[11px] py-1 px-2 cursor-pointer"
                    >
                      Move to Pending
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ANNOUNCEMENT & ELIGIBILITY */}
      {activeSubtab === 'announcement' && (
        <div className="space-y-6 max-w-4xl">
          {/* Status Alert Banner if saved */}
          {announcementSaved && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Recruitment Circular Announcement has been successfully published and updated!</span>
            </div>
          )}

          {/* VIEW 1: ACTIVE PUBLISHED CIRCULAR CARD */}
          {hasActiveCircular && !isEditingCircular && (
            <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-[#eedc82]/60 text-[#6b5e10] dark:text-[#eedc82]">
                    <Megaphone className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Active & Published
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                        {announcementForm.batch || 'Batch Circular'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] mt-1">
                      Recruitment Circular Announcement
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditingCircular(true)}
                    className="japandi-btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Circular</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCircular}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Circular</span>
                  </button>
                </div>
              </div>

              {/* Main Circular Details */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-[#7c7767] dark:text-[#aca596] uppercase tracking-wider">
                    Official Circular Title
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-[#1c1c18] dark:text-[#fcfbf7] mt-0.5">
                    {announcementForm.title}
                  </h2>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/40 dark:border-[#38342c]">
                    <div className="flex items-center gap-1.5 text-[#6b5e10] dark:text-[#eedc82] text-xs font-bold mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Start Date & Time</span>
                    </div>
                    <p className="text-xs font-mono text-[#1c1c18] dark:text-[#fcfbf7]">
                      {announcementForm.startDate ? new Date(announcementForm.startDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Immediate Announcement'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/40 dark:border-[#38342c]">
                    <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-bold mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Application Deadline</span>
                    </div>
                    <p className="text-xs font-mono text-[#1c1c18] dark:text-[#fcfbf7]">
                      {announcementForm.endDate ? new Date(announcementForm.endDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : announcementForm.deadline || '15 October 2026'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/40 dark:border-[#38342c]">
                    <div className="flex items-center gap-1.5 text-[#6b5e10] dark:text-[#eedc82] text-xs font-bold mb-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>Selection & Test Venue</span>
                    </div>
                    <p className="text-xs text-[#1c1c18] dark:text-[#fcfbf7]">
                      {announcementForm.venue || 'College Gymnasium & Main Parade Ground, NGDC'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {announcementForm.description && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-[#7c7767] dark:text-[#aca596] uppercase tracking-wider">
                      Circular Overview & Note
                    </span>
                    <p className="text-xs sm:text-sm text-[#454138] dark:text-[#ded8cb] leading-relaxed mt-1 whitespace-pre-line bg-[#f6f3ed]/60 dark:bg-[#141311]/60 p-4 rounded-2xl border border-[#cdc6b3]/30">
                      {announcementForm.description}
                    </p>
                  </div>
                )}

                {/* Eligibility Criteria */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[#7c7767] dark:text-[#aca596] uppercase tracking-wider">
                    Eligibility Requirements
                  </span>
                  <div className="mt-2 space-y-2">
                    {(announcementForm.eligibilityCriteria || []).map((crit, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#252420] border border-[#cdc6b3]/40 dark:border-[#38342c] text-xs text-[#1c1c18] dark:text-[#fcfbf7]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer note */}
                {announcementForm.footerText && (
                  <div className="text-[11px] text-[#7c7767] dark:text-[#aca596] italic bg-[#eedc82]/15 p-3 rounded-xl border border-[#eedc82]/40">
                    <span className="font-bold not-italic">Notice Note: </span>
                    {announcementForm.footerText}
                  </div>
                )}
              </div>

              {/* Bottom Quick Tools */}
              <div className="pt-3 border-t border-[#cdc6b3]/40 dark:border-[#38342c] flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                  Public view is actively displaying this circular and accepting online applicant submissions.
                </p>
                <button
                  type="button"
                  onClick={() => setPrintBlankModal(true)}
                  className="japandi-btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Preview Blank Application Form (A4)</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: EMPTY STATE WHEN NO CIRCULAR EXISTS */}
          {!hasActiveCircular && !isEditingCircular && (
            <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center justify-center mx-auto">
                <Megaphone className="w-8 h-8 opacity-80" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  No Active Recruitment Circular
                </h3>
                <p className="text-xs sm:text-sm text-[#7c7767] dark:text-[#aca596] leading-relaxed">
                  Currently there is no active recruitment circular announcement published. Public recruitment view displays:
                </p>
                <div className="p-3 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/60 dark:border-[#38342c] rounded-2xl text-xs font-bold text-[#6b5e10] dark:text-[#eedc82]">
                  &quot;Currently recruitment is Unavailable&quot;
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartNewCircular}
                  className="japandi-btn-primary text-xs sm:text-sm py-3 px-6 font-bold flex items-center gap-2 mx-auto cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Recruitment Circular</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: CIRCULAR EDITOR FORM */}
          {isEditingCircular && (
            <form
              onSubmit={handleSaveAnnouncement}
              className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] p-6 sm:p-8 rounded-3xl space-y-5 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-[#eedc82]/60 text-[#6b5e10] dark:text-[#eedc82]">
                    <Megaphone className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7]">
                      {hasActiveCircular ? 'Edit Recruitment Circular Announcement' : 'Publish New Recruitment Circular Announcement'}
                    </h3>
                    <p className="text-[11px] text-[#7c7767] dark:text-[#aca596]">
                      Publishing this circular will activate public online admissions and show the circular notice.
                    </p>
                  </div>
                </div>

                {hasActiveCircular && (
                  <button
                    type="button"
                    onClick={() => setIsEditingCircular(false)}
                    className="p-1.5 rounded-full hover:bg-[#ede8dc] dark:hover:bg-[#2b2822] text-[#7c7767] cursor-pointer"
                    title="Cancel edit"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Circular Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cadet Recruitment Batch 2026 Enrolment Circular"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Batch Tag / Circular Reference <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batch 26 or Batch 2026-2027"
                    value={announcementForm.batch}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, batch: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              {/* Timeframe Workflow Box */}
              <div className="p-4 rounded-2xl bg-[#eedc82]/20 border border-[#eedc82]/60 space-y-3">
                <h4 className="font-bold text-xs text-[#6b5e10] dark:text-[#eedc82] flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Recruitment Timeframe Workflow (Announcement Window)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Announcement Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={announcementForm.startDate || ''}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, startDate: e.target.value })}
                      className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                      Application Closing Deadline (End Date & Time)
                    </label>
                    <input
                      type="datetime-local"
                      value={announcementForm.endDate || ''}
                      onChange={(e) =>
                        setAnnouncementForm({
                          ...announcementForm,
                          endDate: e.target.value,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full bg-white dark:bg-[#252420] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div className="text-xs">
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Physical Test, Interview & Submission Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. College Gymnasium & Main Parade Ground, NGDC Room 123"
                  value={announcementForm.venue || ''}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, venue: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              {/* Description */}
              <div className="text-xs">
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Description & Welcome Note
                </label>
                <textarea
                  rows={3}
                  value={announcementForm.description}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Eligibility Criteria */}
              <div className="text-xs space-y-2">
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Eligibility Criteria Requirements
                </label>
                <div className="space-y-2">
                  {(announcementForm.eligibilityCriteria || []).map((crit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={crit}
                        onChange={(e) => {
                          const updated = [...(announcementForm.eligibilityCriteria || [])];
                          updated[idx] = e.target.value;
                          setAnnouncementForm({ ...announcementForm, eligibilityCriteria: updated });
                        }}
                        className="flex-grow bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        className="p-2 text-rose-600 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCriterion('New eligibility requirement')}
                  className="text-xs font-bold text-[#6b5e10] dark:text-[#eedc82] hover:underline cursor-pointer pt-1 inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Requirement Bullet</span>
                </button>
              </div>

              {/* Footer text */}
              <div className="text-xs">
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Official Notice Footer Text / Inquiry Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. For inquiries, contact Platoon HQ Room 123 or call +880 1712-345678."
                  value={announcementForm.footerText || ''}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, footerText: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#cdc6b3]/40 dark:border-[#423e35]">
                {hasActiveCircular && (
                  <button
                    type="button"
                    onClick={() => setIsEditingCircular(false)}
                    className="japandi-btn-secondary text-xs py-2.5 px-4 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2.5 px-6 font-bold cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Circular Announcement</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* SUBTAB 4: YEARLY FORM SIGNATORIES */}
      {activeSubtab === 'signatories' && (
        <div className="space-y-6">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#38342c] p-5 sm:p-6 rounded-3xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cdc6b3]/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
                    <Building className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Yearly Form Signatories & Official Document Settings
                  </h3>
                </div>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1">
                  Configure the official signatories that appear on Page 2 of the printable recruit admission form (Countersigned Platoon Commander, Senior Cadet, and Form Provider). Update annually when leadership changes.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPrintBlankModal(true)}
                  className="japandi-btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Preview Blank Form</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSignatories}
                  className="p-2 rounded-xl text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-gray-300 dark:border-gray-700 transition-colors"
                  title="Reset to default platoon officers"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {signatoriesSaved && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-bold animate-fadeIn">
                <Check className="w-4 h-4" />
                <span>Signatories configuration updated and saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSignatories} className="space-y-6 text-xs text-[#1c1c18] dark:text-[#fcfbf7]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Countersigned Officer */}
                <div className="bg-[#f6f3ed] dark:bg-[#25231c] p-4 sm:p-5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6b5e10] dark:bg-[#eedc82]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                      1. Countersigned Authority (Platoon Commander)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold block mb-1">Rank & Officer Full Name: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.countersignedName || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedName: e.target.value })}
                        placeholder="e.g. PUO Md. Abdul Matin"
                        className="japandi-input w-full font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1">Personal No / P-No: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.countersignedPNo || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedPNo: e.target.value })}
                          placeholder="e.g. P-819"
                          className="japandi-input w-full font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Battalion: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.countersignedBattalion || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedBattalion: e.target.value })}
                          placeholder="e.g. 31 BNCC Battalion"
                          className="japandi-input w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1">Regiment: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.countersignedRegiment || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedRegiment: e.target.value })}
                          placeholder="e.g. Mahasthan Regiment"
                          className="japandi-input w-full"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Platoon Appointment / Title: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.countersignedTitle || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedTitle: e.target.value })}
                          placeholder="e.g. Platoon Commander"
                          className="japandi-input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Institution Name: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.countersignedInstitution || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, countersignedInstitution: e.target.value })}
                        placeholder="e.g. New Govt. Degree College, Rajshahi"
                        className="japandi-input w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        Official Signature / Seal Image:
                      </label>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-2">
                        Upload Platoon Commander's signature or stamp to automatically appear on the official 2-page recruitment slip.
                      </p>
                      <CloudinaryUploader
                        value={signatoriesForm.countersignedSignatureUrl || ''}
                        onChange={(url) => setSignatoriesForm({ ...signatoriesForm, countersignedSignatureUrl: url })}
                        onUploadComplete={(url) => setSignatoriesForm({ ...signatoriesForm, countersignedSignatureUrl: url })}
                        folder="bncc_signatures"
                        label="Upload Commander Signature"
                        helpText="PNG/JPG with transparent or white background"
                        aspectRatio="banner"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Platoon Senior Cadet */}
                <div className="bg-[#f6f3ed] dark:bg-[#25231c] p-4 sm:p-5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6b5e10] dark:bg-[#eedc82]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                      2. Signature of Platoon Senior Cadet
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold block mb-1">Rank & Cadet Full Name: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.seniorCadetRankAndName || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetRankAndName: e.target.value })}
                        placeholder="e.g. Cadet Sergeant Touhid"
                        className="japandi-input w-full font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1">Cadet ID / No (Optional):</label>
                        <input
                          type="text"
                          value={signatoriesForm.seniorCadetNo || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetNo: e.target.value })}
                          placeholder="e.g. CDT-2022-04"
                          className="japandi-input w-full font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Battalion: *</label>
                        <input
                          type="text"
                          required
                          value={signatoriesForm.seniorCadetBattalion || ''}
                          onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetBattalion: e.target.value })}
                          placeholder="e.g. 31 BNCC Battalion"
                          className="japandi-input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Regiment: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.seniorCadetRegiment || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetRegiment: e.target.value })}
                        placeholder="e.g. Mahasthan Regiment"
                        className="japandi-input w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Institution Name: *</label>
                      <input
                        type="text"
                        required
                        value={signatoriesForm.seniorCadetInstitution || ''}
                        onChange={(e) => setSignatoriesForm({ ...signatoriesForm, seniorCadetInstitution: e.target.value })}
                        placeholder="e.g. New Govt. Degree College, Rajshahi"
                        className="japandi-input w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        Senior Cadet Signature Image:
                      </label>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-2">
                        Upload Senior Cadet's signature to appear on the official 2-page recruitment slip.
                      </p>
                      <CloudinaryUploader
                        value={signatoriesForm.seniorCadetSignatureUrl || ''}
                        onChange={(url) => setSignatoriesForm({ ...signatoriesForm, seniorCadetSignatureUrl: url })}
                        onUploadComplete={(url) => setSignatoriesForm({ ...signatoriesForm, seniorCadetSignatureUrl: url })}
                        folder="bncc_signatures"
                        label="Upload Senior Cadet Signature"
                        helpText="PNG/JPG with transparent or white background"
                        aspectRatio="banner"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Form Provider & Attachments Box */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#f6f3ed] dark:bg-[#25231c] p-4 sm:p-5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                    3. Signature of Form Provider Block
                  </h4>
                  <div>
                    <label className="font-bold block mb-1">Heading / Designation Label:</label>
                    <input
                      type="text"
                      value={signatoriesForm.formProviderTitle || ''}
                      onChange={(e) => setSignatoriesForm({ ...signatoriesForm, formProviderTitle: e.target.value })}
                      placeholder="Signature of Form Provider:"
                      className="japandi-input w-full"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Appears on the left signatory column above the date line.
                    </span>
                  </div>
                </div>

                <div className="bg-[#f6f3ed] dark:bg-[#25231c] p-4 sm:p-5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                    4. Required Attachments List (Printed on Page 2)
                  </h4>
                  <ul className="space-y-1.5">
                    {(signatoriesForm.attachments || []).map((att, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-white dark:bg-[#1e1d19] p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-[11px]">
                        <span>{idx + 1}. {att}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newAttachmentText}
                      onChange={(e) => setNewAttachmentText(e.target.value)}
                      placeholder="Add attachment (e.g. 02 Passport Photos)"
                      className="japandi-input flex-1 text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="japandi-btn-secondary px-3 text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="border border-dashed border-gray-400 p-4 rounded-2xl bg-white dark:bg-[#1e1d19] text-black dark:text-white space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Live Preview: Page 2 Official Signatures Block
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-black pt-3">
                  <div className="border-t border-dashed border-gray-400 pt-1">
                    <span className="font-bold block">{signatoriesForm.formProviderTitle || 'Signature of Form Provider:'}</span>
                    <span className="text-gray-500 text-[9px]">Date: ........................</span>
                  </div>
                  <div className="border-t border-dashed border-gray-400 pt-1">
                    <span className="font-bold uppercase text-[9px] block">Countersigned:</span>
                    <span className="font-bold block text-[10px]">{signatoriesForm.countersignedName}</span>
                    <span className="block font-mono text-[9px]">{signatoriesForm.countersignedPNo}</span>
                    <span className="block text-[9px]">{signatoriesForm.countersignedBattalion}</span>
                    <span className="block text-[9px]">{signatoriesForm.countersignedRegiment}</span>
                    <span className="font-semibold block text-[9px]">{signatoriesForm.countersignedTitle}</span>
                    <span className="block text-[8px] text-gray-500">{signatoriesForm.countersignedInstitution}</span>
                  </div>
                  <div className="border-t border-dashed border-gray-400 pt-1">
                    <span className="font-bold text-[9px] block">Signature of Platoon Senior Cadet:</span>
                    <span className="font-bold block text-[10px] mt-0.5">{signatoriesForm.seniorCadetRankAndName}</span>
                    {signatoriesForm.seniorCadetNo ? <span className="block font-mono text-[9px]">{signatoriesForm.seniorCadetNo}</span> : null}
                    <span className="block text-[9px]">{signatoriesForm.seniorCadetBattalion}</span>
                    <span className="block text-[9px]">{signatoriesForm.seniorCadetRegiment}</span>
                    <span className="block text-[8px] text-gray-500">{signatoriesForm.seniorCadetInstitution}</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#cdc6b3]/50">
                <button
                  type="submit"
                  className="japandi-btn-primary px-6 py-2.5 font-bold text-xs shadow-md cursor-pointer"
                >
                  Save Yearly Signatories
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECRUITMENT APPLICATION FULL-PAGE / FULL-FORM EDIT MODAL */}
      {editingApplicant && (
        <RecruitmentApplicationEditModal
          applicant={editingApplicant}
          onClose={() => setEditingApplicant(null)}
          onSave={(updated) => {
            updateRecruitmentApplicant(updated.id, updated);
            setEditingApplicant(null);
          }}
        />
      )}

      {/* A4 PRINTABLE APPLICATION SLIP MODAL */}
      {printingApplicant && (
        <RecruitmentApplicationSlipA4
          applicant={printingApplicant}
          announcement={announcementForm}
          formFields={recruitmentFields}
          onClose={() => setPrintingApplicant(null)}
        />
      )}

      {/* BLANK FORM PREVIEW MODAL */}
      {printBlankModal && (
        <RecruitmentApplicationSlipA4
          isBlank={true}
          announcement={announcementForm}
          signatories={signatoriesForm}
          onClose={() => setPrintBlankModal(false)}
        />
      )}
    </div>
  );
};
