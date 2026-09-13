import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import { getDefaultSiteSettings } from './src/data/defaultSiteSettings.js';
import { INITIAL_CADET_USERS } from './src/data/initialCadetUsers.js';
import { CANONICAL_SETTINGS, CANONICAL_CADETS } from './src/data/canonicalProductionData.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || (globalThis as any)._generatedJwtSecret || ((globalThis as any)._generatedJwtSecret = `ngdc_secret_${Math.random().toString(36).slice(2)}_${Date.now()}`);

// --- CORS: Allow all origins and methods (security is enforced via JWT on write endpoints) ---
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'X-Requested-With',
      'X-Admin-Auth',
      'X-Officer-Id',
    ],
  })
);

// Explicit OPTIONS preflight handler for all routes
app.options('*', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cache-Control, Pragma, X-Requested-With, X-Admin-Auth, X-Officer-Id'
  );
  return res.status(200).end();
});

app.use(express.json({ limit: '25mb' }));

// Normalize req.url for Vercel Serverless Function invocations
app.use((req, _res, next) => {
  // On Vercel, the original request path is provided in x-forwarded-uri or x-original-url or x-rewrite-url
  const forwardedUri =
    (req.headers['x-forwarded-uri'] as string) ||
    (req.headers['x-original-url'] as string) ||
    (req.headers['x-rewrite-url'] as string);

  let url = req.url || '/';
  if (forwardedUri && forwardedUri !== '/api' && forwardedUri !== '/api/') {
    url = forwardedUri;
  }

  // If full URL was passed in header or req.url, extract pathname and search
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      url = parsed.pathname + parsed.search;
    } catch {}
  }

  const [pathname, search] = url.split('?');

  let cleanPathname = pathname;
  if (!cleanPathname.startsWith('/api') && !cleanPathname.startsWith('/ws')) {
    cleanPathname = `/api${cleanPathname.startsWith('/') ? '' : '/'}${cleanPathname}`;
  }

  // Strip trailing slash if present (e.g. /api/settings/ -> /api/settings)
  if (cleanPathname.length > 5 && cleanPathname.endsWith('/')) {
    cleanPathname = cleanPathname.slice(0, -1);
  }

  req.url = search ? `${cleanPathname}?${search}` : cleanPathname;
  next();
});

// --- JWT Auth Middleware (protects all write endpoints) ---
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, JWT_SECRET);
      return next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized: Authentication token has expired or is invalid.' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized: Valid JWT Bearer authentication token required' });
}

// --- Mongoose Schemas & Models ---
const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'site_settings' }
);

const CadetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    cadetNo: { type: String, default: '', index: true },
    name: { type: String, default: '' },
    nameBangla: { type: String, default: '' },
    fatherName: { type: String, default: '' },
    fatherNameBangla: { type: String, default: '' },
    motherName: { type: String, default: '' },
    motherNameBangla: { type: String, default: '' },
    dob: { type: String, default: '' },
    religion: { type: String, default: 'Islam' },
    className: { type: String, default: '11th' },
    category: { type: String, default: 'Male Platoon' },
    section: { type: String, default: 'Section 01' },
    rank: { type: String, default: 'Cadet' },
    gender: { type: String, default: 'Male' },
    appointment: { type: String, default: 'Cadet' },
    platoon: { type: String, default: 'Male Platoon' },
    batch: { type: String, default: 'Batch 24' },
    collegeId: { type: String, default: '' },
    department: { type: String, default: '' },
    bloodGroup: { type: String, default: 'B+' },
    phone: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    email: { type: String, default: '' },
    joiningDate: { type: String, default: '' },
    attendancePercentage: { type: Number, default: 100 },
    paradesAttended: { type: Number, default: 0 },
    totalParades: { type: Number, default: 0 },
    status: { type: String, default: 'Active' },
    cadetType: { type: String, default: 'Current' },
    isApproved: { type: Boolean, default: true },
    avatarUrl: { type: String, default: '' },
    rawData: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'cadets' }
);

const RecruitmentApplicantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    token: { type: String, default: '', index: true },
    serialNo: { type: String, default: '', index: true },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '', index: true },
    status: { type: String, default: 'Pending', index: true },
    appliedAt: { type: String, default: '' },
    formData: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'recruitment_applicants' }
);

const NoticeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, default: 'General' },
    content: { type: String, default: '' },
    date: { type: String, default: '' },
    pinned: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'notices_blogs' }
);

const TrainingEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    location: { type: String, default: '' },
    date: { type: String, default: '' },
    time: { type: String, default: '' },
    status: { type: String, default: 'Upcoming' },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'training_events' }
);

const ContactMessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    timestamp: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'contact_messages' }
);

const SettingModel: any = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
const CadetModel: any = mongoose.models.Cadet || mongoose.model('Cadet', CadetSchema);
const RecruitmentApplicantModel: any = mongoose.models.RecruitmentApplicant || mongoose.model('RecruitmentApplicant', RecruitmentApplicantSchema);
const NoticeModel: any = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
const TrainingEventModel: any = mongoose.models.TrainingEvent || mongoose.model('TrainingEvent', TrainingEventSchema);
const ContactMessageModel: any = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);

// --- High-Speed In-Memory Cache (Pre-Seeded with Canonical Defaults) ---
// Guarantees any connected device receives full data on first hit, even before DB connects!
export function deduplicateCadetList(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  const byCadetNo = new Map<string, any>();
  const byId = new Map<string, any>();

  for (const c of list) {
    if (!c) continue;
    const cId = String(c.id || '').trim();
    const cNo = String(c.cadetNo || c.cadetNumber || '').trim().toUpperCase();

    const existing = (cNo && byCadetNo.get(cNo)) || (cId && byId.get(cId));
    if (existing) {
      const canonicalId =
        (existing.id && (String(existing.id).startsWith('usr-') || !/^\d{6,}$/.test(String(existing.id))))
          ? existing.id
          : (cId && (cId.startsWith('usr-') || !/^\d{6,}$/.test(cId))) ? cId : (existing.id || cId);

      const merged = { ...existing, ...c, id: canonicalId };
      if (cNo) byCadetNo.set(cNo, merged);
      byId.set(canonicalId, merged);
      if (existing.id && existing.id !== canonicalId) byId.delete(existing.id);
      if (cId && cId !== canonicalId) byId.delete(cId);
    } else {
      if (cNo) byCadetNo.set(cNo, c);
      if (cId) byId.set(cId, c);
    }
  }

  return Array.from(byId.values());
}

let cachedSettings: Record<string, any> = { ...getDefaultSiteSettings(), ...CANONICAL_SETTINGS };
let rawInitialCadets: any[] = CANONICAL_CADETS.length > 0 ? [...CANONICAL_CADETS] : (INITIAL_CADET_USERS || []);
let cachedCadets: any[] = deduplicateCadetList(rawInitialCadets);
if (!cachedSettings['ngdc_cadet_users_v8'] || cachedSettings['ngdc_cadet_users_v8'].length === 0) {
  cachedSettings['ngdc_cadet_users_v8'] = cachedCadets;
} else {
  cachedSettings['ngdc_cadet_users_v8'] = deduplicateCadetList(cachedSettings['ngdc_cadet_users_v8']);
}
let syncVersion: number = Date.now();
let isMongoConnected = false;
let mongoLastError: string | null = null;
let isConnecting = false;

// --- Real-Time Multi-Device Engine (Conditional WebSocket + SSE) ---
const sseClients = new Set<express.Response>();
const wsClients = new Set<WebSocket>();

