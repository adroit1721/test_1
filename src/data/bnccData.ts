import { NoticeItem, BlogItem, MemoryItem, HonorItem, TrainingRoutine, CadetProfile, HeroSlide } from '../types';
import { CANONICAL_SETTINGS } from './canonicalProductionData';

export const ASSETS = {
  ngdcLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOQfYaTIIzYcryLydSjX8MlI-RlWKb95bYT-GFcmIkQ90OUlj0KwqvHA6Nf7Tc-e1Sebhm4FNA-L3yvCUq_YZFfntVyLVyTIDUaWmr-xhjNWullfARrNhbKqtE7MvAGif2Ea1ny7OY41nednakWZ2TsvX7zjSZGRVjg09Mu8JMOBZ3F1zFbg-D7MicywJqQTlpcL4TKdO-hteJcPkTKDyuEf38DXtZAmN3cJ0ra7OxMHWPVij78c0-5hzBBoPMw8E8tg',
  bnccLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwO4_EmuU3ZRWZRqx8V4g-w-QEDyBXBZwFqakQC4uiKfCvtQzkXIeHR6gH-37EScsWMAH8KefBQcDrgrq5wKMFfU0g11VPBRwX7gGjgSPJKBWiSekHYkh_EFFEK0QQPOGdEba1tNCCeZq9rfjxn71BfSy3yU6uMdYrGzm23UMY79myAAUN-1WMr-gdws1YPfelXLSHfI4wb-0njzgJxHOCLipaONpMzyCZTxwk2HYaa1Sqsx9fhD1d67GtcQYoRn_PGw',
  heroMain: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3NN1UhRr3J4GSiRBRA76xJ6wz4tZ-tzMW_AnkKDMYxFRYryH5EgcQMT1riaLT1DNUDciV2iPGj3z2FyHMa-5k6UvBASG2OP81-5erx0Fde9WZzmMxJ5XjlBiz5tj3yMvG2mrZ8eSpGSfk53wCh4snewu45eLsHmvgiY60eH6vmLOZjNHsvTe1ZimUdaiVQgiVLxEJlixpJ1RADE_HHQMzIgLwdDgE14wAXelJ1c4T1_p41C1afx0WN0TlBW2qqRT_mQ',
  puoRahman: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789019772/vrefgswpj8ltquhu5bd1.jpg',
  memoryMarching: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8dhAsudcTtPBBvNf17Ifxn54_HK9DuHBTDLcVkWCcA8Oxav-61k-Cfm_ZyEGQZQ1uBhpeEkCf3NfH2OawirFqXQ3qMpu8jX4cCPbjek1ps7gIR6Mkhu6FO2q1as2wy4Y69WXMAawPgNkIcNT7-iJUpgs6uf87BGNZfWLyYriDAoM6JR31UND7-FLa6lEsnKNaAmCDmUv0op4L7rqsE801YbUTNTeu7vzEjFz71QNDru8WJtzfwlR8',
  memoryMapReading: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl5w3KYqjZIjfxfcAG3sVMe9EJ7kMPDdVGCHTyXai-aRVFt6gAGNVeZx0OL2Go-jg4DAf4mlwREP4_f_eGXVkM1Gpin271hRXFXeCLqeNVwaidD2hcnPi3Wt0ApjAzDT4yOfABTOrqHKa0nRP6EvfVoj08S3uYKdlxo46FPcxVCe8i8IkCBAfyLtF8S9h7xfJgPSwhCYKaCMuDGYgZi4nHakFCcPMyjOVEZFIeROSxt2WaYpfhZng0',
  memoryRelief: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_1ieiG-ULiS2QP-1THBniehXQUcPNIxtQsbmREmycOcjhzvQZGLZo_u1SmVbxn3KKOtKCEoGPXgwb-l96qEjdpHIfiRtTHOzDN9H1NstupArnZ_4_QLjPbHNu7LQNXUxIOpiaKT0xNxOEwC9yKB1rfl6bTlLHkjd5AA-zgmvD85GdnhON_-urxKrt4c15xH3zH_X6i10_BuoE87E_xUvc8NMLO-jaqx2HcA2pRXhKY8cxg8THfuKT',
  memoryTrophy: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf-2gSWMEdcfllADpfAtFBgpQ2X2oPKg0EJEkbYBtO63dlJIiggCzFhE_92RMwQJlCcV_r67nZ6fHwaFwfRY97tcqDtNJgtAV5vJ_GtTu2Qf_k2wUL_ApqwFmnyGHD9XtL-8fDxTdUaaO_caSrTXn2ZltcNwr_EpTXO4EnGBC4_-sOgsb1gLLuGOH_kpSY7azUFCxZoeZ4sEaU9eyylL5_a8CRlFGRxiNyq1A2JMKMIlkXIyPTDZaS',
  campusMap: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVJHcr-ltMt8rVcD34xaLGcLUCTJYRPAdiKrL30V_ViBcuHU2P_2RoByJQUcvRrmco3hB7yk9AGlKIsT2m9MSwA1UpX_OnEQAt4hk5En3IZ0qc63OSWvRlyw5-TtcB7_rgg-PDy42xHrKLU3gsFHwmgLTd0NN1GRq1v7koUlM04pOkKtg_Tg5s9FFALZ_saBq3F49N1HwY5NH0Zf_-BOJVE3-107UJHdMer0P4z1gxUmM-Al9qmNDv',
};

