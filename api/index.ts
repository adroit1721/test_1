import type { VercelRequest, VercelResponse } from '@vercel/node';
import app, { initMongoConnection } from '../server.js';

let isMongoInitStarted = false;
let mongoInitPromise: Promise<boolean> | null = null;

async function ensureMongoConnected() {
  if (!mongoInitPromise) {
    mongoInitPromise = initMongoConnection().catch((err) => {
      console.warn('[Vercel Serverless] MongoDB init error:', err?.message || err);
      return false;
    });
  }
  return mongoInitPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for Vercel Serverless Function invocations
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Admin-Auth, X-Officer-Id'
  );

  // Return HTTP 200 OK for OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure req.url starts with /api for Express router matching
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  // Ensure MongoDB is connected and in-memory cache is hydrated before responding
  try {
    await ensureMongoConnected();
  } catch (err) {
    console.warn('[Vercel Serverless] DB connection catch:', err);
  }

  return new Promise<void>((resolve, reject) => {
    res.on('finish', () => resolve());
    res.on('close', () => resolve());
    res.on('error', (err) => reject(err));

    try {
      app(req, res);
    } catch (err: any) {
      console.error('[Vercel Function Error]:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || 'Internal Server Error' });
      }
      resolve();
    }
  });
}