// Initialize WebSocket Server on /ws only in persistent Node environments (not Vercel Serverless)
let wss: WebSocketServer | null = null;
if (!process.env.VERCEL) {
  try {
    wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws: WebSocket) => {
      wsClients.add(ws);

      // Send immediate handshake with current version
      try {
        ws.send(JSON.stringify({
          type: 'CONNECTED',
          version: syncVersion,
          clientsCount: wsClients.size + sseClients.size,
          timestamp: Date.now(),
        }));
      } catch {}

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', version: syncVersion }));
          }
        } catch {}
      });

      ws.on('close', () => {
        wsClients.delete(ws);
      });

      ws.on('error', () => {
        wsClients.delete(ws);
      });
    });
  } catch (wsErr) {
    console.warn('[WebSocket] Skipped WebSocket server initialization:', wsErr);
  }
}

// Dual broadcast: sends to both WebSocket clients and SSE clients if any are open
export function broadcastRealtime(event: { type: string; payload?: any; version: number; collection?: string; action?: string }) {
  const jsonStr = JSON.stringify(event);

  if (wsClients.size > 0) {
    for (const client of wsClients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(jsonStr);
        } catch {
          wsClients.delete(client);
        }
      }
    }
  }

  if (sseClients.size > 0) {
    const sseData = `data: ${jsonStr}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(sseData);
      } catch {
        sseClients.delete(client);
      }
    }
  }
}

// Backward-compatible alias
export const broadcastSse = broadcastRealtime;

// 10-second heartbeat to keep active connections alive (in long-running container mode)
if (!process.env.VERCEL) {
  setInterval(() => {
    for (const client of wsClients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.ping();
        } catch {
          wsClients.delete(client);
        }
      }
    }

    for (const client of sseClients) {
      try {
        client.write(': heartbeat\n\n');
      } catch {
        sseClients.delete(client);
      }
    }
  }, 10000);
}

const DEFAULT_MONGODB_URI = 'mongodb+srv://bnccngdc123_db_user:NgdcBNCC1979@cluster0.ipvixds.mongodb.net/?appName=Cluster0';

// Global Mongoose cache for Serverless Function reuse (Vercel / Lambda)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

let cachedConnection: MongooseCache = global._mongooseCache || { conn: null, promise: null };
if (!global._mongooseCache) {
  global._mongooseCache = cachedConnection;
}

let isCacheHydrated = false;
let hydrationPromise: Promise<void> | null = null;

async function hydrateCacheFromDb(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    try {
      const [docs, cadetDocs, applicantDocs, noticeDocs, trainingDocs, contactDocs] = await Promise.all([
        SettingModel.find({}).lean(),
        CadetModel.find({}).lean(),
        RecruitmentApplicantModel.find({}).lean(),
        NoticeModel.find({}).lean(),
        TrainingEventModel.find({}).lean(),
        ContactMessageModel.find({}).lean(),
      ]);

      if (docs && docs.length > 0) {
        docs.forEach((doc: any) => {
          if (doc && doc.key) {
            cachedSettings[doc.key] = doc.value;
          }
        });
      }

      // --- AUTOMATIC ZERO-DATA-LOSS MIGRATION ---
      // Migration 1: Recruitment Applicants (from legacy site_settings to dedicated recruitment_applicants collection)
      const legacyApplicants = Array.isArray(cachedSettings['ngdc_recruitment_applicants'])
        ? cachedSettings['ngdc_recruitment_applicants']
        : [];
      if (legacyApplicants.length > 0 && applicantDocs.length === 0) {
        console.log(`[Migration] Migrating ${legacyApplicants.length} recruitment applicants to dedicated collection...`);
        const ops = legacyApplicants.map((a: any) => {
          const id = String(a.id || a.token || a.serialNo || `app-${Date.now()}-${Math.random()}`);
          return {
            updateOne: {
              filter: { id },
              update: { $set: { ...a, id, formData: a, updatedAt: new Date() } },
              upsert: true,
            },
          };
        });
        await RecruitmentApplicantModel.bulkWrite(ops).catch((err: any) => console.warn('[Migration] Applicants write warning:', err));
      }

      // Migration 2: Notices & Blogs
      const legacyNotices = Array.isArray(cachedSettings['ngdc_notices_blogs']) ? cachedSettings['ngdc_notices_blogs'] : [];
      if (legacyNotices.length > 0 && noticeDocs.length === 0) {
        console.log(`[Migration] Migrating ${legacyNotices.length} notices to dedicated collection...`);
        const ops = legacyNotices.map((n: any) => {
          const id = String(n.id || `not-${Date.now()}-${Math.random()}`);
          return {
            updateOne: {
              filter: { id },
              update: { $set: { ...n, id, updatedAt: new Date() } },
              upsert: true,
            },
          };
        });
        await NoticeModel.bulkWrite(ops).catch((err: any) => console.warn('[Migration] Notices write warning:', err));
      }

      // Migration 3: Contact Messages
      const legacyMessages = Array.isArray(cachedSettings['ngdc_contact_messages']) ? cachedSettings['ngdc_contact_messages'] : [];
      if (legacyMessages.length > 0 && contactDocs.length === 0) {
        console.log(`[Migration] Migrating ${legacyMessages.length} contact messages to dedicated collection...`);
        const ops = legacyMessages.map((m: any) => {
          const id = String(m.id || `msg-${Date.now()}-${Math.random()}`);
          return {
            updateOne: {
              filter: { id },
              update: { $set: { ...m, id, updatedAt: new Date() } },
              upsert: true,
            },
          };
        });
        await ContactMessageModel.bulkWrite(ops).catch((err: any) => console.warn('[Migration] Contact messages write warning:', err));
      }

      // Migration 4: Cadets
      const legacyCadets = Array.isArray(cachedSettings['ngdc_cadet_users_v8']) ? cachedSettings['ngdc_cadet_users_v8'] : [];
      if (legacyCadets.length > 0 && cadetDocs.length === 0) {
        console.log(`[Migration] Migrating ${legacyCadets.length} cadets to dedicated collection...`);
        const ops = legacyCadets.map((c: any) => {
          const id = String(c.id || c.cadetNo);
          return {
            updateOne: {
              filter: { id },
              update: { $set: { ...c, id, rawData: c, updatedAt: new Date() } },
              upsert: true,
            },
          };
        });
        await CadetModel.bulkWrite(ops).catch((err: any) => console.warn('[Migration] Cadets write warning:', err));
      }

      // --- HYDRATE IN-MEMORY CACHE FROM DEDICATED MONGOOSE COLLECTIONS ---
      const [freshApplicants, freshCadets, freshNotices, freshEvents, freshMessages] = await Promise.all([
        RecruitmentApplicantModel.find({}).lean(),
        CadetModel.find({}).lean(),
        NoticeModel.find({}).lean(),
        TrainingEventModel.find({}).lean(),
        ContactMessageModel.find({}).lean(),
      ]);

      if (freshApplicants && freshApplicants.length > 0) {
        cachedSettings['ngdc_recruitment_applicants'] = freshApplicants.map((a: any) => {
          const formData = a.formData || {};
          return { ...formData, ...a, _id: undefined, __v: undefined, formData: undefined };
        });
      }

      if (freshNotices && freshNotices.length > 0) {
        cachedSettings['ngdc_notices_blogs'] = freshNotices.map((n: any) => ({
          ...n,
          _id: undefined,
          __v: undefined,
        }));
      }

      if (freshEvents && freshEvents.length > 0) {
        cachedSettings['ngdc_training_events'] = freshEvents.map((e: any) => ({
          ...e,
          _id: undefined,
          __v: undefined,
        }));
      }

      if (freshMessages && freshMessages.length > 0) {
        cachedSettings['ngdc_contact_messages'] = freshMessages.map((m: any) => ({
          ...m,
          _id: undefined,
          __v: undefined,
        }));
      }

      if (freshCadets && freshCadets.length > 0) {
        const list = freshCadets.map((c: any) => {
          const raw = c.rawData || {};
          return {
            ...raw,
            ...c,
            _id: undefined,
            __v: undefined,
            rawData: undefined,
          };
        }).filter((c: any) => {
          const id = String(c?.id || '').trim();
          return !id.startsWith('c-male-') && !id.startsWith('c-female-') && !id.startsWith('c-band-');
        });
        const cleanList = deduplicateCadetList(list);
        cachedCadets = cleanList;
        cachedSettings['ngdc_cadet_users_v8'] = cleanList;
      } else if (cachedSettings['ngdc_cadet_users_v8'] && Array.isArray(cachedSettings['ngdc_cadet_users_v8'])) {
        cachedCadets = deduplicateCadetList(cachedSettings['ngdc_cadet_users_v8'].filter((c: any) => {
          const id = String(c?.id || '').trim();
          return !id.startsWith('c-male-') && !id.startsWith('c-female-') && !id.startsWith('c-band-');
        }));
        cachedSettings['ngdc_cadet_users_v8'] = cachedCadets;
      } else {
        cachedCadets = [];
        cachedSettings['ngdc_cadet_users_v8'] = [];
      }

      isCacheHydrated = true;
      cleanDuplicateCadetsInMongo().catch(() => {});
    } catch (err: any) {
      console.warn('[MongoDB Atlas] Hydration warning:', err?.message || err);
    } finally {
      hydrationPromise = null;
    }
  })();

  return hydrationPromise;
}

// Background cleanup worker for duplicate MongoDB records
async function cleanDuplicateCadetsInMongo() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const allCadets = await CadetModel.find({}).lean();
    if (!allCadets || allCadets.length === 0) return;

    const seenCadetNos = new Map<string, any>();
    const idsToDelete: any[] = [];

    for (const doc of allCadets) {
      const cNo = String(doc.cadetNo || (doc as any).cadetNumber || '').trim().toUpperCase();
      if (!cNo) continue;
      if (seenCadetNos.has(cNo)) {
        const existing = seenCadetNos.get(cNo);
        
        // Prioritize approved and active records
        const newIsApproved = !!doc.isApproved || doc.status === 'Active' || doc.status === 'Alumni';
        const existingIsApproved = !!existing.isApproved || existing.status === 'Active' || existing.status === 'Alumni';
        
        let keepNew = false;
        if (newIsApproved && !existingIsApproved) {
          keepNew = true;
        } else if (!newIsApproved && existingIsApproved) {
          keepNew = false;
        } else {
          // Prefer keeping record with usr- prefixed id
          if (String(doc.id).startsWith('usr-') && !String(existing.id).startsWith('usr-')) {
            keepNew = true;
          } else {
            keepNew = false;
          }
        }

        if (keepNew) {
          idsToDelete.push(existing._id);
          seenCadetNos.set(cNo, doc);
        } else {
          idsToDelete.push(doc._id);
        }
      } else {
        seenCadetNos.set(cNo, doc);
      }
    }

    if (idsToDelete.length > 0) {
      console.log(`[MongoDB] Purging ${idsToDelete.length} duplicate cadet records from database...`);
      await CadetModel.deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (err) {
    console.warn('[MongoDB] Cleanup duplicates error:', err);
  }
}

// Connect to MongoDB Atlas (reusing cached connection across serverless invocations)
async function initMongoConnection(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim() || DEFAULT_MONGODB_URI;
  if (!uri) {
    mongoLastError = 'MONGODB_URI environment variable not defined (operating with high-speed pre-seeded cache)';
    return false;
  }

  if (cachedConnection.conn && mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    mongoLastError = null;
    return true;
  }

  if (!cachedConnection.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 6000,
    };
    cachedConnection.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('✅ [MongoDB Atlas] Connected successfully to database.');
      isMongoConnected = true;
      mongoLastError = null;
      return m;
    });
  }

  try {
    cachedConnection.conn = await cachedConnection.promise;
    isMongoConnected = true;
    mongoLastError = null;

    // Fully hydrate in-memory cache from MongoDB Atlas
    await hydrateCacheFromDb();

    return true;
  } catch (err: any) {
    cachedConnection.promise = null;
    const rawMsg = err?.message || String(err);
    mongoLastError = rawMsg;
    isMongoConnected = false;
    return false;
  }
}

// Background reconnect worker in standalone mode
if (!process.env.VERCEL) {
  setInterval(() => {
    if (!isMongoConnected) {
      initMongoConnection().catch(() => {});
    }
  }, 10000);
}

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  if (cachedConnection) cachedConnection.conn = null;
});

mongoose.connection.on('reconnected', () => {
  isMongoConnected = true;
  mongoLastError = null;
});

// --- API Endpoints ---

// 1. Health & Status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'Express + MongoDB Atlas + WebSocket Realtime',
    mongoConnected: isMongoConnected,
    cachedSettingsCount: Object.keys(cachedSettings).length,
    cachedCadetsCount: cachedCadets.length,
    connectedWsClients: wsClients.size,
    connectedSseClients: sseClients.size,
    totalClients: wsClients.size + sseClients.size,
    syncVersion,
  });
});

// Friendly HTTP status for /ws if requested via standard browser GET instead of WebSocket upgrade
app.get('/ws', (_req, res) => {
  res.json({
    service: 'NGDC-BNCC Realtime WebSocket Server',
    status: 'active',
    protocol: 'wss',
    endpoint: '/ws',
    message: 'WebSocket server is running. Connect using JavaScript: new WebSocket("wss://<host>/ws")',
    connectedWsClients: wsClients.size,
    syncVersion,
  });
});

app.get('/api/db/status', (_req, res) => {
  res.json({
    type: 'MongoDB Atlas',
    connected: isMongoConnected,
    hasUri: Boolean(process.env.MONGODB_URI || DEFAULT_MONGODB_URI),
    error: mongoLastError,
    isWhitelistError: Boolean(
      mongoLastError &&
        (mongoLastError.includes('whitelist') || mongoLastError.includes('Could not connect to any servers'))
    ),
    settingsCount: Object.keys(cachedSettings).length,
    cadetsCount: cachedCadets.length,
    connectedWsClients: wsClients.size,
    connectedSseClients: sseClients.size,
    totalConnectedClients: wsClients.size + sseClients.size,
    syncVersion,
  });
});

// Manual reconnect trigger
app.all('/api/db/reconnect', async (_req, res) => {
  const success = await initMongoConnection();
  res.json({
    success,
    connected: isMongoConnected,
    error: mongoLastError,
  });
});

// 2. Real-time Server-Sent Events (SSE) Stream
// Every connected browser & mobile phone connects here for 0-latency instant updates!
app.get('/api/events', (req, res) => {
  // Serverless environments (Vercel) cannot hold persistent SSE TCP sockets open
  if (process.env.VERCEL) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ status: 'sse_disabled_serverless', version: syncVersion });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Handshake event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', version: syncVersion, clientsCount: sseClients.size + 1 })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 3. Sync Version Check (Instant database-backed or memory version check)
app.get('/api/version', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  initMongoConnection().catch(() => {});

  res.json({ version: syncVersion, timestamp: Date.now(), clients: sseClients.size });
});

// In-memory brute-force lockout tracker (5 attempts max, 15-minute lockout)
const failedLoginAttempts = new Map<string, { count: number; lockUntil: number }>();

// 4. Authentication Endpoints (JWT & Officer Console)
app.all('/api/auth/login', async (req, res) => {
  const { username, password, officerId } = req.body || {};
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const lockKey = `${clientIp}_${(username || officerId || '').toLowerCase().trim()}`;

  // Check lockout status
  const existingAttempt = failedLoginAttempts.get(lockKey);
  const now = Date.now();
  if (existingAttempt && existingAttempt.lockUntil > now) {
    const remainingSec = Math.ceil((existingAttempt.lockUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Command console is temporarily locked due to excessive failed attempts. Please wait ${remainingSec} seconds before retrying.`,
      isLocked: true,
      lockoutUntil: existingAttempt.lockUntil,
      remainingSeconds: remainingSec,
    });
  }

  let currentOfficerId = cachedSettings['ngdc_admin_officer_id'] || 'ngdc_bncc_1979';
  let currentPassword = cachedSettings['ngdc_admin_master_password'] || 'Ngdc$BNCC$1979';

  try {
    await initMongoConnection();
    if (mongoose.connection.readyState === 1) {
      const uDoc = await SettingModel.findOne({ key: 'ngdc_admin_officer_id' }).lean();
      if (uDoc && uDoc.value) currentOfficerId = String(uDoc.value);
      const pDoc = await SettingModel.findOne({ key: 'ngdc_admin_master_password' }).lean();
      if (pDoc && pDoc.value) currentPassword = String(pDoc.value);
    }
  } catch {}

  const enteredUser = String(username || officerId || '').trim();
  const enteredPass = String(password || '').trim();

  const isUserMatch = enteredUser === String(currentOfficerId).trim();
  const isPassMatch = enteredPass === String(currentPassword).trim();

  if (!isUserMatch || !isPassMatch) {
    const currentCount = (existingAttempt?.lockUntil && existingAttempt.lockUntil > now) ? 1 : ((existingAttempt?.count || 0) + 1);
    if (currentCount >= 5) {
      const lockUntil = now + 15 * 60 * 1000; // 15-minute lock
      failedLoginAttempts.set(lockKey, { count: currentCount, lockUntil });
      return res.status(429).json({
        success: false,
        error: 'Maximum failed authentication attempts exceeded. Console locked for 15 minutes.',
        isLocked: true,
        lockoutUntil: lockUntil,
        remainingSeconds: 900,
      });
    } else {
      failedLoginAttempts.set(lockKey, { count: currentCount, lockUntil: 0 });
      return res.status(401).json({
        success: false,
        error: `Invalid Officer ID or Master Password. (${5 - currentCount} attempt${5 - currentCount === 1 ? '' : 's'} remaining)`,
        attemptsLeft: 5 - currentCount,
        isLocked: false,
      });
    }
  }

  // Clear attempts on success
  failedLoginAttempts.delete(lockKey);

  const token = jwt.sign(
    { role: 'admin', officerId: currentOfficerId, service: 'ngdc_bncc_portal', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    success: true,
    token,
    role: 'admin',
    officerId: currentOfficerId,
    expiresIn: '30d',
    timestamp: Date.now(),
  });
});

