# AcademiTrack — Student Progress Tracking System

A full-stack academic progress tracking platform for Bachelor's, Master's, and PhD students with AI-powered submission scoring.

---

## Features

**Student Portal** (`/`, `/login`, `/register`, `/app`)
- Register with full profile (name, reg number, phone, email, level, department)
- Submit Proposals, Results, Presentations, and Publications
- AI-powered automatic scoring on every submission
- Track progress through Department → School Faculty → Postgraduate Board
- Receive notifications from moderators
- Message moderators directly

**Admin Portal** (`/admin/login`, `/admin/dashboard`) — Completely separate, not linked from frontend
- Full student management (add, view, remove)
- Review, score, approve, reject, and advance submissions
- Send targeted or broadcast notifications
- Reply to student messages
- Manage moderator accounts (Super Admin only)
- System overview dashboard

---

## Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Railway)
- **Auth**: JWT (student + admin tokens are separate)
- **AI Scoring**: Claude API (Anthropic)

---

## Local Development

### Prerequisites
- Node.js >= 18
- PostgreSQL database (local or Railway)

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/academitrack.git
cd academitrack
npm run install:all
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env and fill in:
#   DATABASE_URL=postgresql://user:password@localhost:5432/academitrack
#   JWT_SECRET=your_random_secret_here
#   NODE_ENV=development
```

### 3. Set up database
Run the schema on your PostgreSQL instance:
```bash
psql $DATABASE_URL -f server/schema.sql
```
This creates all tables and a default Super Admin:
- Username: `superadmin`
- Password: `Admin@1234`
**Change this immediately after first login.**

### 4. Run locally
```bash
# Terminal 1 — Backend
npm run dev:server

# Terminal 2 — Frontend
npm run dev:client
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Deploy to Railway

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/academitrack.git
git push -u origin main
```

### Step 2 — Create Railway project
1. Go to https://railway.app and sign in
2. Click **New Project → Deploy from GitHub repo**
3. Select your `academitrack` repository

### Step 3 — Add PostgreSQL
1. In your Railway project, click **+ New → Database → Add PostgreSQL**
2. Railway will automatically add `DATABASE_URL` to your environment

### Step 4 — Set environment variables
In Railway → your service → **Variables**, add:
```
NODE_ENV=production
JWT_SECRET=<generate a long random string>
ALLOWED_ORIGINS=https://your-app.railway.app
```
Railway sets `PORT` automatically — do not add it manually.

### Step 5 — Run schema migration
In Railway → your PostgreSQL service → **Query** tab, paste and run the contents of `server/schema.sql`.

Or connect via psql:
```bash
psql "$(railway variables get DATABASE_URL)" -f server/schema.sql
```

### Step 6 — Deploy
Railway will auto-deploy on every push to `main`. The build command (`npm run install:all && npm run build`) and start command (`npm run start`) are defined in `railway.toml`.

### Step 7 — Access your app
- **Student portal**: `https://your-app.railway.app/`
- **Admin portal**: `https://your-app.railway.app/admin/login`
  - Default credentials: `superadmin` / `Admin@1234` ← **change immediately**

---

## Default Admin Credentials
```
Username: superadmin
Password: Admin@1234
```
**Change the password immediately.** Add a new Super Admin, then remove or update the default one.

---

## Project Structure
```
academitrack/
├── server/
│   ├── index.js          # Express app entry
│   ├── db.js             # PostgreSQL pool
│   ├── schema.sql        # Database schema + seed
│   ├── middleware/
│   │   └── auth.js       # JWT middleware (student + admin)
│   └── routes/
│       ├── auth.js       # Student auth (register, login, me)
│       ├── adminAuth.js  # Admin auth
│       ├── submissions.js
│       ├── notifications.js
│       ├── messages.js
│       └── admin.js      # Full admin CRUD
├── client/
│   ├── src/
│   │   ├── App.jsx       # Router
│   │   ├── index.css     # Global styles
│   │   ├── contexts/     # Auth + Admin context
│   │   ├── components/   # AppShell, Toast
│   │   ├── pages/        # Landing, Auth, AppPage, AdminLogin, AdminDashboard
│   │   └── utils/api.js  # Axios instance
│   └── vite.config.js
├── railway.toml
├── Procfile
└── package.json          # Root scripts
```

---

## API Endpoints

### Student Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login student |
| GET | `/api/auth/me` | Get current student |

### Student (requires student JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/submissions` | List / create submissions |
| GET | `/api/submissions/:id` | Single submission |
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/:id/read` | Mark read |
| GET/POST | `/api/messages` | List / send messages |

### Admin Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/auth/login` | Admin login |
| GET | `/api/admin/auth/me` | Current admin |

### Admin (requires admin JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/admin/students` | List / add students |
| DELETE | `/api/admin/students/:id` | Remove student |
| GET | `/api/admin/submissions` | All submissions |
| PATCH | `/api/admin/submissions/:id` | Approve/reject/advance |
| GET/POST | `/api/admin/notifications` | List / send notifications |
| GET | `/api/admin/messages` | All messages |
| POST | `/api/admin/messages/:id/reply` | Reply to message |
| GET/POST | `/api/admin/moderators` | List / add moderators |
| DELETE | `/api/admin/moderators/:id` | Remove moderator |
| GET | `/api/admin/stats` | Dashboard stats |
