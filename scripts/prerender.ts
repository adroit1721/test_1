import fs from 'fs';
import path from 'path';

interface RouteMeta {
  path: string;
  title: string;
  description: string;
  canonical: string;
  breadcrumbName: string;
}

const ROUTES: RouteMeta[] = [
  {
    path: 'recruitment',
    title: 'Cadet Recruitment & Admission Circular | NGDC BNCC Platoon',
    description: 'Official BNCC Cadet Recruitment Circular & Application Form at New Govt. Degree College, Rajshahi. Join the elite Army Wing platoon.',
    canonical: 'https://ngdcbncc.org/recruitment',
    breadcrumbName: 'Cadet Recruitment',
  },
  {
    path: 'notices',
    title: 'Official Notices & Circulars | NGDC BNCC Platoon',
    description: 'Latest BNCC notices, order of the day, parade announcements, and circulars from New Govt. Degree College, Rajshahi.',
    canonical: 'https://ngdcbncc.org/notices',
    breadcrumbName: 'Notices & Circulars',
  },
  {
    path: 'cadets',
    title: 'Cadet Directory & Rank Roster | NGDC BNCC Platoon',
    description: 'Active cadet directory, rank hierarchy, Platoon Under Officer (PUO) profile, and cadet roster of NGDC BNCC Platoon.',
    canonical: 'https://ngdcbncc.org/cadets',
    breadcrumbName: 'Cadets Corner',
  },
  {
    path: 'about',
    title: 'About NGDC BNCC Platoon | History, PUO & College',
    description: 'Learn about the Bangladesh National Cadet Corps (BNCC) unit at New Govt. Degree College, Rajshahi. Fostering Knowledge, Discipline & Leadership.',
    canonical: 'https://ngdcbncc.org/about',
    breadcrumbName: 'About Us',
  },
  {
    path: 'training',
    title: 'Training & Events Schedule | NGDC BNCC Platoon',
    description: 'Annual military training, drill practice, firing camps, national day parades, and social service activities of NGDC BNCC Platoon.',
    canonical: 'https://ngdcbncc.org/training',
    breadcrumbName: 'Training & Events',
  },
  {
    path: 'contact',
    title: 'Contact Platoon HQ | New Govt. Degree College, Rajshahi',
    description: 'Contact NGDC BNCC Platoon HQ at New Govt. Degree College, Rajshahi. Get address, phone, email, and location map.',
    canonical: 'https://ngdcbncc.org/contact',
    breadcrumbName: 'Contact',
  },
  {
    path: 'gallery',
    title: 'Photo Gallery & Cadet Memories | NGDC BNCC Platoon',
    description: 'Photo & video gallery, cadet memories, achievements, and event highlights of NGDC BNCC Platoon, Rajshahi.',
    canonical: 'https://ngdcbncc.org/gallery',
    breadcrumbName: 'Memories & Gallery',
  },
  {
    path: 'blog',
    title: 'Photo Gallery & Cadet Memories | NGDC BNCC Platoon',
    description: 'Photo & video gallery, cadet memories, achievements, and event highlights of NGDC BNCC Platoon, Rajshahi.',
    canonical: 'https://ngdcbncc.org/gallery',
    breadcrumbName: 'Memories & Gallery',
  },
  {
    path: 'honor',
    title: 'Honor Board & Roll of Distinction | NGDC BNCC Platoon',
    description: 'Roll of honor, distinguished former cadets, PUOs, and award winners of NGDC BNCC Platoon.',
    canonical: 'https://ngdcbncc.org/honor',
    breadcrumbName: 'Honor Board',
  },
  {
    path: 'honor-board',
    title: 'Honor Board & Roll of Distinction | NGDC BNCC Platoon',
    description: 'Roll of honor, distinguished former cadets, PUOs, and award winners of NGDC BNCC Platoon.',
    canonical: 'https://ngdcbncc.org/honor',
    breadcrumbName: 'Honor Board',
  },
];

async function prerenderRoutes() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ dist/index.html not found! Run vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  console.log(`🚀 [SEO Pre-renderer] Pre-rendering ${ROUTES.length} static subroutes for Googlebot...`);

  for (const route of ROUTES) {
    const routeDir = path.join(distDir, route.path);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://ngdcbncc.org/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: route.breadcrumbName,
          item: route.canonical,
        },
      ],
    };

    let modifiedHtml = baseHtml;

    // Replace Title
    modifiedHtml = modifiedHtml.replace(
      /<title>.*?<\/title>/i,
      `<title>${route.title}</title>`
    );

    // Replace Meta Description
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${route.description}" />`
    );

    // Replace Canonical Link
    modifiedHtml = modifiedHtml.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${route.canonical}" />`
    );

    // Replace OpenGraph Title, Description, and URL
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:title" content="${route.title}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:description" content="${route.description}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:url" content="${route.canonical}" />`
    );

    // Replace Twitter Title, Description, and URL
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:title" content="${route.title}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:description" content="${route.description}" />`
    );
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+name="twitter:url"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:url" content="${route.canonical}" />`
    );

    // Inject route-specific BreadcrumbList schema
    const breadcrumbTag = `\n    <script type="application/ld+json">\n    ${JSON.stringify(breadcrumbLd, null, 2)}\n    </script>`;
    modifiedHtml = modifiedHtml.replace('</head>', `${breadcrumbTag}\n  </head>`);

    // Inject semantic crawler fallback inside #root (replaced instantly when React mounts)
    const crawlableShell = `<div id="root"><header class="sr-only"><h1>${route.title}</h1><p>${route.description}</p><nav><a href="/">Home</a> | <a href="/recruitment">Cadet Recruitment</a> | <a href="/notices">Notice Board</a> | <a href="/cadets">Cadet Directory</a> | <a href="/about">About Platoon</a> | <a href="/training">Training &amp; Events</a> | <a href="/gallery">Photo Gallery</a> | <a href="/honor">Honor Board</a> | <a href="/contact">Contact HQ</a></nav></header></div>`;
    modifiedHtml = modifiedHtml.replace('<div id="root"></div>', crawlableShell);

    const outputFilePath = path.join(routeDir, 'index.html');
    fs.writeFileSync(outputFilePath, modifiedHtml, 'utf-8');
    console.log(`  ✓ Pre-rendered /${route.path} -> canonical: ${route.canonical}`);
  }

  console.log('✅ [SEO Pre-renderer] All static route HTML files generated successfully.');
}

prerenderRoutes().catch((err) => {
  console.error('[SEO Pre-renderer Error]:', err);
});
