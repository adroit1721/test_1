import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import { getDefaultSiteSettings } from './src/data/defaultSiteSettings';
import { INITIAL_CADET_USERS } from './src/data/initialCadetUsers';
import { CANONICAL_SETTINGS, CANONICAL_CADETS } from './src/data/canonicalProductionData';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ngdc_bncc_portal_jwt_secret_key_2026';

// --- CORS: Allow all origins (security is enforced via JWT on write endpoints) ---
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'X-Requested-With'],
  })
);

// Explicit OPTIONS preflight handler for all routes
app.options('*', cors());

app.use(express.json({ limit: '25mb' }));

// --- JWT Auth Middleware (protects all write endpoints) ---
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
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

const SettingModel: any = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
const CadetModel: any = mongoose.models.Cadet || mongoose.model('Cadet', CadetSchema);

// --- High-Speed In-Memory Cache (Pre-Seeded with Canonical Defaults) ---
// Guarantees any connected device receives full data on first hit, even before DB connects!
let cachedSettings: Record<string, any> = { ...getDefaultSiteSettings(), ...CANONICAL_SETTINGS };
let cachedCadets: any[] = CANONICAL_CADETS.length > 0 ? [...CANONICAL_CADETS] : (INITIAL_CADET_USERS || []);
if (!cachedSettings['ngdc_cadet_users_v8'] || cachedSettings['ngdc_cadet_users_v8'].length === 0) {
  cachedSettings['ngdc_cadet_users_v8'] = cachedCadets;
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
export function broadcastRealtime(event: { type: string; payload?: any; version: number }) {
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
      const [docs, cadetDocs] = await Promise.all([
        SettingModel.find({}).lean(),
        CadetModel.find({}).lean(),
      ]);

      if (docs && docs.length > 0) {
        docs.forEach((doc: any) => {
          if (doc && doc.key) {
            cachedSettings[doc.key] = doc.value;
          }
        });
      }

      if (cadetDocs && cadetDocs.length > 0) {
        const list = cadetDocs.map((c: any) => {
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
        cachedCadets = list;
        cachedSettings['ngdc_cadet_users_v8'] = list;
      } else if (cachedSettings['ngdc_cadet_users_v8'] && Array.isArray(cachedSettings['ngdc_cadet_users_v8'])) {
        cachedCadets = cachedSettings['ngdc_cadet_users_v8'].filter((c: any) => {
          const id = String(c?.id || '').trim();
          return !id.startsWith('c-male-') && !id.startsWith('c-female-') && !id.startsWith('c-band-');
        });
        cachedSettings['ngdc_cadet_users_v8'] = cachedCadets;
      } else {
        cachedCadets = [];
        cachedSettings['ngdc_cadet_users_v8'] = [];
      }

      isCacheHydrated = true;
    } catch (err: any) {
      console.warn('[MongoDB Atlas] Hydration warning:', err?.message || err);
    } finally {
      hydrationPromise = null;
    }
  })();

  return hydrationPromise;
}