app.all('/api/auth/update-credentials', async (req, res) => {
  try {
    const { currentPassword, newOfficerId, newPassword } = req.body || {};
    let activePassword = cachedSettings['ngdc_admin_master_password'] || 'Ngdc$BNCC$1979';

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        const pDoc = await SettingModel.findOne({ key: 'ngdc_admin_master_password' }).lean();
        if (pDoc && pDoc.value) activePassword = String(pDoc.value);
      }
    } catch {}

    if (!currentPassword || String(currentPassword).trim() !== String(activePassword).trim()) {
      return res.status(401).json({ success: false, error: 'Current Master Password authorization failed.' });
    }

    if (!newOfficerId || String(newOfficerId).trim().length < 3) {
      return res.status(400).json({ success: false, error: 'New Officer ID must be at least 3 characters.' });
    }

    if (!newPassword || String(newPassword).trim().length < 6) {
      return res.status(400).json({ success: false, error: 'New Master Password must be at least 6 characters.' });
    }

    const trimmedOfficerId = String(newOfficerId).trim();
    const trimmedPassword = String(newPassword).trim();

    cachedSettings['ngdc_admin_officer_id'] = trimmedOfficerId;
    cachedSettings['ngdc_admin_master_password'] = trimmedPassword;

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_admin_officer_id' },
          { key: 'ngdc_admin_officer_id', value: trimmedOfficerId, updatedAt: new Date() },
          { upsert: true }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_admin_master_password' },
          { key: 'ngdc_admin_master_password', value: trimmedPassword, updatedAt: new Date() },
          { upsert: true }
        );
      }
    } catch (dbErr) {
      console.warn('[Credentials Update] Mongo save error:', dbErr);
    }

    syncVersion += 1;
    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: {
        key: 'ngdc_admin_officer_id',
        officerId: trimmedOfficerId,
      },
      version: syncVersion,
    });

    res.json({
      success: true,
      message: 'Officer ID and Master Password successfully updated with zero downtime.',
      officerId: trimmedOfficerId,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update credentials' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ valid: false });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch {
    return res.json({ valid: false });
  }
});

