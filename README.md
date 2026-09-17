# NGDC-BNCC Platoon Portal (Full-Stack Deployment Guide)

Official portal of the Bangladesh National Cadet Corps (BNCC) at New Govt. Degree College, Rajshahi.

## 🚀 Architecture: Render (Backend) + Cloudflare Pages (Frontend)

This setup provides high performance and reliability:
- **Backend on Render**: Persistent Node.js Express server with 0ms real-time WebSockets (`/ws`), SSE fallback (`/api/events`), and MongoDB Atlas connection.
- **Frontend on Cloudflare Pages**: High-speed CDN edge delivery with zero downtime and automatic SSL.
- **Database on MongoDB Atlas (Cluster0)**: All cadet data, settings, and forms remain permanently stored in the cloud with zero data loss.

---

### Step 1: Deploy Backend to Render (Web Service)
1. In your [Render Dashboard](https://dashboard.render.com/), click **New > Web Service** and select your GitHub repository.
2. Configure the service:
   - **Name**: `ngdc-bncc-backend` (or your choice)
   - **Environment**: `Node`
   - **Region**: `Singapore` or `Oregon` (closest to your users)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add the following **Environment Variables** in Render:
   ```env
   MONGODB_URI="mongodb+srv://bnccngdc123_db_user:NgdcBNCC1979@cluster0.ipvixds.mongodb.net/?appName=Cluster0"
   JWT_SECRET="ngdc_bncc_portal_stable_jwt_secret_key_1979_production"
   ADMIN_OFFICER_ID="ngdc_bncc_1979"
   ADMIN_MASTER_PASSWORD="Ngdc$BNCC$1979"
   NODE_ENV="production"
   ```
4. Click **Create Web Service**. Render will give you a public URL (e.g. `https://ngdc-bncc-backend.onrender.com`).

---

### Step 2: Deploy Frontend to Cloudflare Pages
1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages > Create application > Pages > Connect to Git**.
2. Select your repository.
3. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
4. Under **Settings > Environment variables**, add:
   ```env
   VITE_BACKEND_URL="https://ngdc-bncc-backend.onrender.com"
   ```
   *(Replace with your actual Render service URL)*
5. Click **Save and Deploy**. Cloudflare will build and publish your frontend with automatic global CDN caching!

---

### Step 3: Whitelist Render in MongoDB Atlas
1. Open [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Go to **Network Access** > **IP Access List**.
3. Ensure **`0.0.0.0/0` (Allow Access from Anywhere)** is enabled so Render can connect to your database cluster.

---

## 🛡️ Zero Data Loss Safeguards
1. **Cloud Database (MongoDB Atlas Cluster0)**: All cadet rosters, admission forms, notice blogs, and site content are stored in MongoDB Atlas and never lost during frontend migration.
2. **Canonical Pre-Seeded Fallback**: In `src/data/canonicalProductionData.ts`, full baseline production data is embedded so the app renders immediately with 100% fidelity even before the first DB handshake.
3. **Admin 1-Click JSON Backup**: Inside the Admin Console (*Database & Cloud Settings Modal > Render / Cloudflare DevOps*), you can download a full JSON backup of all site records with 1 click.


