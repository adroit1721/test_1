import {
  HERO_SLIDES_DATA,
  NOTICES_DATA,
  BLOGS_DATA,
  MEMORIES_DATA,
} from './bnccData.js';
import { INITIAL_CADET_USERS } from './initialCadetUsers.js';
import { CANONICAL_SETTINGS } from './canonicalProductionData.js';
import {
  CadetRankHierarchyItem,
  TrainingAnnouncement,
  PlatoonRoutineConfig,
  FormFieldConfig,
  RecruitmentAnnouncementConfig,
  RecruitmentSignatoriesConfig,
  RecruitmentApplicant,
  ContactConfig,
  ContactMessage,
  FooterConfig,
  ExecutiveMessageConfig,
  AboutOverviewConfig,
  CustomAboutSection,
  MaintenanceConfig,
} from '../types.js';

export const DEFAULT_PRINCIPAL_MESSAGE: ExecutiveMessageConfig = {
  name: 'Professor Dr. Shikha Sarkar',
  designation: 'Principal',
  subDesignation: 'New Govt. Degree College, Rajshahi',
  badge: 'Patron & Leadership',
  quote: '"The Bangladesh National Cadet Corps (BNCC) instills an unshakeable sense of patriotism, moral integrity, and discipline among our students. We take immense pride in our cadets who represent the highest ideals of courage and selflessness."',
  message: 'At New Govt. Degree College, Rajshahi, the BNCC platoon serves as a prestigious crucible of character building and leadership development. Beyond academic excellence, our cadets embody civic responsibility and stand ever-prepared to serve our nation during emergencies, floods, and humanitarian missions. I extend my heartiest congratulations and deepest blessings to all our cadets and officers.',
  photoUrl: CANONICAL_SETTINGS['ngdc_principal_message']?.photoUrl || 'https://res.cloudinary.com/hqmx8juj/image/upload/v1788908190/cadets/passport_photos/dkv7smm03fkwkhygsldf.jpg',
  enabled: true,
};

export const DEFAULT_VICE_PRINCIPAL_MESSAGE: ExecutiveMessageConfig = {
  name: 'Professor Md. Matiur Rahman',
  designation: 'Vice-Principal',
  subDesignation: 'New Govt. Degree College, Rajshahi',
  badge: 'Vice-Patron & Leadership',
  quote: '"Cadet training at NGDC tempers youth with fortitude, resilience, and brotherhood. The endurance learned on the parade ground shapes leaders for life."',
  message: 'The BNCC platoon of New Govt. Degree College continues to be an inspiring emblem of dedication within our campus. Through exemplary squad drills, national day parades, voluntary blood donation drives, and disaster relief campaigns, our cadets showcase unwavering civic commitment. May the torch of knowledge, discipline, and unity shine ever brighter in our platoon.',
  photoUrl: CANONICAL_SETTINGS['ngdc_vice_principal_message']?.photoUrl || 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010385/cadets/passport_photos/ij5jyupyph9xlfmjwhiz.jpg',
  enabled: true,
};

export const DEFAULT_ABOUT_OVERVIEW: AboutOverviewConfig = {
  badge: 'About Our Platoon',
  title: 'Bangladesh National Cadet Corps',
  subtitle: 'New Govt. Degree College, Rajshahi BNCC Platoon, 31 BNCC Battalion, Mahasthan Regiment',
  established: 'Established 1979',
  motto: 'Knowledge & Discipline',
  content: `BNCC activities began at this college in 1979, starting from the establishment of the No. 1 Mahasthan Battalion. Rooms 123 and 124, adjacent to the auditorium on the ground floor of the main building's south block, are allocated as the BNCC office and storehouse. BNCC works tirelessly with the noble objectives of developing the moral character of the country's youth, fostering leadership, building a spirit of national service and sympathy, and, above all, preparing second-line soldiers through military training for the defense of the motherland and creating volunteers to tackle internal disasters.

Among Bangladesh National Cadet Corps five regiments, the BNCC unit of New Govt. Degree College falls under the "Mahasthan Regiment." Established since the inception of the college, this organization comprises a 31-member male platoon, a 31-member female platoon, and a 15-member band platoon. A platoon commander is in charge of these platoons. Additionally, BNCC officers working at the college supervise the unit.`,
};

