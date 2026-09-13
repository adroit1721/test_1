export type TabType = 'home' | 'about' | 'training' | 'notices' | 'memories' | 'cadets' | 'honor' | 'contact' | 'recruitment' | 'admin';

export type AdminMenuKey = 'home' | 'branding' | 'about' | 'training' | 'notices' | 'memories' | 'cadets' | 'honor' | 'contact' | 'recruitment' | 'footer' | 'security' | 'maintenance';

export type MaintenanceMode = 'disabled' | 'banner' | 'lockdown';
export type BannerSeverity = 'warning' | 'info' | 'critical';

export interface MaintenanceEmergencyContact {
  officerName: string;
  designation: string;
  phone: string;
  email: string;
  officeLocation: string;
  whatsappNumber?: string;
}

export interface MaintenanceConfig {
  mode: MaintenanceMode;
  enabled?: boolean;
  headline: string;
  message: string;
  estimatedRestorationTime: string;
  bannerSeverity: BannerSeverity;
  bannerLinkText?: string;
  bannerLinkUrl?: string;
  bannerDismissible?: boolean;
  emergencyContact: MaintenanceEmergencyContact;
  allowOfficerBypass: boolean;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface HeroSlide {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive?: boolean;
  badge?: string;
  altText?: string;
  [key: string]: any;
}

export interface NoticeItem {
  id: string;
  title?: string;
  date?: string;
  category?: string;
  summary?: string;
  content?: string;
  attachmentUrl?: string;
  isImportant?: boolean;
  circularNo?: string;
  author?: string;
  details?: string;
  pdfUrl?: string;
  priority?: string;
  [key: string]: any;
}

export interface BlogItem {
  id: string;
  title?: string;
  author?: string;
  date?: string;
  category?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  readTime?: string;
  likes?: number;
  authorRole?: string;
  facebookPhotoUrl?: string;
  [key: string]: any;
}

export interface MemoryItem {
  id: string;
  title?: string;
  date?: string;
  category?: string;
  imageUrl?: string;
  description?: string;
  altText?: string;
  location?: string;
  mediaType?: 'photo' | 'video' | string;
  videoUrl?: string;
  [key: string]: any;
}

export interface HonorEntryItem {
  id: string;
  sl?: number | string;
  year?: string;
  cadetName?: string;
  name?: string;
  cadetNumber?: string;
  rank?: string;
  achievement?: string;
  designation?: string;
  tenure?: string;
  remarks?: string;
  badge?: string;
  photoUrl?: string;
  category?: string;
  [key: string]: any;
}

export type HonorCategoryKey = 'commanders' | 'bnccos' | 'seniors' | 'cuo' | 'best_cadet' | 'parade_commander' | 'special_award' | string;

export interface TrainingAnnouncement {
  id: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  dressCode?: string;
  description?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'Upcoming' | 'Ongoing' | 'Completed' | string;
  day?: string;
  activity?: string;
  type?: string;
  category?: string;
  instructor?: string;
  uniform?: string;
  hasRegistrationForm?: boolean;
  [key: string]: any;
}

export interface PlatoonRoutineConfig {
  paradeDays?: string;
  paradeTime?: string;
  location?: string;
  instructor?: string;
  isPublished?: boolean;
  title?: string;
  effectiveDate?: string;
  pdfUrl?: string;
  fileName?: string;
  instructions?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface CustomFormSubmission {
  id: string;
  formId?: string;
  submittedAt?: string;
  data?: Record<string, any>;
  formTitle?: string;
  [key: string]: any;
}

export interface CadetRankHierarchyItem {
  id: string;
  rankTitle?: string;
  cadetName?: string;
  cadetNumber?: string;
  platoon?: string;
  photoUrl?: string;
  order: number;
  rank?: string;
  holderName?: string;
  description?: string;
  image?: string;
}

export interface CustomAboutSection {
  id: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  badge?: string;
  [key: string]: any;
}

export interface CadetUserAccount {
  id: string;
  cadetNumber?: string;
  cadetNo?: string;
  fullName?: string;
  name?: string;
  nameBangla?: string;
  fatherName?: string;
  fatherNameBangla?: string;
  motherName?: string;
  motherNameBangla?: string;
  dob?: string;
  gender?: string;
  religion?: string;
  className?: string;
  section?: string;
  appointment?: string;
  batch?: string;
  collegeId?: string;
  cadetType?: string;
  category?: string;
  isApproved?: boolean;
  password?: string;
  department?: string;
  presentAddress?: string;
  permanentAddress?: string;
  phone?: string;
  guardianPhone?: string;
  currentJob?: string;
  socialMedia?: string;
  additionalSkills?: string;
  achievements?: string;
  joiningDate?: string;
  attendancePercentage?: number | string;
  paradesAttended?: number | string;
  totalParades?: number | string;
  campsAttended?: any;
  certificates?: any;
  rank?: string;
  platoon?: string;
  mobile?: string;
  email?: string;
  bloodGroup?: string;
  photoUrl?: string;
  avatarUrl?: string;
  passwordHash?: string;
  status?: 'active' | 'inactive' | 'alumni' | 'Active' | 'Pending Approval' | 'Alumni' | string;
  [key: string]: any;
}

export type CadetProfile = CadetUserAccount;

export interface CadetPendingUpdate {
  id: string;
  cadetId?: string;
  cadetNo: string;
  cadetName: string;
  changes: Partial<CadetUserAccount>;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'Pending Review' | string;
}

export interface TrainingManual {
  id: string;
  title: string;
  category: 'Drill' | 'Weapons' | 'Map Reading' | 'General Studies' | 'Organization' | 'Leadership' | string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  addedAt: string;
  uploadedBy?: string;
}

export interface FooterSocialLink {
  platform: string;
  url: string;
  label?: string;
  [key: string]: any;
}

export type PlatoonCategory = 'male' | 'female' | string;
export type PlatoonSection = 'a' | 'b' | 'c' | string;

export interface ContactMessage {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
  read?: boolean;
  isRead?: boolean;
  [key: string]: any;
}

export interface ApplicantAddress {
  division?: string;
  district?: string;
  upazila?: string;
  villageOrArea?: string;
  postOffice?: string;
  [key: string]: any;
}

export interface ApplicantQualification {
  examName?: string;
  boardOrInstitute?: string;
  passingYear?: string;
  result?: string;
  [key: string]: any;
}

export interface RecruitmentApplicant {
  id: string;
  applicantId?: string;
  fullName?: string;
  bnFullname?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  bloodGroup?: string;
  mobile?: string;
  email?: string;
  classRoll?: string;
  academicYear?: string;
  group?: string;
  division?: string;
  district?: string;
  upazila?: string;
  address?: string;
  passportPhotoUrl?: string;
  avatarUrl?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'Pending' | string;
  submittedAt?: string;
  appliedAt?: string;
  token?: string;
  serialNo?: string;
  nameEnglish?: string;
  nameBangla?: string;
  fatherNameEnglish?: string;
  fatherNameBangla?: string;
  motherNameEnglish?: string;
  motherNameBangla?: string;
  studentClass?: string;
  department?: string;
  collegeRoll?: string;
  session?: string;
  heightFeet?: string;
  heightInches?: string;
  height?: string;
  weightKg?: string;
  weight?: string;
  chestNormal?: string;
  chestExpanded?: string;
  phoneSelf?: string;
  phone?: string;
  phoneGuardian?: string;
  presentAddress?: ApplicantAddress | any;
  permanentAddress?: ApplicantAddress | any;
  qualifications?: ApplicantQualification[] | any;
  additionalSkills?: string;
  reason?: string;
  pledgeAccepted?: boolean;
  guardianConsentAccepted?: boolean;
  customData?: Record<string, any>;
  customAnswers?: any;
  [key: string]: any;
}

export interface RecruitmentFormState extends Partial<RecruitmentApplicant> {}

export interface RecruitmentAnnouncementConfig {
  isOpen?: boolean;
  isActive?: boolean;
  title?: string;
  deadline?: string;
  venue?: string;
  description?: string;
  batch?: string;
  startDate?: string;
  endDate?: string;
  noticeText?: string;
  requirements?: string[];
  eligibilityCriteria?: string[];
  academicSession?: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  footerText?: string;
  [key: string]: any;
}

export interface RecruitmentSignatoriesConfig {
  puoName?: string;
  puoDesignation?: string;
  principalName?: string;
  principalDesignation?: string;
  countersignedName?: string;
  countersignedDesignation?: string;
  countersignedPNo?: string;
  countersignedRegiment?: string;
  countersignedBattalion?: string;
  countersignedTitle?: string;
  countersignedSignatureUrl?: string;
  countersignedInstitution?: string;
  seniorCadetSignatureUrl?: string;
  seniorCadetRankAndName?: string;
  seniorCadetNo?: string;
  seniorCadetBattalion?: string;
  seniorCadetRegiment?: string;
  seniorCadetInstitution?: string;
  formProviderTitle?: string;
  attachments?: any;
  [key: string]: any;
}

export interface ContactConfig {
  address?: string;
  email?: string;
  phone?: string;
  mapEmbedUrl?: string;
  addressTitle?: string;
  roomAndBuilding?: string;
  fullAddress?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  emailPrimary?: string;
  emailSecondary?: string;
  [key: string]: any;
}

export interface FooterConfig {
  collegeName?: string;
  copyrightText?: string;
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    email?: string;
  } | any;
  hqTitle?: string;
  roomDetails?: string;
  locationDetails?: string;
  col1Title?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  [key: string]: any;
}

export interface ExecutiveMessageConfig {
  name: string;
  designation: string;
  subDesignation?: string;
  badge?: string;
  quote?: string;
  enabled?: boolean;
  message: string;
  photoUrl?: string;
}

export interface AboutOverviewConfig {
  title: string;
  subtitle: string;
  mainContent?: string;
  historyText?: string;
  mottoText?: string;
  badge?: string;
  established?: string;
  motto?: string;
  content?: string;
}

