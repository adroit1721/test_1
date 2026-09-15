import { HeroSlide, NoticeItem, BlogItem, MemoryItem } from '../types.js';
export { CANONICAL_SETTINGS, CANONICAL_CADETS } from './canonicalProductionData.js';

export const ASSETS = {
  bnccLogo: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789061203/header-branding/eci8potgebwytbrxuo54.png',
  collegeLogo: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789061196/header-branding/al5oiphcqnhr0fixrhx8.png',
  puoImage: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010576/cadets/passport_photos/kybsmitlqadfrrfjrtx3.jpg',
  puoRahman: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010576/cadets/passport_photos/kybsmitlqadfrrfjrtx3.jpg',
  ngdcLogo: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789061196/header-branding/al5oiphcqnhr0fixrhx8.png',
  heroMain: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010576/cadets/passport_photos/kybsmitlqadfrrfjrtx3.jpg',
};

export const UNIFORM_ITEMS = [
  {
    id: '1',
    name: 'Beret & Cap Badge',
    description: 'Navy Blue Beret with BNCC Metal Badge',
    category: 'Headwear',
    when: 'Required during all formal parades and ceremonial drills.',
    items: ['Navy Blue Beret (properly blocked)', 'BNCC Metal Cap Badge', 'Hackler / Plume (when ordered)'],
  },
  {
    id: '2',
    name: 'Uniform Shirt & Trousers',
    description: 'Olive Green BNCC Pattern Uniform',
    category: 'Dress',
    when: 'Standard training and ceremonial dress code.',
    items: ['Olive Green Regulation Shirt with BNCC Shoulder Titles', 'Olive Green Trousers with Webbing Belt', 'Name Plate (Right pocket above flap)'],
  },
  {
    id: '3',
    name: 'DMS Boots & Accessories',
    description: 'Black Leather Ankle Tactical Boots',
    category: 'Footwear',
    when: 'All drill, parade, and field training sessions.',
    items: ['High-polish Black DMS Boots', 'Black Socks (Knee/Calf high)', 'Anklets / Gaiters (ceremonial)'],
  },
];

export const HERO_SLIDES_DATA: HeroSlide[] = [
  {
    id: '1',
    title: 'NGDC BNCC Platoon',
    subtitle: 'Knowledge, Discipline, Unity',
    imageUrl: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010576/cadets/passport_photos/kybsmitlqadfrrfjrtx3.jpg',
    ctaText: 'Join Us',
    ctaLink: '#recruitment',
  },
];

export const NOTICES_DATA: NoticeItem[] = [
  {
    id: '1',
    title: 'Recruitment Notice 2026',
    date: '2026-09-01',
    category: 'Recruitment',
    summary: 'Applications are open for new BNCC Cadets at NGDC Platoon.',
    content: 'Full details regarding physical fitness test and written exam schedules.',
    isImportant: true,
  },
];

export const BLOGS_DATA: BlogItem[] = [
  {
    id: '1',
    title: 'Life in BNCC',
    author: 'Cadet Under Officer',
    date: '2026-08-15',
    category: 'Experience',
    summary: 'Insights into daily training, discipline, and brotherhood.',
    content: 'BNCC builds leadership, camaraderie, and commitment to the nation.',
  },
];

export const MEMORIES_DATA: MemoryItem[] = [
  {
    id: '1',
    title: 'Annual Training Camp',
    date: '2026',
    category: 'Camp',
    imageUrl: 'https://res.cloudinary.com/hqmx8juj/image/upload/v1789010576/cadets/passport_photos/kybsmitlqadfrrfjrtx3.jpg',
    description: 'Cadets participating in annual training exercises.',
  },
];