export const DEFAULT_BNCCO1_MESSAGE: ExecutiveMessageConfig = {
  name: 'Lieutenant Dr. Nazma Begum',
  designation: 'BNCCO (BNCC Officer)',
  subDesignation: 'Associate Professor & Head of Department, Department of Botany, New Govt. Degree College, Rajshahi',
  badge: 'Mahasthan Regiment • BNCCO',
  quote: '"The discipline and leadership inculcated through BNCC training prepare our cadets to stand as pillars of integrity and fortitude for the nation."',
  message: 'As a BNCC Officer at New Govt. Degree College, I witness firsthand the transformative power of military training combined with academic excellence. Our cadets learn resilience, unyielding loyalty to the nation, and selfless service. Whether executing flawless parade drills or stepping up during national disasters, our cadets demonstrate the true spirit of patriotism. I urge all cadets to hold high the torch of knowledge and discipline.',
  photoUrl: CANONICAL_SETTINGS['ngdc_bncco1_message']?.photoUrl || 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010506/cadets/passport_photos/cr2xb3nbmsvv70mimchv.jpg',
  enabled: true,
};

export const DEFAULT_BNCCO2_MESSAGE: ExecutiveMessageConfig = {
  name: '2nd Lieutenant Dr. Nur Salma Khatun',
  designation: 'BNCCO (BNCC Officer)',
  subDesignation: 'Assistant Professor Department of Bangla, New Govt. Degree College, Rajshahi',
  badge: 'Mahasthan Regiment • BNCCO',
  quote: '"Empowering female and male cadets alike with leadership, tactical preparedness, and moral conviction is our highest calling in BNCC."',
  message: 'The BNCC unit at New Govt. Degree College stands out for its inclusive and rigorous grooming. With thriving male, female, and band platoons, our young cadets develop camaraderie, ethical steadfastness, and practical defense capabilities. We take immense pride in supervising these vibrant platoons as they grow into responsible citizens and future guardians of Bangladesh.',
  photoUrl: CANONICAL_SETTINGS['ngdc_bncco2_message']?.photoUrl || 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010564/cadets/passport_photos/avnseuctpa20tmqaz3ss.jpg',
  enabled: true,
};

export const DEFAULT_PLATOON_COMMANDER_MESSAGE: ExecutiveMessageConfig = {
  name: 'Md. Abdul Matin',
  designation: 'Professor Under Officer (PUO) & Platoon Commander',
  subDesignation: 'Assistant Professor, Department of Management, New Govt. Degree College',
  badge: 'Platoon Commander',
  quote: '"The training ground at New Govt. Degree College is not merely a place for marching; it is a foundry where young minds are tempered with selflessness, fortitude, and civic responsibility. Every cadet who puts on this khaki uniform learns to put the platoon before self, and the nation above all."',
  message: 'Over the decades, NGDC BNCC Platoon has produced countless commissioned military officers, BCS cadres, doctors, engineers, and upright leaders. Our cadets actively respond during national emergencies, floods, winter cold waves, and public health crises with exemplary bravery.',
  photoUrl: CANONICAL_SETTINGS['ngdc_platoon_commander_message']?.photoUrl || 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010576/cadets/passport_photos/kybsmitlqadfrrfjrtx3.jpg',
  enabled: true,
};

export const DEFAULT_CADET_RANKS: CadetRankHierarchyItem[] = [
  {
    id: 'rank-1',
    rank: 'Cadet (Cdt)',
    holderName: 'Basic Trainee Cadets',
    description: 'Entry rank awarded upon physical assessment, enrolment clearance, and preliminary uniform issue.',
    order: 1,
    image: '',
  },
  {
    id: 'rank-2',
    rank: 'Lance Corporal (LCpl)',
    holderName: 'Tanvir Hossain & 4 Others',
    description: 'Assistant Section 2IC. Earned through passing written theory, drill cadence, and first aid qualification.',
    order: 2,
    image: '',
  },
  {
    id: 'rank-3',
    rank: 'Corporal (Cpl)',
    holderName: 'Tariqul Karim & 3 Others',
    description: 'Section 2IC. Commands squad files on parade ground and assists in platoon armory logistics.',
    order: 3,
    image: '',
  },
  {
    id: 'rank-4',
    rank: 'Sergeant (Sgt)',
    holderName: 'Sumaiya Akter & Nahid Islam',
    description: 'Section Commander. Directs tactical field maneuvers, squad firing lines, and disaster relief.',
    order: 4,
    image: '',
  },
  {
    id: 'rank-5',
    rank: 'Cadet Sergeant Major (CSM)',
    holderName: 'Ariful Islam',
    description: 'Platoon Senior NCO. Enforces parade ground discipline, uniform standards, and daily roll calls.',
    order: 5,
    image: '',
  },
  {
    id: 'rank-6',
    rank: 'Cadet Under Officer (CUO)',
    holderName: 'Hasan Mahmud',
    description: 'Highest Cadet Rank. Commands the entire New Govt. Degree College Platoon under the PUO.',
    order: 6,
    image: '',
  },
];

