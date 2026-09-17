import React, { useState } from 'react';
import {
  X,
  User,
  BookOpen,
  MapPin,
  Activity,
  Award,
  Upload,
  CheckCircle2,
  Save,
  AlertCircle,
  FileText,
  Shield,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { RecruitmentApplicant, ApplicantAddress, ApplicantQualification } from '../../types';
import {
  BANGLADESH_DIVISIONS,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  BANGLADESH_EDUCATION_BOARDS,
  DIVISION_GROUP_OPTIONS,
} from '../../data/bangladeshGeoData';
import { processPassportPhoto } from '../../utils/cloudinary';

const CURRENT_YEAR = new Date().getFullYear();
const PASSING_YEARS: number[] = Array.from(
  { length: CURRENT_YEAR - 2000 + 1 },
  (_, i) => CURRENT_YEAR - i
);

interface RecruitmentApplicationEditModalProps {
  applicant: RecruitmentApplicant;
  onClose: () => void;
  onSave: (updatedApplicant: RecruitmentApplicant) => void;
}

export const RecruitmentApplicationEditModal: React.FC<RecruitmentApplicationEditModalProps> = ({
  applicant,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<RecruitmentApplicant>({
    ...applicant,
    fullName: applicant.fullName || applicant.nameEnglish || '',
    nameEnglish: applicant.nameEnglish || applicant.fullName || '',
    nameBangla: applicant.nameBangla || '',
    fatherNameEnglish: applicant.fatherNameEnglish || applicant.fatherName || '',
    fatherNameBangla: applicant.fatherNameBangla || '',
    motherNameEnglish: applicant.motherNameEnglish || applicant.motherName || '',
    motherNameBangla: applicant.motherNameBangla || '',
    gender: applicant.gender || 'Male',
    studentClass: applicant.studentClass || 'HSC 1st Year',
    department: applicant.department || '',
    collegeRoll: applicant.collegeRoll || '',
    session: applicant.session || '2024-2025',
    dateOfBirth: applicant.dateOfBirth || '',
    religion: applicant.religion || 'Islam',
    bloodGroup: applicant.bloodGroup || 'B+',
    heightFeet: applicant.heightFeet || '5',
    heightInches: applicant.heightInches || '6',
    weightKg: applicant.weightKg || applicant.weight || '60',
    chestNormal: applicant.chestNormal || '32',
    chestExpanded: applicant.chestExpanded || '34',
    phoneSelf: applicant.phoneSelf || applicant.phone || '',
    phone: applicant.phone || applicant.phoneSelf || '',
    phoneGuardian: applicant.phoneGuardian || '',
    email: applicant.email || '',
    presentAddress: applicant.presentAddress || {
      division: 'Rajshahi',
      district: 'Rajshahi',
      upazila: 'Boalia',
      post: '',
      village: '',
    },
    permanentAddress: applicant.permanentAddress || {
      division: 'Rajshahi',
      district: 'Rajshahi',
      upazila: 'Boalia',
      post: '',
      village: '',
    },
    qualifications: applicant.qualifications && applicant.qualifications.length > 0
      ? applicant.qualifications
      : [
          { examName: 'SSC', divisionOrGroup: 'Science', passingYear: '2023', gpa: '5.00', board: 'Rajshahi' },
          { examName: 'HSC', divisionOrGroup: 'Science', passingYear: '2025', gpa: '5.00', board: 'Rajshahi' },
        ],
    additionalSkills: applicant.additionalSkills || '',
    reason: applicant.reason || '',
    status: applicant.status || 'Pending',
    avatarUrl: applicant.avatarUrl || applicant.passportPhotoUrl || '',
    pledgeAccepted: applicant.pledgeAccepted !== undefined ? applicant.pledgeAccepted : true,
    guardianConsentAccepted: applicant.guardianConsentAccepted !== undefined ? applicant.guardianConsentAccepted : true,
  });

  const [avatarPreview, setAvatarPreview] = useState<string>(formData.avatarUrl || '');
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sameAsPresent, setSameAsPresent] = useState(false);

  // Address handler
  const handleAddressChange = (
    type: 'present' | 'permanent',
    field: keyof ApplicantAddress,
    value: string
  ) => {
    setFormData((prev) => {
      const current = type === 'present'
        ? { ...(prev.presentAddress || { division: '', district: '', upazila: '', post: '', village: '' }) }
        : { ...(prev.permanentAddress || { division: '', district: '', upazila: '', post: '', village: '' }) };

      (current as any)[field] = value;

      if (field === 'division') {
        current.district = '';
        current.upazila = '';
      } else if (field === 'district') {
        current.upazila = '';
      }

      if (type === 'present') {
        return {
          ...prev,
          presentAddress: current,
          ...(sameAsPresent ? { permanentAddress: { ...current } } : {}),
        };
      } else {
        return {
          ...prev,
          permanentAddress: current,
        };
      }
    });
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setSameAsPresent(checked);
    if (checked && formData.presentAddress) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: { ...prev.presentAddress! },
      }));
    }
  };

  const handleQualificationChange = (index: number, field: keyof ApplicantQualification, value: string) => {
    setFormData((prev) => {
      const quals = [...(prev.qualifications || [])];
      if (!quals[index]) {
        quals[index] = { examName: index === 0 ? 'SSC' : 'HSC', divisionOrGroup: '', passingYear: '', gpa: '', board: '' };
      }
      quals[index] = { ...quals[index], [field]: value };
      return { ...prev, qualifications: quals };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsPhotoProcessing(true);

    try {
      const res = await processPassportPhoto(file, 300);
      if (res && res.url) {
        setAvatarPreview(res.url);
        setFormData((prev) => ({ ...prev, avatarUrl: res.url }));
      }
    } catch (err: any) {
      console.warn('Photo processing failed:', err);
      setErrorMsg(err.message || 'Failed to process passport photo.');
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const effectiveName = formData.nameEnglish?.trim() || formData.fullName?.trim() || 'Cadet Applicant';
    const effectivePhone = formData.phoneSelf?.trim() || formData.phone?.trim() || '';

    const updated: RecruitmentApplicant = {
      ...formData,
      fullName: effectiveName,
      nameEnglish: effectiveName,
      phone: effectivePhone,
      phoneSelf: effectivePhone,
      avatarUrl: avatarPreview || formData.avatarUrl,
      height: `${formData.heightFeet}' ${formData.heightInches || 0}"`,
      weight: `${formData.weightKg} kg`,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#fcf9f3] dark:bg-[#1b1a17] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl w-full max-w-5xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#f6f3ed] dark:bg-[#161512] px-6 py-4 border-b border-[#cdc6b3]/60 dark:border-[#423e35] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <span>Edit Recruitment Application:</span>
                <span className="text-[#6b5e10] dark:text-[#eedc82]">{formData.fullName || 'Applicant Form'}</span>
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#7c7767] font-mono mt-0.5">
                <span>Serial: {formData.serialNo || formData.token || formData.id}</span>
                <span>• Applied: {formData.appliedAt || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] hover:bg-[#e6e1d5] dark:hover:bg-[#2a2824] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 0: Status & Photo Top Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#23211c] p-4 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35]">
            <div className="space-y-1.5">
              <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                Application Decision / Enrolment Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
              >
                <option value="Pending">Pending Evaluation</option>
                <option value="Shortlisted">Shortlisted for Viva/Physical Test</option>
                <option value="Selected">Selected / Approved Cadet</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center gap-4">
              <div className="w-20 h-24 rounded-xl border-2 border-dashed border-[#cdc6b3] dark:border-[#423e35] bg-[#f6f3ed] dark:bg-[#141311] overflow-hidden flex items-center justify-center shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Applicant" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#7c7767]" />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Replace / Update Passport Photograph
                </label>
                <p className="text-[11px] text-[#7c7767]">
                  Formal passport size portrait (300×300 px, auto-compressed under 300 KB).
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e4dfd3] dark:bg-[#2a2824] hover:bg-[#eedc82] text-[#1c1c18] dark:text-[#fcfbf7] font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isPhotoProcessing ? 'Processing Photo...' : 'Upload New Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isPhotoProcessing}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section 1: Personal Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
              <User className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>1. Applicant Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Full Name (English - Block Letters) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameEnglish}
                  onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value.toUpperCase(), fullName: e.target.value.toUpperCase() })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Full Name in Bengali (বাংলায় পূর্ণ নাম)
                </label>
                <input
                  type="text"
                  value={formData.nameBangla || ''}
                  onChange={(e) => setFormData({ ...formData, nameBangla: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Father&apos;s Name (English)
                </label>
                <input
                  type="text"
                  value={formData.fatherNameEnglish || ''}
                  onChange={(e) => setFormData({ ...formData, fatherNameEnglish: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Father&apos;s Name in Bengali (পিতার নাম)
                </label>
                <input
                  type="text"
                  value={formData.fatherNameBangla || ''}
                  onChange={(e) => setFormData({ ...formData, fatherNameBangla: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Mother&apos;s Name (English)
                </label>
                <input
                  type="text"
                  value={formData.motherNameEnglish || ''}
                  onChange={(e) => setFormData({ ...formData, motherNameEnglish: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Mother&apos;s Name in Bengali (মাতার নাম)
                </label>
                <input
                  type="text"
                  value={formData.motherNameBangla || ''}
                  onChange={(e) => setFormData({ ...formData, motherNameBangla: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                >
                  <option value="Male">Male (পুরুষ)</option>
                  <option value="Female">Female (মহিলা)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Religion *
                </label>
                <select
                  value={formData.religion}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                >
                  <option value="Islam">Islam (ইসলাম)</option>
                  <option value="Hinduism">Hinduism (হিন্দু)</option>
                  <option value="Buddhism">Buddhism (বৌদ্ধ)</option>
                  <option value="Christianity">Christianity (খ্রিস্টান)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Blood Group *
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={`modal-bg-${bg}`} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: College Academic Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
              <BookOpen className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>2. NGDC College Academic Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  College Class / Year *
                </label>
                <select
                  value={formData.studentClass}
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-medium"
                >
                  <option value="HSC 1st Year">HSC 1st Year</option>
                  <option value="HSC 2nd Year">HSC 2nd Year</option>
                  <option value="Honours 1st Year">Honours 1st Year</option>
                  <option value="Honours 2nd Year">Honours 2nd Year</option>
                  <option value="Degree 1st Year">Degree 1st Year</option>
                  <option value="Degree 2nd Year">Degree 2nd Year</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Department / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  College Roll No. *
                </label>
                <input
                  type="text"
                  required
                  value={formData.collegeRoll}
                  onChange={(e) => setFormData({ ...formData, collegeRoll: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Academic Session *
                </label>
                <input
                  type="text"
                  required
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical & Health Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
              <Activity className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>3. Physical Fitness & Health Standards</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Height (Feet & Inches) *
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={4}
                    max={7}
                    placeholder="Ft"
                    value={formData.heightFeet}
                    onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                    className="w-1/2 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl text-center font-bold"
                  />
                  <input
                    type="number"
                    min={0}
                    max={11}
                    placeholder="In"
                    value={formData.heightInches}
                    onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                    className="w-1/2 bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2 py-2 rounded-xl text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Weight (in Kilograms) *
                </label>
                <input
                  type="number"
                  placeholder="kg"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-center font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Chest Normal (Inches)
                </label>
                <input
                  type="text"
                  placeholder='e.g. 32"'
                  value={formData.chestNormal || ''}
                  onChange={(e) => setFormData({ ...formData, chestNormal: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-center font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Chest Expanded (Inches)
                </label>
                <input
                  type="text"
                  placeholder='e.g. 34"'
                  value={formData.chestExpanded || ''}
                  onChange={(e) => setFormData({ ...formData, chestExpanded: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-center font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Bangladesh Address */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
              <MapPin className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>4. Contact Numbers & Addresses</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Applicant Mobile (Self) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneSelf || formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phoneSelf: e.target.value, phone: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Parent / Guardian Mobile
                </label>
                <input
                  type="tel"
                  value={formData.phoneGuardian || ''}
                  onChange={(e) => setFormData({ ...formData, phoneGuardian: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>
            </div>

            {/* Present Address */}
            <div className="bg-[#f6f3ed]/60 dark:bg-[#23211c] p-4 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-3">
              <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7] block">
                Present Address (বর্তমান ঠিকানা)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7c7767] mb-1">Division</label>
                  <select
                    value={formData.presentAddress?.division || ''}
                    onChange={(e) => handleAddressChange('present', 'division', e.target.value)}
                    className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                  >
                    <option value="">Select Division</option>
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={`pres-div-${d.id}`} value={d.name}>{d.name} ({d.bnName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7c7767] mb-1">District</label>
                  <select
                    value={formData.presentAddress?.district || ''}
                    onChange={(e) => handleAddressChange('present', 'district', e.target.value)}
                    className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                  >
                    <option value="">Select District</option>
                    {getDistrictsByDivision(formData.presentAddress?.division || '').map((dst) => (
                      <option key={`pres-dst-${dst.id}`} value={dst.name}>{dst.name} ({dst.bnName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7c7767] mb-1">Upazila / Thana</label>
                  <select
                    value={formData.presentAddress?.upazila || ''}
                    onChange={(e) => handleAddressChange('present', 'upazila', e.target.value)}
                    className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                  >
                    <option value="">Select Upazila</option>
                    {getUpazilasByDistrict(formData.presentAddress?.district || '').map((upz) => (
                      <option key={`pres-upz-${upz}`} value={upz}>{upz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Post Office (ডাকঘর)"
                  value={formData.presentAddress?.post || ''}
                  onChange={(e) => handleAddressChange('present', 'post', e.target.value)}
                  className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Village / Road / House (গ্রাম / রাস্তা)"
                  value={formData.presentAddress?.village || ''}
                  onChange={(e) => handleAddressChange('present', 'village', e.target.value)}
                  className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                />
              </div>
            </div>

            {/* Permanent Address */}
            <div className="bg-[#f6f3ed]/60 dark:bg-[#23211c] p-4 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Permanent Address (স্থায়ী ঠিকানা)
                </span>
                <label className="inline-flex items-center gap-1.5 text-xs text-[#7c7767] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsPresent}
                    onChange={(e) => handleSameAddressToggle(e.target.checked)}
                    className="rounded text-[#6b5e10]"
                  />
                  <span>Same as Present Address</span>
                </label>
              </div>

              {!sameAsPresent && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#7c7767] mb-1">Division</label>
                      <select
                        value={formData.permanentAddress?.division || ''}
                        onChange={(e) => handleAddressChange('permanent', 'division', e.target.value)}
                        className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                      >
                        <option value="">Select Division</option>
                        {BANGLADESH_DIVISIONS.map((d) => (
                          <option key={`perm-div-${d.id}`} value={d.name}>{d.name} ({d.bnName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#7c7767] mb-1">District</label>
                      <select
                        value={formData.permanentAddress?.district || ''}
                        onChange={(e) => handleAddressChange('permanent', 'district', e.target.value)}
                        className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                      >
                        <option value="">Select District</option>
                        {getDistrictsByDivision(formData.permanentAddress?.division || '').map((dst) => (
                          <option key={`perm-dst-${dst.id}`} value={dst.name}>{dst.name} ({dst.bnName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#7c7767] mb-1">Upazila / Thana</label>
                      <select
                        value={formData.permanentAddress?.upazila || ''}
                        onChange={(e) => handleAddressChange('permanent', 'upazila', e.target.value)}
                        className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                      >
                        <option value="">Select Upazila</option>
                        {getUpazilasByDistrict(formData.permanentAddress?.district || '').map((upz) => (
                          <option key={`perm-upz-${upz}`} value={upz}>{upz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Post Office (ডাকঘর)"
                      value={formData.permanentAddress?.post || ''}
                      onChange={(e) => handleAddressChange('permanent', 'post', e.target.value)}
                      className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Village / Road / House (গ্রাম / রাস্তা)"
                      value={formData.permanentAddress?.village || ''}
                      onChange={(e) => handleAddressChange('permanent', 'village', e.target.value)}
                      className="w-full bg-white dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-1.5 rounded-xl"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 5: Academic Qualifications */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
              <Award className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>5. Educational Qualifications (SSC / HSC / Equivalent)</span>
            </h3>

            <div className="space-y-2.5">
              {[0, 1].map((idx) => {
                const q = formData.qualifications?.[idx] || { examName: idx === 0 ? 'SSC' : 'HSC', divisionOrGroup: '', passingYear: '', gpa: '', board: '' };
                return (
                  <div key={`modal-qual-${idx}`} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 bg-white dark:bg-[#23211c] p-3 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35]">
                    <div className="font-bold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#eedc82] text-[#1c1c18] font-mono text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={q.examName || (idx === 0 ? 'SSC' : 'HSC')}
                        onChange={(e) => handleQualificationChange(idx, 'examName', e.target.value)}
                        className="bg-transparent font-bold text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                      />
                    </div>

                    <select
                      value={q.divisionOrGroup || ''}
                      onChange={(e) => handleQualificationChange(idx, 'divisionOrGroup', e.target.value)}
                      className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl"
                    >
                      <option value="">Select Group</option>
                      {DIVISION_GROUP_OPTIONS.map((grp) => (
                        <option key={`grp-${idx}-${grp}`} value={grp}>{grp}</option>
                      ))}
                    </select>

                    <select
                      value={q.board || ''}
                      onChange={(e) => handleQualificationChange(idx, 'board', e.target.value)}
                      className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl"
                    >
                      <option value="">Select Board</option>
                      {BANGLADESH_EDUCATION_BOARDS.map((bd) => (
                        <option key={`bd-${idx}-${bd}`} value={bd}>{bd}</option>
                      ))}
                    </select>

                    <select
                      value={q.passingYear || ''}
                      onChange={(e) => handleQualificationChange(idx, 'passingYear', e.target.value)}
                      className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl"
                    >
                      <option value="">Passing Year</option>
                      {PASSING_YEARS.map((yr) => (
                        <option key={`yr-${idx}-${yr}`} value={String(yr)}>{yr}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="GPA (e.g. 5.00)"
                      value={q.gpa || ''}
                      onChange={(e) => handleQualificationChange(idx, 'gpa', e.target.value)}
                      className="bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-2.5 py-1.5 rounded-xl font-bold font-mono"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: Additional Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2 border-b border-[#cdc6b3]/40 pb-2">
              <Shield className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>6. Motivation, Skills & Pledges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Additional Co-curricular Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scouting, Sports, Music, Debate, IT"
                  value={formData.additionalSkills || ''}
                  onChange={(e) => setFormData({ ...formData, additionalSkills: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Reason for Joining BNCC
                </label>
                <input
                  type="text"
                  placeholder="Motivation / Objective"
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#cdc6b3]/60 dark:border-[#423e35] flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#7c7767]">
              All changes are updated instantly to the database and reflected on the official A4 printable application slip.
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#cdc6b3] dark:border-[#423e35] bg-[#e4dfd3] dark:bg-[#2a2824] hover:bg-[#d6cfbe] text-[#1c1c18] dark:text-[#fcfbf7] font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#6b5e10] hover:bg-[#564b0d] dark:bg-[#eedc82] dark:hover:bg-[#dfcd71] text-white dark:text-[#1c1c18] font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save & Update Application</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