// 5. Settings Endpoints
app.get('/api/settings', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  initMongoConnection().catch(() => {});

  const publicSafeSettings = { ...cachedSettings };
  delete publicSafeSettings['ngdc_admin_master_password'];
  res.json(publicSafeSettings);
});

app.all('/api/settings', (req, res, next) => {
  // Allow public intake keys (recruitment applicants, contact messages, training submissions, pending cadet profile updates) without admin JWT
  const publicIntakeKeys = [
    'ngdc_recruitment_applicants',
    'ngdc_contact_messages',
    'ngdc_training_submissions',
    'ngdc_cadet_pending_updates',
  ];
  if (req.body && req.body.key && publicIntakeKeys.includes(req.body.key)) {
    return next();
  }
  return requireAuth(req, res, next);
}, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Missing setting key' });
    }

    let effectiveValue = value;

    // Safety guard: if ngdc_recruitment_applicants is being updated without explicit admin authentication or contains a partial list, merge with existing
    if (key === 'ngdc_recruitment_applicants' && Array.isArray(value)) {
      const authHeader = req.headers.authorization;
      const isAdmin = !!(authHeader && authHeader.startsWith('Bearer '));
      if (!isAdmin) {
        let existingList: any[] = [];
        if (Array.isArray(cachedSettings['ngdc_recruitment_applicants'])) {
          existingList = cachedSettings['ngdc_recruitment_applicants'];
        }
        const map = new Map<string, any>();
        existingList.forEach((a) => {
          const k = a?.serialNo || a?.token || a?.id;
          if (k) map.set(k, a);
        });
        value.forEach((a) => {
          const k = a?.serialNo || a?.token || a?.id;
          if (k) {
            const ex = map.get(k);
            map.set(k, ex ? { ...ex, ...a } : a);
          }
        });
        effectiveValue = Array.from(map.values());
      }
    }

    // 1. Update local cache
    cachedSettings[key] = effectiveValue;
    syncVersion = Date.now();

    if (key === 'ngdc_cadet_users_v8' && Array.isArray(effectiveValue)) {
      cachedCadets = [...effectiveValue];
    }

    // 2. Real-time push (for any active clients in this worker)
    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: { key, value: effectiveValue },
      version: syncVersion,
    });

    // 3. Persist to MongoDB (awaiting ensures serverless doesn't terminate early)
    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await SettingModel.findOneAndUpdate(
          { key },
          { key, value: effectiveValue, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );

        if (key === 'ngdc_recruitment_applicants' && Array.isArray(effectiveValue)) {
          const ops = effectiveValue.map((a: any) => {
            const id = String(a.id || a.token || a.serialNo || `app-${Date.now()}-${Math.random()}`);
            return {
              updateOne: {
                filter: { id },
                update: { $set: { ...a, id, formData: a, updatedAt: new Date() } },
                upsert: true,
              },
            };
          });
          if (ops.length > 0) await RecruitmentApplicantModel.bulkWrite(ops).catch(() => {});
        }

        if (key === 'ngdc_notices_blogs' && Array.isArray(effectiveValue)) {
          const ops = effectiveValue.map((n: any) => {
            const id = String(n.id || `not-${Date.now()}-${Math.random()}`);
            return {
              updateOne: {
                filter: { id },
                update: { $set: { ...n, id, updatedAt: new Date() } },
                upsert: true,
              },
            };
          });
          if (ops.length > 0) await NoticeModel.bulkWrite(ops).catch(() => {});
        }

        if (key === 'ngdc_training_events' && Array.isArray(effectiveValue)) {
          const ops = effectiveValue.map((e: any) => {
            const id = String(e.id || `evt-${Date.now()}-${Math.random()}`);
            return {
              updateOne: {
                filter: { id },
                update: { $set: { ...e, id, updatedAt: new Date() } },
                upsert: true,
              },
            };
          });
          if (ops.length > 0) await TrainingEventModel.bulkWrite(ops).catch(() => {});
        }

        if (key === 'ngdc_contact_messages' && Array.isArray(effectiveValue)) {
          const ops = effectiveValue.map((m: any) => {
            const id = String(m.id || `msg-${Date.now()}-${Math.random()}`);
            return {
              updateOne: {
                filter: { id },
                update: { $set: { ...m, id, updatedAt: new Date() } },
                upsert: true,
              },
            };
          });
          if (ops.length > 0) await ContactMessageModel.bulkWrite(ops).catch(() => {});
        }

        if (key === 'ngdc_cadet_users_v8' && Array.isArray(effectiveValue) && effectiveValue.length > 0) {
          const cadetOps = effectiveValue.map((c: any) => ({
            updateOne: {
              filter: { id: String(c.id || c.cadetNo) },
              update: {
                $set: {
                  ...c,
                  id: String(c.id || c.cadetNo),
                  rawData: c,
                  updatedAt: new Date(),
                },
              },
              upsert: true,
            },
          }));
          await CadetModel.bulkWrite(cadetOps).catch(() => {});
        }
      }
    } catch (dbErr) {
      console.warn('[API /settings] MongoDB write warning:', dbErr);
    }

    res.json({ success: true, key, version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update setting' });
  }
});