export const DEFAULT_ABOUT_SECTIONS: CustomAboutSection[] = [];

export const DEFAULT_TRAINING_ANNOUNCEMENTS: TrainingAnnouncement[] = [];

export const DEFAULT_PLATOON_ROUTINE_CONFIG: PlatoonRoutineConfig = {
  isPublished: false,
  title: '',
  effectiveDate: '',
  pdfUrl: '',
  fileName: '',
  instructions: '',
  updatedAt: '',
};

export const DEFAULT_TRAINING_FORM_FIELDS: FormFieldConfig[] = [
  { id: 'f-1', label: 'Cadet Number', type: 'text', placeholder: 'e.g. NGDC-2024-042', required: true },
  { id: 'f-2', label: 'Cadet Full Name', type: 'text', placeholder: 'Full Name as per College ID', required: true },
  { id: 'f-3', label: 'Cadet Rank', type: 'select', required: true, options: ['Cadet', 'Lance Corporal', 'Corporal', 'Sergeant', 'CSM', 'CUO'] },
  { id: 'f-4', label: 'Emergency Contact Mobile', type: 'tel', placeholder: '017XXXXXXXX', required: true },
  { id: 'f-5', label: 'Previous Camp Attended', type: 'text', placeholder: 'e.g. Winter Camp 2023', required: false },
  { id: 'f-6', label: 'Medical Fitness Confirmation', type: 'select', required: true, options: ['Fully Fit & Ready for Field Obstacles', 'Conditional / Minor Allergies'] },
];