// Hero Carousel Slides (Managed dynamically via Admin Panel)
export const HERO_SLIDES_DATA: HeroSlide[] = Array.isArray(CANONICAL_SETTINGS['ngdc_hero_slides'])
  ? CANONICAL_SETTINGS['ngdc_hero_slides']
  : [];

export const NOTICES_DATA: NoticeItem[] = Array.isArray(CANONICAL_SETTINGS['ngdc_notices'])
  ? CANONICAL_SETTINGS['ngdc_notices']
  : [];

export const BLOGS_DATA: BlogItem[] = Array.isArray(CANONICAL_SETTINGS['ngdc_blogs'])
  ? CANONICAL_SETTINGS['ngdc_blogs']
  : [];

export const MEMORIES_DATA: MemoryItem[] = Array.isArray(CANONICAL_SETTINGS['ngdc_memories'])
  ? CANONICAL_SETTINGS['ngdc_memories']
  : [];

export const HONOR_BOARD_DATA: HonorItem[] = [
  {
    id: 'honor-1',
    name: 'Md. Abdul Matin',
    designation: 'Professor Under Officer (PUO) & Platoon Commander',
    year: '2018 - Present',
    rank: 'Captain equivalent / PUO',
    achievement: 'Commanded NGDC Platoon to 4 consecutive Best Platoon Trophies',
    award: 'Director General Commendation Medal',
    batch: 'Faculty In-Charge',
  },
  {
    id: 'honor-2',
    name: 'Mahmudul Hasan (Rahman)',
    designation: 'Cadet Under Officer (CUO)',
    year: '2023 - 2024',
    rank: 'CUO',
    achievement: 'Represented Bangladesh in International Youth Exchange Program (YEP) India',
    award: 'Best All-Round Cadet of the Battalion',
    batch: 'Batch 22 (Dept. of Physics)',
  },
  {
    id: 'honor-3',
    name: 'Tania Sultana',
    designation: 'Cadet Sergeant Major (CSM)',
    year: '2022 - 2023',
    rank: 'CSM',
    achievement: 'Led National Victory Day Parade Contingent at National Parade Square, Dhaka',
    award: 'Governor’s Gold Marksmanship Medal',
    batch: 'Batch 21 (Dept. of English)',
  },
  {
    id: 'honor-4',
    name: 'Zubair Al Mamun',
    designation: 'Cadet Sergeant',
    year: '2021 - 2022',
    rank: 'Sgt (Now Bangladesh Army Officer)',
    achievement: 'Commissioned into Bangladesh Army as Lieutenant via 84th BMA Long Course',
    award: 'Sword of Honour Nominee',
    batch: 'Batch 20 (Dept. of Chemistry)',
  },
  {
    id: 'honor-5',
    name: 'Farhana Akter',
    designation: 'Cadet Corporal',
    year: '2023 - 2024',
    rank: 'Cpl',
    achievement: 'First place in All-Bangladesh Disaster Rescue & First Aid Simulation Camp',
    award: 'Red Crescent Life Saver Crest',
    batch: 'Batch 22 (Dept. of Botany)',
  },
];