// Bulk settings save
app.all('/api/settings/bulk', requireAuth, async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings object' });
    }

    Object.assign(cachedSettings, settings);
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'BULK_SETTINGS_UPDATED',
      payload: settings,
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        const ops = Object.entries(settings).map(([key, value]) => ({
          updateOne: {
            filter: { key },
            update: { $set: { key, value, updatedAt: new Date() } },
            upsert: true,
          },
        }));
        if (ops.length > 0) {
          await SettingModel.bulkWrite(ops);
        }
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn('[API /settings/bulk] MongoDB bulk write warning:', dbErr);
    }

    res.json({ success: true, count: Object.keys(settings).length, version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Bulk settings update failed' });
  }
});

// 6. Cadets Endpoints
// Public registration endpoint for applicant cadets (no admin JWT required)
app.post('/api/cadets/register', async (req, res) => {
  try {
    const cadet = req.body;
    if (!cadet || (!cadet.name && !cadet.fullName)) {
      return res.status(400).json({ error: 'Cadet name is required' });
    }

    const rawNo = cadet.cadetNo ? String(cadet.cadetNo).trim().toUpperCase() : '';
    const providedId = cadet.id ? String(cadet.id).trim() : '';

    const existingIndex = cachedCadets.findIndex(
      (c) =>
        (providedId && String(c.id || '').trim() === providedId) ||
        (rawNo && String(c.cadetNo || c.cadetNumber || '').trim().toUpperCase() === rawNo)
    );

    let targetId = providedId;
    if (existingIndex >= 0 && cachedCadets[existingIndex].id) {
      targetId = cachedCadets[existingIndex].id;
    }
    if (!targetId) {
      targetId = `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const cleanCadet = {
      ...(existingIndex >= 0 ? cachedCadets[existingIndex] : {}),
      ...cadet,
      id: targetId,
      status: cadet.status || 'Pending Approval',
      isApproved: false,
      createdAt: existingIndex >= 0 && cachedCadets[existingIndex].createdAt ? cachedCadets[existingIndex].createdAt : new Date(),
    };

    if (existingIndex >= 0) {
      cachedCadets[existingIndex] = cleanCadet;
    } else {
      cachedCadets.unshift(cleanCadet);
    }
    cachedCadets = deduplicateCadetList(cachedCadets);
    cachedSettings['ngdc_cadet_users_v8'] = [...cachedCadets];
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'CADETS_UPDATED',
      collection: 'cadets',
      action: 'upsert',
      payload: cleanCadet,
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        const rawData = { ...cleanCadet };
        delete (rawData as any)._id;

        const filter = rawNo
          ? { $or: [{ id: targetId }, { cadetNo: rawNo }] }
          : { id: targetId };

        await CadetModel.findOneAndUpdate(
          filter,
          { ...cleanCadet, rawData, id: targetId, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_users_v8' },
          { key: 'ngdc_cadet_users_v8', value: cachedCadets, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn(`[MongoDB] Failed to persist applicant cadet ${targetId}:`, dbErr);
    }

    res.json({ success: true, cadet: cleanCadet, message: 'Application submitted for Admin review', version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to submit registration' });
  }
});

// Cadet Profile Update Request Endpoint (Public - Queues in Admin Approval Console)
app.get('/api/cadets/pending-updates', async (req, res) => {
  try {
    let currentUpdates: any[] = [];
    if (Array.isArray(cachedSettings['ngdc_cadet_pending_updates'])) {
      currentUpdates = cachedSettings['ngdc_cadet_pending_updates'];
    }
    res.json({ success: true, updates: currentUpdates, count: currentUpdates.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch pending updates' });
  }
});

app.all('/api/cadets/request-update', async (req, res) => {
  try {
    const { cadetNo, changes, cadetName, cadetId, id, requestedAt, status } = req.body;
    if (!cadetNo && !cadetId) {
      return res.status(400).json({ error: 'Cadet identification is required' });
    }

    const normNo = String(cadetNo || '').trim().toUpperCase();
    const effectiveCadetId = String(cadetId || '').trim();

    // Look for cadet in cachedCadets or cachedSettings['ngdc_cadet_users_v8']
    let cadet = cachedCadets.find(
      (c: any) =>
        (normNo && String(c.cadetNo || c.cadetNumber || '').trim().toUpperCase() === normNo) ||
        (effectiveCadetId && String(c.id || '').trim() === effectiveCadetId)
    );

    if (!cadet && Array.isArray(cachedSettings['ngdc_cadet_users_v8'])) {
      cadet = cachedSettings['ngdc_cadet_users_v8'].find(
        (c: any) =>
          (normNo && String(c.cadetNo || c.cadetNumber || '').trim().toUpperCase() === normNo) ||
          (effectiveCadetId && String(c.id || '').trim() === effectiveCadetId)
      );
    }

    const cleanChanges = { ...(changes || {}) };
    delete cleanChanges.password;
    delete cleanChanges.id;

    const newRequest = {
      id: id || `req-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      cadetId: effectiveCadetId || cadet?.id || `usr-${Date.now()}`,
      cadetNo: normNo || cadet?.cadetNo || 'CADET',
      cadetName: cadetName || cadet?.fullName || cadet?.name || 'Cadet',
      changes: cleanChanges,
      requestedAt: requestedAt || new Date().toISOString(),
      status: 'pending', // Standardize to lowercase pending
    };

    let currentUpdates: any[] = [];
    if (Array.isArray(cachedSettings['ngdc_cadet_pending_updates'])) {
      currentUpdates = [...cachedSettings['ngdc_cadet_pending_updates']];
    }

    const nextList = [
      newRequest,
      ...currentUpdates.filter((r: any) => {
        const rNo = String(r.cadetNo || '').trim().toUpperCase();
        const rId = String(r.id || '').trim();
        if (rId === newRequest.id) return false;
        if (rNo && rNo === newRequest.cadetNo) return false;
        return true;
      }),
    ];

    cachedSettings['ngdc_cadet_pending_updates'] = nextList;
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: { key: 'ngdc_cadet_pending_updates', value: nextList },
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_pending_updates' },
          { key: 'ngdc_cadet_pending_updates', value: nextList, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn('[MongoDB] Save pending profile update warning:', dbErr);
    }

    res.json({ success: true, message: 'Profile update request received', request: newRequest });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to process profile update request' });
  }
});