export const DEFAULT_CADET_REG_FIELDS: FormFieldConfig[] = [
  { id: 'cr-1', label: 'Cadet Full Name', type: 'text', placeholder: 'Enter cadet full name', required: true },
  { id: 'cr-2', label: 'Platoon Category', type: 'select', required: true, options: ['Male Platoon', 'Female Platoon', 'Band Platoon', 'Ex-cadets'] },
  { id: 'cr-3', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female'] },
  { id: 'cr-4', label: 'Cadet Rank / Desired Rank', type: 'select', required: true, options: ['Cadet Under Officer/CUO', 'Cadet Seargent', 'Cadet Corporal', 'Cadet Lance Corporal', 'Cadet'] },
  { id: 'cr-5', label: 'College Roll / Student ID', type: 'text', placeholder: 'e.g. NGDC-110492 or Roll 204', required: true },
  { id: 'cr-6', label: 'Department / Group', type: 'text', placeholder: 'e.g. Dept. of Physics', required: true },
  { id: 'cr-7', label: 'Batch / Enrolment Session', type: 'text', placeholder: 'e.g. Batch 24 (2024-2025)', required: true },
  { id: 'cr-8', label: 'Blood Group', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  { id: 'cr-9', label: 'Contact Mobile Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
  { id: 'cr-10', label: 'Email Address', type: 'email', placeholder: 'cadet@example.com', required: false },
  { id: 'cr-11', label: 'Section Preference / Designation', type: 'select', required: false, options: ['Section 01', 'Section 02', 'Section 03', 'Band Section', 'Platoon HQ', 'Ex-Cadet Alumni'] },
];

export const DEFAULT_RECRUITMENT_FORM_FIELDS: FormFieldConfig[] = [
  { id: 'rec-1', label: 'Full Name in English', type: 'text', placeholder: 'As registered in SSC/HSC Certificate', required: true },
  { id: 'rec-2', label: 'Active Email Address', type: 'email', placeholder: 'student@example.com', required: true },
  { id: 'rec-3', label: 'Applicant Mobile Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
  { id: 'rec-4', label: 'College Roll / Admission ID', type: 'text', placeholder: 'e.g. 24-SCI-0142', required: true },
  { id: 'rec-5', label: 'Class / Department', type: 'select', required: true, options: ['HSC 1st Year (Science)', 'HSC 1st Year (Humanities)', 'HSC 1st Year (Business Studies)', 'Degree / Honours 1st Year (Science)', 'Degree / Honours 1st Year (Arts)', 'Degree / Honours 1st Year (Commerce)'] },
  { id: 'rec-6', label: 'Academic Session', type: 'text', placeholder: 'e.g. 2024 - 2025', required: true },
  { id: 'rec-7', label: 'Height (Feet & Inches)', type: 'text', placeholder: 'e.g. 5 Feet 8 Inches (Min: 5\'6" for Male, 5\'2" for Female)', required: true },
  { id: 'rec-8', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 62', required: true },
  { id: 'rec-9', label: 'Blood Group', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  { id: 'rec-10', label: 'Motivation to Join BNCC', type: 'textarea', placeholder: 'Why do you wish to earn the BNCC uniform and serve Bangladesh?', required: true },
];

export const DEFAULT_RECRUITMENT_ANNOUNCEMENT: RecruitmentAnnouncementConfig = {
  isActive: true,
  title: 'Cadet Recruitment Batch 2024-2025 Enrolment Circular',
  batch: 'Batch 24',
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

export const DEFAULT_RECRUITMENT_SIGNATORIES: RecruitmentSignatoriesConfig = {
  countersignedName: 'PUO Md. Abdul Matin',
  countersignedPNo: 'P-819',
  countersignedBattalion: '31 BNCC Battalion',
  countersignedRegiment: 'Mahasthan Regiment',
  countersignedTitle: 'Platoon Commander',
  countersignedInstitution: 'New Govt. Degree College, Rajshahi',
  countersignedSignatureUrl: '',

  seniorCadetRankAndName: 'Cadet Sergeant Touhid',
  seniorCadetNo: '',
  seniorCadetBattalion: '31 BNCC Battalion',
  seniorCadetRegiment: 'Mahasthan Regiment',
  seniorCadetInstitution: 'New Govt. Degree College, Rajshahi',
  seniorCadetSignatureUrl: '',

  formProviderTitle: 'Signature of Form Provider:',
  attachments: [
    'Photocopy of College ID Card / Admission Receipt',
    'Photocopy of SSC / HSC Marksheet',
    'Blood Group Certificate (if available)',
  ],
};

export const DEFAULT_RECRUITMENT_APPLICANTS: RecruitmentApplicant[] = [];

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  addressTitle: 'NGDC BNCC Platoon HQ',
  roomAndBuilding: 'Room 123, Front Building',
  fullAddress: 'New Govt. Degree College, N6 Highway, Rajshahi - 6000, Bangladesh',
  phonePrimary: '+880 1712-345678',
  phoneSecondary: '+880 2588-861234',
  emailPrimary: 'bncc.ngdc@gmail.com',
  emailSecondary: 'puo.matin@ngdc.ac.bd',
  officeHours: 'Sunday to Thursday: 09:00 AM - 04:00 PM | Friday/Saturday: Parade Hours 06:30 AM - 11:00 AM',
  mapEmbedUrl: 'https://maps.google.com/maps?q=New%20Govt.%20Degree%20College%20Rajshahi&t=&z=16&ie=UTF8&iwloc=&output=embed',
};

export const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [];

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  hqTitle: 'NGDC BNCC Platoon HQ',
  roomDetails: 'Room 123, Front Building,',
  locationDetails: 'New Govt. Degree College, N6, Rajshahi',
  phone: '+880 1712-345678 / +880 2588-861234',
  email: 'bncc.ngdc@gmail.com',
  facebookUrl: 'https://www.facebook.com/ngdcbncc',
  twitterUrl: 'https://x.com',
  youtubeUrl: 'https://youtube.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: '',
  collegeOfficialUrl: 'https://ngdc.ac.bd',
  bnccGovUrl: 'https://bncc.info/',
  copyrightText: 'NGDC-BNCC Platoon, New Govt. Degree College, Rajshahi. All rights reserved.',
  mottoText: 'Knowledge & Discipline • জ্ঞান ও শৃঙ্খলা',
};

export const DEFAULT_SITE_FAVICON: string = '/favicon.png';

export const DEFAULT_HEADER_LEFT_LOGO_URL: string = 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789061196/header-branding/al5oiphcqnhr0fixrhx8.png';
export const DEFAULT_HEADER_RIGHT_LOGO_URL: string = 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789061203/header-branding/eci8potgebwytbrxuo54.png';
export const DEFAULT_HEADER_TITLE: string = 'NGDC-BNCC';
export const DEFAULT_HEADER_SUBTITLE: string = 'New Govt. Degree College, Rajshahi BNCC Platoon';

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  mode: 'disabled',
  headline: 'Scheduled System Maintenance & Cloud Optimization',
  message: 'The official NGDC-BNCC web portal is undergoing scheduled infrastructure upgrades and database indexing to better serve our cadets and officers. Core public features will resume shortly.',
  estimatedRestorationTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
  bannerSeverity: 'warning',
  bannerLinkText: 'View Recruitment Schedules',
  bannerLinkUrl: '#recruitment',
  bannerDismissible: true,
  emergencyContact: {
    officerName: 'Dr. Md. Golam Rahman',
    designation: 'Professor & PUO, NGDC-BNCC Platoon',
    phone: '+880 1711-234567',
    email: 'puo.bncc@ngdc.ac.bd',
    officeLocation: 'BNCC Platoon HQ, Room 204, Administrative Building, NGDC',
    whatsappNumber: '+8801711234567',
  },
  allowOfficerBypass: true,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Command Authority',
};

export function getDefaultSiteSettings(): Record<string, any> {
  return {
    headerLeftLogoUrl: DEFAULT_HEADER_LEFT_LOGO_URL,
    headerRightLogoUrl: DEFAULT_HEADER_RIGHT_LOGO_URL,
    headerTitle: DEFAULT_HEADER_TITLE,
    headerSubtitle: DEFAULT_HEADER_SUBTITLE,
    ngdc_header_left_logo_url: DEFAULT_HEADER_LEFT_LOGO_URL,
    ngdc_header_right_logo_url: DEFAULT_HEADER_RIGHT_LOGO_URL,
    ngdc_header_title: DEFAULT_HEADER_TITLE,
    ngdc_header_subtitle: DEFAULT_HEADER_SUBTITLE,
    ngdc_maintenance_config: DEFAULT_MAINTENANCE_CONFIG,
    ngdc_site_favicon: DEFAULT_SITE_FAVICON,
    ngdc_admin_officer_id: 'ngdc_bncc_1979',
    ngdc_admin_master_password: 'Ngdc$BNCC$1979',
    ngdc_hero_slides: HERO_SLIDES_DATA.map((s) => ({ ...s, isActive: true })),
    ngdc_principal_message: DEFAULT_PRINCIPAL_MESSAGE,
    ngdc_vice_principal_message: DEFAULT_VICE_PRINCIPAL_MESSAGE,
    ngdc_about_overview: DEFAULT_ABOUT_OVERVIEW,
    ngdc_bncco1_message: DEFAULT_BNCCO1_MESSAGE,
    ngdc_bncco2_message: DEFAULT_BNCCO2_MESSAGE,
    ngdc_platoon_commander_message: DEFAULT_PLATOON_COMMANDER_MESSAGE,
    ngdc_about_sections: DEFAULT_ABOUT_SECTIONS,
    ngdc_cadet_ranks: DEFAULT_CADET_RANKS,
    ngdc_trainings: DEFAULT_TRAINING_ANNOUNCEMENTS,
    ngdc_training_form_fields: DEFAULT_TRAINING_FORM_FIELDS,
    ngdc_training_submissions: [],
    ngdc_platoon_routine_config: DEFAULT_PLATOON_ROUTINE_CONFIG,
    ngdc_notices: [],
    ngdc_blogs: [],
    ngdc_memories: [],
    ngdc_cadet_reg_fields: DEFAULT_CADET_REG_FIELDS,
    ngdc_deleted_cadets_tombstones: [],
    ngdc_cadet_users_v8: [],
    ngdc_cadet_pending_updates: [],
    ngdc_contact_config: DEFAULT_CONTACT_CONFIG,
    ngdc_contact_messages: [],
    ngdc_recruitment_open: true,
    ngdc_recruitment_announcement: DEFAULT_RECRUITMENT_ANNOUNCEMENT,
    ngdc_recruitment_title: 'Cadet Recruitment Batch 2024-2025 Enrolment Circular',
    ngdc_recruitment_form_fields: DEFAULT_RECRUITMENT_FORM_FIELDS,
    ngdc_recruitment_applicants: [],
    ngdc_recruitment_signatories: DEFAULT_RECRUITMENT_SIGNATORIES,
    ngdc_footer_config: DEFAULT_FOOTER_CONFIG,
    ngdc_cloudinary_cloud_name: 'hqmx8juj',
    ngdc_cloudinary_upload_preset: 'ngdc_bncc',
    ...CANONICAL_SETTINGS,
  };
}