export const TRAINING_ROUTINE_DATA: TrainingRoutine[] = [
  {
    id: 'tr-1',
    day: 'Friday',
    time: '06:30 AM - 08:30 AM',
    activity: 'Squad Drill, Foot Drill & Slow March Formations',
    instructor: 'CUO Rahman / Sgt. Karim',
    venue: 'College Main Parade Ground',
    uniform: 'Service Dress (Khaki with Beret)',
  },
  {
    id: 'tr-2',
    day: 'Friday',
    time: '09:00 AM - 10:30 AM',
    activity: 'Military History, Organization of Armed Forces & OLQ Lecture',
    instructor: 'PUO Dr. A. Rahman',
    venue: 'BNCC Briefing Room (Room 204)',
    uniform: 'College Uniform / Smart Casuals',
  },
  {
    id: 'tr-3',
    day: 'Saturday',
    time: '06:30 AM - 08:00 AM',
    activity: 'Physical Training (PT), 3km Endurance Run & Obstacle Vaulting',
    instructor: 'Cpl. Nahid / PT NCO',
    venue: 'College Playground Track',
    uniform: 'PT Kit (White Vest, Track Pants, White Keds)',
  },
  {
    id: 'tr-4',
    day: 'Saturday',
    time: '08:30 AM - 10:00 AM',
    activity: 'Weapon Handling (.22 Rifle Stripping/Assembling & Aiming Practice)',
    instructor: 'Havildar Instructor (Army Detachment)',
    venue: 'Platoon Store & Mini Range',
    uniform: 'Service Dress (Khaki)',
  },
  {
    id: 'tr-5',
    day: 'Tuesday',
    time: '03:30 PM - 05:00 PM',
    activity: 'Disaster Management, Fire-Fighting & First Aid Practical Simulation',
    instructor: 'Civil Defense & Sandhani Liaison',
    venue: 'Open Auditorium Lawn',
    uniform: 'Working Dungaree / Camouflage PT',
  },
];

export const SAMPLE_CADETS: Record<string, CadetProfile> = {};

export const UNIFORM_ITEMS = [
  {
    name: 'Service Dress (Khaki)',
    when: 'Regular Friday/Saturday Parades, Official Ceremonies, Dignitary Visits',
    items: ['Khaki cotton shirt with epaulettes & lanyard', 'Khaki tailored trousers', 'Black high-ankle DMS combat boots (polished)', 'Green beret with golden BNCC metal crest', 'Black web belt with shining brass buckle'],
  },
  {
    name: 'Physical Training (PT) Kit',
    when: 'Morning endurance runs, obstacle courses, sports events',
    items: ['Pure white round-neck jersey with NGDC BNCC emblem', 'Navy blue or black athletic track trousers', 'White canvas running shoes / keds', 'White athletic socks'],
  },
  {
    name: 'Camp / Field Dungaree',
    when: 'Tactical field maneuvers, night patrolling, disaster relief operations',
    items: ['Disruptive pattern combat jacket & trousers', 'Olive green boonie hat or helmet', 'Field combat boots & web gear harness', 'Individual first aid pack & water canteen'],
  },
];