// Connect to MongoDB Atlas (reusing cached connection across serverless invocations)
async function initMongoConnection(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim() || DEFAULT_MONGODB_URI;
  if (!uri) {
    mongoLastError = 'MONGODB_URI not configured in environment';
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
app.post('/api/db/reconnect', async (_req, res) => {
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
app.get('/api/version', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    await initMongoConnection();
    if (mongoose.connection.readyState === 1) {
      const versionDoc = await SettingModel.findOne({ key: 'ngdc_sync_version' }).lean();
      if (versionDoc && versionDoc.value) {
        const v = Number(versionDoc.value);
        if (v > syncVersion) {
          syncVersion = v;
        }
      }
    }
  } catch {}

  res.json({ version: syncVersion, timestamp: Date.now(), clients: sseClients.size });
});

// 4. Authentication Endpoints (JWT)
app.post('/api/auth/login', async (req, res) => {
  const { pin } = req.body || {};
  let currentServicePin = cachedSettings['ngdc_admin_service_pin'] || '1721';

  try {
    await initMongoConnection();
    if (mongoose.connection.readyState === 1) {
      const pinDoc = await SettingModel.findOne({ key: 'ngdc_admin_service_pin' }).lean();
      if (pinDoc && pinDoc.value) {
        currentServicePin = pinDoc.value;
      }
    }
  } catch {}

  if (!pin || String(pin).trim() !== String(currentServicePin).trim()) {
    return res.status(401).json({ success: false, error: 'Invalid service PIN' });
  }

  const token = jwt.sign(
    { role: 'admin', service: 'ngdc_bncc_portal', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    success: true,
    token,
    role: 'admin',
    expiresIn: '30d',
    timestamp: Date.now(),
  });
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
app.get('/api/settings', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    await initMongoConnection();
    await hydrateCacheFromDb();
  } catch (err: any) {
    console.warn('[API /settings] MongoDB read notice:', err?.message || err);
  }

  res.json(cachedSettings);
});

app.post('/api/settings', requireAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Missing setting key' });
    }

    // 1. Update local cache
    cachedSettings[key] = value;
    syncVersion = Date.now();

    if (key === 'ngdc_cadet_users_v8' && Array.isArray(value)) {
      cachedCadets = [...value];
    }

    // 2. Real-time push (for any active clients in this worker)
    broadcastRealtime({
      type: 'SETTINGS_UPDATED',
      payload: { key, value },
      version: syncVersion,
    });

    // 3. Persist to MongoDB (awaiting ensures serverless doesn't terminate early)
    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        await SettingModel.findOneAndUpdate(
          { key },
          { key, value, updatedAt: new Date() },
          { upsert: true, new: true }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true }
        );

        if (key === 'ngdc_cadet_users_v8' && Array.isArray(value) && value.length > 0) {
          const cadetOps = value.map((c: any) => ({
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
app.post('/api/settings/bulk', requireAuth, async (req, res) => {
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
          { upsert: true }
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

    const cadetId = String(cadet.id || `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`).trim();
    const cleanCadet = {
      ...cadet,
      id: cadetId,
      status: cadet.status || 'Pending Approval',
      isApproved: false,
      createdAt: new Date(),
    };

    const existingIndex = cachedCadets.findIndex(
      (c) => String(c.id || '').trim() === cadetId || (cleanCadet.cadetNo && c.cadetNo === cleanCadet.cadetNo)
    );

    if (existingIndex >= 0) {
      cachedCadets[existingIndex] = { ...cachedCadets[existingIndex], ...cleanCadet };
    } else {
      cachedCadets.unshift(cleanCadet);
    }
    cachedSettings['ngdc_cadet_users_v8'] = [...cachedCadets];
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'CADETS_UPDATED',
      payload: cleanCadet,
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        const rawData = { ...cleanCadet };
        delete (rawData as any)._id;

        await CadetModel.findOneAndUpdate(
          { id: cadetId },
          { ...cleanCadet, rawData, updatedAt: new Date() },
          { upsert: true, new: true }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_users_v8' },
          { key: 'ngdc_cadet_users_v8', value: cachedCadets, updatedAt: new Date() },
          { upsert: true }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true }
        );
      }
    } catch (dbErr) {
      console.warn(`[MongoDB] Failed to persist applicant cadet ${cadetId}:`, dbErr);
    }

    res.json({ success: true, cadet: cleanCadet, message: 'Application submitted for Admin review', version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to submit registration' });
  }
});

// Admin wipe all cadets & mock data
app.post('/api/cadets/wipe-all', requireAuth, async (_req, res) => {
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
          { upsert: true }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true }
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

app.get('/api/cadets', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    await initMongoConnection();
    await hydrateCacheFromDb();
  } catch (err: any) {
    console.warn('[API /cadets] MongoDB read notice:', err?.message || err);
  }

  res.json(cachedCadets);
});

app.post('/api/cadets', requireAuth, async (req, res) => {
  try {
    const cadet = req.body;
    if (!cadet || (!cadet.id && !cadet.cadetNo)) {
      return res.status(400).json({ error: 'Invalid cadet data' });
    }

    const cadetId = String(cadet.id || `cadet_${cadet.cadetNo || Date.now()}`).trim();
    const cleanCadet = { ...cadet, id: cadetId };

    const existingIndex = cachedCadets.findIndex(
      (c) => String(c.id || '').trim() === cadetId || (cadet.cadetNo && c.cadetNo === cadet.cadetNo)
    );

    if (existingIndex >= 0) {
      cachedCadets[existingIndex] = { ...cachedCadets[existingIndex], ...cleanCadet };
    } else {
      cachedCadets.unshift(cleanCadet);
    }
    cachedSettings['ngdc_cadet_users_v8'] = [...cachedCadets];
    syncVersion = Date.now();

    broadcastRealtime({
      type: 'CADETS_UPDATED',
      payload: cleanCadet,
      version: syncVersion,
    });

    try {
      await initMongoConnection();
      if (mongoose.connection.readyState === 1) {
        const rawData = { ...cleanCadet };
        delete (rawData as any)._id;

        await CadetModel.findOneAndUpdate(
          { id: cadetId },
          { ...cleanCadet, rawData, updatedAt: new Date() },
          { upsert: true, new: true }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_cadet_users_v8' },
          { key: 'ngdc_cadet_users_v8', value: cachedCadets, updatedAt: new Date() },
          { upsert: true }
        );

        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true }
        );
      }
    } catch (dbErr) {
      console.warn(`[MongoDB] Failed to persist cadet ${cadetId}:`, dbErr);
    }

    res.json({ success: true, id: cadetId, version: syncVersion });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save cadet' });
  }
});

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
          { upsert: true }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true }
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
app.post('/api/cadets/bulk', requireAuth, async (req, res) => {
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
      payload: { count: cadets.length },
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
          { upsert: true }
        );
        await SettingModel.findOneAndUpdate(
          { key: 'ngdc_sync_version' },
          { key: 'ngdc_sync_version', value: syncVersion, updatedAt: new Date() },
          { upsert: true }
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