// Resolve or reject a pending profile update
const resolvePendingUpdateHandler = async (req: express.Request, res: express.Response) => {
  try {
    const targetId = String(req.params.id || '').trim();
    if (!targetId) {
      return res.status(400).json({ error: 'Update request ID is required' });
    }

    let currentUpdates: any[] = [];
    if (Array.isArray(cachedSettings['ngdc_cadet_pending_updates'])) {
      currentUpdates = [...cachedSettings['ngdc_cadet_pending_updates']];
    }

    const remaining = currentUpdates.filter((r: any) => String(r.id || '').trim() !== targetId);
    cachedSettings['ngdc_cadet_pending_updates'] = remaining;
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: { key: 'ngdc_cadet_pending_updates', value: remaining },
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_pending_updates' },
          { key: 'ngdc_cadet_pending_updates', value: remaining, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn('[MongoDB] Save resolved pending profile update warning:', dbErr);
    }

    res.json({ success: true, remainingCount: remaining.length, version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to resolve pending update' });
  }
};

app.all('/api/cadets/pending-updates/:id/resolve', resolvePendingUpdateHandler);
app.delete('/api/cadets/pending-updates/:id', resolvePendingUpdateHandler);

// Direct Cloudinary Upload Endpoint (Server Proxy)
app.post('/api/upload/cloudinary', async (req, res) => {
  try {
    const { image, file, folder, uploadPreset: customPreset } = req.body || {};
    const targetFile = image || file;
    if (!targetFile) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || cachedSettings['ngdc_cloudinary_cloud_name'] || 'hqmx8juj';
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || customPreset || cachedSettings['ngdc_cloudinary_upload_preset'] || 'ngdc_bncc';

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Attempt 1: with folder
    try {
      const formData = new FormData();
      formData.append('upload_preset', uploadPreset);
      if (folder) formData.append('folder', folder);
      formData.append('file', targetFile);

      const cRes = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const data: any = await cRes.json().catch(() => ({}));
      if (cRes.ok && data?.secure_url) {
        return res.json({ success: true, url: data.secure_url, public_id: data.public_id });
      }

      // Attempt 2: without folder if folder was provided and failed
      if (folder) {
        const retryForm = new FormData();
        retryForm.append('upload_preset', uploadPreset);
        retryForm.append('file', targetFile);

        const retryRes = await fetch(uploadUrl, {
          method: 'POST',
          body: retryForm,
        });

        const retryData: any = await retryRes.json().catch(() => ({}));
        if (retryRes.ok && retryData?.secure_url) {
          return res.json({ success: true, url: retryData.secure_url, public_id: retryData.public_id });
        }
      }

      return res.status(cRes.status || 400).json({
        error: data?.error?.message || 'Cloudinary upload failed',
        details: data,
      });
    } catch (uploadErr: any) {
      return res.status(500).json({ error: uploadErr?.message || 'Cloudinary network request failed' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Server image upload error' });
  }
});

// 7. Recruitment Application Intake Endpoints (Public Application & Admin Review)
// Public application submission endpoint (No admin token required)
app.all('/api/recruitment/apply', async (req, res) => {
  try {
    const applicant = req.body;
    if (!applicant) {
      return res.status(400).json({ error: 'Applicant data is required' });
    }

    const effectiveName = (applicant.fullName || applicant.nameEnglish || applicant.nameBangla || '').trim();
    if (!effectiveName && !applicant.phone) {
      return res.status(400).json({ error: 'Applicant Name and Phone are required' });
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const token = applicant.token || applicant.serialNo || `NGDC-REC-${year}-${randomSuffix}`;
    const id = applicant.id || `app-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const cleanApplicant = {
      ...applicant,
      id,
      token,
      serialNo: applicant.serialNo || token,
      status: applicant.status || 'Pending',
      appliedAt: applicant.appliedAt || new Date().toLocaleString(),
      createdAt: new Date(),
    };

    // Load current applicants list from MongoDB & in-memory cache
    let currentList: any[] = [];
    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        const doc = await SettingModel.findOne({ key: 'ngdc_recruitment_applicants' }).lean();
        if (doc && Array.isArray((doc as any).value)) {
          currentList = [...(doc as any).value];
        }
      }
    } catch {}

    if (currentList.length === 0) {
      if (Array.isArray(cachedSettings['ngdc_recruitment_applicants'])) {
        currentList = [...cachedSettings['ngdc_recruitment_applicants']];
      } else if (typeof cachedSettings['ngdc_recruitment_applicants'] === 'string') {
        try {
          currentList = JSON.parse(cachedSettings['ngdc_recruitment_applicants']);
        } catch {
          currentList = [];
        }
      }
    } else if (Array.isArray(cachedSettings['ngdc_recruitment_applicants'])) {
      // Merge in any recent in-memory items that might not have committed yet
      const map = new Map<string, any>();
      currentList.forEach((a) => {
        const k = a?.serialNo || a?.token || a?.id;
        if (k) map.set(k, a);
      });
      cachedSettings['ngdc_recruitment_applicants'].forEach((a: any) => {
        const k = a?.serialNo || a?.token || a?.id;
        if (k && !map.has(k)) {
          map.set(k, a);
        }
      });
      currentList = Array.from(map.values());
    }

    // Upsert applicant (match by id or token)
    const existingIndex = currentList.findIndex(
      (a) => a && (a.id === cleanApplicant.id || a.token === cleanApplicant.token || (cleanApplicant.serialNo && a.serialNo === cleanApplicant.serialNo))
    );

    if (existingIndex >= 0) {
      currentList[existingIndex] = { ...currentList[existingIndex], ...cleanApplicant };
    } else {
      currentList.unshift(cleanApplicant);
    }

    // Update in-memory cache
    cachedSettings['ngdc_recruitment_applicants'] = currentList;
    syncVersion = Date.now();

    // Broadcast instant real-time update to all connected Admin dashboards
    broadcastRealtime({
      type: 'RECRUITMENT_APPLICATION_SUBMITTED',
      collection: 'site_settings',
      action: 'upsert',
      payload: {
        key: 'ngdc_recruitment_applicants',
        applicant: cleanApplicant,
        value: currentList,
      },
      version: syncVersion,
    });

    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: {
        key: 'ngdc_recruitment_applicants',
        value: currentList,
      },
      version: syncVersion,
    });

    // Persist directly to MongoDB Atlas
    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await RecruitmentApplicantModel.findOneAndUpdate(
          { id: cleanApplicant.id },
          { ...cleanApplicant, formData: cleanApplicant, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_recruitment_applicants' },
          { key: 'ngdc_recruitment_applicants', value: currentList, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr: any) {
      console.warn('[API /recruitment/apply] MongoDB save error:', dbErr?.message || dbErr);
    }

    res.json({
      success: true,
      message: 'Recruitment application received successfully',
      applicant: cleanApplicant,
      token: cleanApplicant.token,
      serialNo: cleanApplicant.serialNo,
      totalApplicants: currentList.length,
      version: syncVersion,
    });
  } catch (err: any) {
    console.error('[API /recruitment/apply] Error:', err);
    res.status(500).json({ error: err?.message || 'Failed to submit recruitment application' });
  }
});

// Fetch recruitment applicants (supports optional pagination & search filtering)
app.get('/api/recruitment/applicants', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    await initMongoConnection();
    if (!isCacheHydrated) {
      await hydrateCacheFromDb();
    }
  } catch {}

  const raw = cachedSettings['ngdc_recruitment_applicants'];
  let applicants: any[] = [];
  if (Array.isArray(raw)) {
    applicants = raw;
  } else if (typeof raw === 'string') {
    try {
      applicants = JSON.parse(raw);
    } catch {
      applicants = [];
    }
  }

  const { page, limit, search, status } = req.query;

  let filtered = [...applicants];
  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((a) => String(a.status || '').toLowerCase() === status.toLowerCase());
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (a) =>
        String(a.fullName || a.nameEnglish || a.nameBangla || '').toLowerCase().includes(q) ||
        String(a.phone || '').includes(q) ||
        String(a.token || a.serialNo || '').toLowerCase().includes(q)
    );
  }

  if (page || limit) {
    const pageNum = Math.max(1, parseInt(String(page || 1), 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit || 20), 10)));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedApplicants = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      applicants: paginatedApplicants,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum),
      version: syncVersion,
    });
  }

  res.json({
    success: true,
    applicants: filtered,
    count: filtered.length,
    version: syncVersion,
  });
});

// Delete recruitment applicant endpoint
app.delete('/api/recruitment/applicants/:id', async (req, res) => {
  try {
    const targetId = String(req.params.id || '').trim();
    if (!targetId) {
      return res.status(400).json({ error: 'Missing applicant id' });
    }

    let currentList: any[] = [];
    const raw = cachedSettings['ngdc_recruitment_applicants'];
    if (Array.isArray(raw)) {
      currentList = [...raw];
    } else if (typeof raw === 'string') {
      try {
        currentList = JSON.parse(raw);
      } catch {
        currentList = [];
      }
    }

    currentList = currentList.filter((a) => {
      if (!a) return false;
      const idMatch = a.id && String(a.id).trim() === targetId;
      const tokenMatch = a.token && String(a.token).trim() === targetId;
      const serialMatch = a.serialNo && String(a.serialNo).trim() === targetId;
      return !(idMatch || tokenMatch || serialMatch);
    });

    cachedSettings['ngdc_recruitment_applicants'] = currentList;
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: { key: 'ngdc_recruitment_applicants', value: currentList },
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await RecruitmentApplicantModel.deleteOne({
          $or: [{ id: targetId }, { token: targetId }, { serialNo: targetId }],
        }).catch(() => {});

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_recruitment_applicants' },
          { key: 'ngdc_recruitment_applicants', value: currentList, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn(`[MongoDB] Failed to delete applicant ${targetId}:`, dbErr);
    }

    res.json({ success: true, deletedId: targetId, remaining: currentList.length, version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete applicant' });
  }
});

app.delete('/api/recruitment/applicants', async (req, res) => {
  try {
    const targetId = String(req.body?.id || req.query?.id || '').trim();
    if (targetId) {
      let currentList: any[] = [];
      const raw = cachedSettings['ngdc_recruitment_applicants'];
      if (Array.isArray(raw)) {
        currentList = [...raw];
      } else if (typeof raw === 'string') {
        try {
          currentList = JSON.parse(raw);
        } catch {
          currentList = [];
        }
      }

      currentList = currentList.filter((a) => {
        if (!a) return false;
        const idMatch = a.id && String(a.id).trim() === targetId;
        const tokenMatch = a.token && String(a.token).trim() === targetId;
        const serialMatch = a.serialNo && String(a.serialNo).trim() === targetId;
        return !(idMatch || tokenMatch || serialMatch);
      });

      cachedSettings['ngdc_recruitment_applicants'] = currentList;
      syncVersion = Date.now();

      broadcastRealtime({
        type: 'SETTINGS_UPDATED',
        payload: { key: 'ngdc_recruitment_applicants', value: currentList },
        version: syncVersion,
      });

      try {
        await initMongoConnection();
        if (mongoose.connection.readyState === 1) {
          await SettingModel.findOneAndUpdate(
            { key: 'ngdc_recruitment_applicants' },
            { key: 'ngdc_recruitment_applicants', value: currentList, updatedAt: new Date() },
            { upsert: true, returnDocument: 'after' }
          );
        }
      } catch {}

      return res.json({ success: true, deletedId: targetId, remaining: currentList.length });
    }

    return res.status(400).json({ error: 'Missing applicant id' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to process request' });
  }
});

// Public Contact Form Submission Endpoint
app.all('/api/contact/submit', async (req, res) => {
  try {
    const msg = req.body;
    if (!msg || !msg.name || !msg.message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const newMsg = {
      ...msg,
      id: msg.id || `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: msg.timestamp || new Date().toLocaleString(),
      isRead: false,
    };

    let currentMessages: any[] = [];
    if (Array.isArray(cachedSettings['ngdc_contact_messages'])) {
      currentMessages = [...cachedSettings['ngdc_contact_messages']];
    }
    currentMessages.unshift(newMsg);

    cachedSettings['ngdc_contact_messages'] = currentMessages;
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: { key: 'ngdc_contact_messages', value: currentMessages },
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await ContactMessageModel.findOneAndUpdate(
          { id: newMsg.id },
          { ...newMsg, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        ).catch(() => {});

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_contact_messages' },
          { key: 'ngdc_contact_messages', value: currentMessages, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch {}

    res.json({ success: true, message: 'Message sent successfully', item: newMsg });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to submit contact message' });
  }
});

// Public Training Submission Endpoint
app.all('/api/training/submit', async (req, res) => {
  try {
    const sub = req.body;
    if (!sub) {
      return res.status(400).json({ error: 'Submission payload is required' });
    }

    const newSub = {
      ...sub,
      id: sub.id || `sub-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      submittedAt: sub.submittedAt || new Date().toLocaleString(),
    };

    let currentSubs: any[] = [];
    if (Array.isArray(cachedSettings['ngdc_training_submissions'])) {
      currentSubs = [...cachedSettings['ngdc_training_submissions']];
    }
    currentSubs.unshift(newSub);

    cachedSettings['ngdc_training_submissions'] = currentSubs;
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: { key: 'ngdc_training_submissions', value: currentSubs },
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_training_submissions' },
          { key: 'ngdc_training_submissions', value: currentSubs, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch {}

    res.json({ success: true, message: 'Training submission received', item: newSub });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to submit training form' });
  }
});

// Admin wipe all cadets & mock data
app.all('/api/cadets/wipe-all', requireAuth, async (_req, res) => {
  try {
    cachedCadets = [];
    cachedSettings['ngdc_cadet_users_v8'] = [];
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'BULK_CADETS_UPDATED',
      payload: [],
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await CadetModel.deleteMany({});
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_users_v8' },
          { key: 'ngdc_cadet_users_v8', value: [], updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn('[MongoDB] Wipe all cadets error:', dbErr);
    }

    res.json({ success: true, message: 'All cadet records wiped clean from database', version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to wipe cadets' });
  }
});

app.get('/api/cadets', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    await initMongoConnection();
    if (!isCacheHydrated) {
      await hydrateCacheFromDb();
    }
  } catch {}

  const { page, limit, search, category, rank } = req.query;

  let filtered = [...cachedCadets];
  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter((c) => String(c.category || c.platoon || '').toLowerCase() === category.toLowerCase());
  }
  if (rank && typeof rank === 'string' && rank !== 'all') {
    filtered = filtered.filter((c) => String(c.rank || '').toLowerCase() === rank.toLowerCase());
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        String(c.name || c.nameBangla || c.fullName || '').toLowerCase().includes(q) ||
        String(c.cadetNo || '').toLowerCase().includes(q) ||
        String(c.phone || '').includes(q)
    );
  }

  if (page || limit) {
    const pageNum = Math.max(1, parseInt(String(page || 1), 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit || 20), 10)));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedCadets = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      data: paginatedCadets,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum),
      version: syncVersion,
    });
  }

  res.json(filtered);
});

app.post('/api/cadets', requireAuth, saveCadetHandler);
app.put('/api/cadets', requireAuth, saveCadetHandler);
app.put('/api/cadets/:id', requireAuth, saveCadetHandler);
app.patch('/api/cadets', requireAuth, saveCadetHandler);
app.patch('/api/cadets/:id', requireAuth, saveCadetHandler);

async function saveCadetHandler(req: express.Request, res: express.Response) {
  try {
    const cadet = req.body;
    if (!cadet || (!cadet.id && !cadet.cadetNo)) {
      return res.status(400).json({ error: 'Invalid cadet data' });
    }

    const rawNo = cadet.cadetNo ? String(cadet.cadetNo).trim().toUpperCase() : '';
    const providedId = cadet.id ? String(cadet.id).trim() : '';

    const existingIndex = cachedCadets.findIndex(
      (c) =>
        (providedId && String(c.id || '').trim() === providedId) ||
        (rawNo && String(c.cadetNo || c.cadetNumber || '').trim().toUpperCase() === rawNo)
    );

    let targetId = providedId;
    if (existingIndex >= 0 && cachedCadets[existingIndex].id) {
      targetId = cachedCadets[existingIndex].id;
    }
    if (!targetId) {
      targetId = `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const cleanCadet = {
      ...(existingIndex >= 0 ? cachedCadets[existingIndex] : {}),
      ...cadet,
      id: targetId,
    };

    if (existingIndex >= 0) {
      cachedCadets[existingIndex] = cleanCadet;
    } else {
      cachedCadets.unshift(cleanCadet);
    }
    cachedCadets = deduplicateCadetList(cachedCadets);
    cachedSettings['ngdc_cadet_users_v8'] = [...cachedCadets];
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'CADETS_UPDATED',
      collection: 'cadets',
      action: 'upsert',
      payload: cleanCadet,
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        const rawData = { ...cleanCadet };
        delete (rawData as any)._id;

        const filter = rawNo
          ? { $or: [{ id: targetId }, { cadetNo: rawNo }] }
          : { id: targetId };

        await CadetModel.findOneAndUpdate(
          filter,
          { ...cleanCadet, rawData, id: targetId, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_users_v8' },
          { key: 'ngdc_cadet_users_v8', value: cachedCadets, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn(`[MongoDB] Failed to persist cadet ${targetId}:`, dbErr);
    }

    res.json({ success: true, id: targetId, version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save cadet' });
  }
}

app.delete('/api/cadets/:id', requireAuth, async (req, res) => {
  try {
    const targetId = String(req.params.id || '').trim();
    if (!targetId) {
      return res.status(400).json({ error: 'Missing cadet id' });
    }

    cachedCadets = cachedCadets.filter((c) => String(c.id || '').trim() !== targetId);
    cachedSettings['ngdc_cadet_users_v8'] = [...cachedCadets];
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'CADET_DELETED',
      collection: 'cadets',
      action: 'delete',
      payload: { id: targetId },
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await CadetModel.deleteOne({ id: targetId });
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_users_v8' },
          { key: 'ngdc_cadet_users_v8', value: cachedCadets, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn(`[MongoDB] Failed to delete cadet ${targetId}:`, dbErr);
    }

    res.json({ success: true, deletedId: targetId, version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete cadet' });
  }
});

// Bulk cadet sync
app.all('/api/cadets/bulk', requireAuth, async (req, res) => {
  try {
    const { cadets } = req.body;
    if (!Array.isArray(cadets)) {
      return res.status(400).json({ error: 'Expected cadets array' });
    }

    cachedCadets = [...cadets];
    cachedSettings['ngdc_cadet_users_v8'] = [...cadets];
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'BULK_CADETS_UPDATED',
      collection: 'cadets',
      action: 'bulk',
      payload: cadets,
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1 && cadets.length > 0) {
        const ops = cadets.map((c) => ({
          updateOne: {
            filter: { id: String(c.id || c.cadetNo) },
            update: {
              $set: {
                ...c,
                id: String(c.id || c.cadetNo),
                rawData: c,
                updatedAt: new Date(),
              },
            },
            upsert: true,
          },
        }));
        await CadetModel.bulkWrite(ops);
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_users_v8' },
          { key: 'ngdc_cadet_users_v8', value: cachedCadets, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
      }
    } catch (dbErr) {
      console.warn('[MongoDB] Bulk cadets write warning:', dbErr);
    }

    res.json({ success: true, count: cadets.length, version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Bulk cadets save failed' });
  }
});

// Root /api endpoint for health check or root invocations
app.get('/api', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'NGDC BNCC Portal API',
    mongoConnected: isMongoConnected,
    version: syncVersion,
  });
});

// Catch-all for unmatched /api routes to prevent function hanging
app.use((req, res, next) => {
  if (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?')) {
    return res.status(404).json({ error: `API route ${req.method} ${req.url} not found`, status: 404 });
  }
  next();
});

// Express global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Express Global Error]:', err);
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

// --- Vite Middleware in Dev & Static Files in Prod ---
async function startServer() {
  // Start server listening immediately so dev server is ready in milliseconds
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Fullstack] Server running on port ${PORT}`);
    console.log(`⚡ [Realtime] WebSockets active at /ws & SSE active at /api/events`);
  });

  // Connect to MongoDB Atlas concurrently in the background
  initMongoConnection().catch(() => {});

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Only launch standalone HTTP server when not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app, initMongoConnection };
