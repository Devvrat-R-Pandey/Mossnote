# 📝 Notebloom

A full-stack note-taking application with role-based access control, shareable read-only links, activity logging, and real-time search.

**Live Demo:**
- Frontend: [Netlify URL] ← replace after deploy
- Backend API: [Render URL] ← replace after deploy

---

## 🏗️ Architecture

```
Notebloom/
├── frontend/          # React + Vite + TypeScript + TailwindCSS + DaisyUI
└── backend/           # Node.js + Express + TypeScript + MongoDB + JWT
```

---

## 📁 Project Structure

```
frontend/src/
├── api/            # Axios instance with interceptors
├── components/
│   ├── auth/       # ProtectedRoute
│   ├── forms/      # LoginForm, RegisterForm
│   ├── layout/     # Navbar, RateLimitCard
│   └── notes/      # NoteCard, NoteModal
├── pages/          # HomePage, LoginPage, RegisterPage, ActivityLogPage, SharedNotePage
├── store/          # Zustand stores (authStore, notesStore, uiStore, logStore)
├── services/       # API service functions
└── utils/          # formatDate, validation

backend/src/
├── config/         # db.ts, upstash.ts
├── controllers/    # authController, notesController, logsController
├── middleware/     # authMiddleware, authorizeRoles, rateLimiter
├── models/         # User, Note, Log (Mongoose + TypeScript interfaces)
└── routes/         # authRoutes, notesRoutes, logsRoutes
```



## ✨ Features

| Feature | Details |
|---------|---------|
| **Authentication** | JWT-based register/login with 7-day token expiry |
| **Role-Based Access** | `admin` · `editor` · `viewer` enforced at API level |
| **Notes CRUD** | Create, read, update, delete with ownership tracking |
| **Ownership Security** | Editors can only modify their own notes; admins have full access |
| **Activity Log** | Tracks CREATE / EDIT / DELETE / SHARE with timestamp and user |
| **Search** | Debounced client-side search by title and content |
| **Shareable Links** | Public read-only URLs via UUID `sharedId` — no login required |
| **Rate Limiting** | Upstash Redis sliding window (50 req / 60s) with custom UI overlay |
| **Dark/Light Mode** | Persistent theme toggle with gradient-aware design |
| **Responsive Design** | Mobile-first with drawer sidebar navigation |

---

## 🗄️ Database Schema

### User
```ts
{
  name:      string   // required
  email:     string   // unique, lowercase
  password:  string   // bcrypt hashed, min 8 chars
  role:      "admin" | "editor" | "viewer"  // default: viewer
  createdAt: Date
  updatedAt: Date
}
```

### Note
```ts
{
  title:     string         // required
  content:   string         // required
  owner:     string         // email of creator (from JWT, never from body)
  sharedId:  string | null  // UUID for public share links
  createdAt: Date
  updatedAt: Date
}
```

### Log
```ts
{
  action:    "CREATE" | "EDIT" | "DELETE" | "SHARE"
  user:      string   // email
  noteId:    string
  noteTitle: string?
  timestamp: string   // ISO string
}
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

### Notes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notes` | Any authenticated | Get all notes |
| GET | `/api/notes/:id` | Any authenticated | Get note by ID |
| GET | `/api/notes/shared/:sharedId` | Public | Get shared note (read-only) |
| POST | `/api/notes` | admin, editor | Create note |
| PUT | `/api/notes/:id` | admin, editor (own only) | Update note |
| DELETE | `/api/notes/:id` | admin only | Delete note |

### Logs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/logs` | admin only | Get all activity logs |
| POST | `/api/logs` | Any authenticated | Create a log entry |
| DELETE | `/api/logs/:id` | admin only | Delete a log entry |

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Upstash Redis account

### Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/notebloom
JWT_SECRET=your_super_secret_key_here
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
PORT=3000
```

```bash
npm run dev     # Start with tsx watch (TypeScript, hot reload)
npm run build   # Compile to dist/
npm start       # Run compiled output
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

For local dev, the Vite proxy forwards `/api` → `http://localhost:3000` automatically (no env var needed).

---

## ☁️ Deployment

### Backend → Render

1. Push repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables in Render dashboard:
   ```
   MONGO_URI
   JWT_SECRET
   UPSTASH_REDIS_REST_URL
   UPSTASH_REDIS_REST_TOKEN
   ```
5. Copy your Render service URL (e.g. `https://notebloom-api.onrender.com`)

> A `render.yaml` blueprint is included at the project root for one-click deploy.

### Frontend → Netlify

1. Connect the GitHub repo on [netlify.com](https://netlify.com)
2. Netlify auto-detects settings from `netlify.toml`:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
3. Add environment variable in Netlify dashboard:
   ```
   VITE_API_URL = https://notebloom-api.onrender.com/api
   ```
4. Deploy — SPA routing is handled by `netlify.toml` redirects.

> A `netlify.toml` is included at the project root.

---

## 🔐 Role Permissions Matrix

| Action | admin | editor | viewer |
|--------|-------|--------|--------|
| View notes | ✅ | ✅ | ✅ |
| Create notes | ✅ | ✅ | ❌ |
| Edit own notes | ✅ | ✅ | ❌ |
| Edit others' notes | ✅ | ❌ | ❌ |
| Delete notes | ✅ | ❌ | ❌ |
| View activity log | ✅ | ❌ | ❌ |
| Share notes | ✅ | ✅ | ✅ |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS v4** + **DaisyUI v5**
- **Zustand** — state management
- **React Router v7** — routing
- **React Hook Form** — form validation
- **Axios** — HTTP client with interceptors
- **React Hot Toast** — notifications
- **Lucide React** — icons

### Backend
- **Node.js** + **Express 5** + **TypeScript**
- **MongoDB** + **Mongoose 9**
- **JWT** — authentication
- **bcryptjs** — password hashing
- **Upstash Redis** + **@upstash/ratelimit** — rate limiting
- **tsx** — TypeScript dev runner
- **dotenv** — environment config

---
