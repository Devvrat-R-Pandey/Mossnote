# 📝 Mossnote

A full-stack, AI-powered note-taking app with role-based access control, markdown rendering, shareable read-only links, activity logging, and real-time search.

🌐 **Live Demo:** [mossnote.netlify.app](https://mossnote.netlify.app)

---

## 🏗️ Tech Stack

**Frontend** — React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · React Router v7 · Axios · React Hook Form · Marked.js

**Backend** — Node.js · Express 5 · TypeScript · MongoDB + Mongoose · JWT · bcryptjs · Upstash Redis · OpenRouter API (Mistral 7B)

---

## 📁 Project Structure

```
Mossnote/
├── frontend/
│   └── src/
│       ├── api/           # Axios instance with JWT + rate-limit interceptors
│       ├── components/    # auth/, forms/, layout/, notes/
│       ├── hooks/         # useDebounce
│       ├── pages/         # HomePage, Login, Register, ActivityLog, SharedNote, UserManagement
│       ├── services/      # API service functions (auth, notes, logs, ai, admin)
│       ├── store/         # Zustand stores (auth, notes, ui, logs, assistant)
│       └── utils/         # formatDate, validation
├── backend/
│   └── src/
│       ├── config/        # db.ts, upstash.ts
│       ├── controllers/   # auth, notes, logs, ai, admin
│       ├── middleware/     # authMiddleware, authorizeRoles, rateLimiter
│       ├── models/        # User, Note, Log (Mongoose)
│       └── routes/        # auth, notes, logs, ai, admin
├── netlify.toml           # Frontend deployment config
└── render.yaml            # Backend deployment config
```

---

## ✨ Features

| Feature               | Details                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| **Authentication**    | JWT-based login with 7-day token expiry                                                              |
| **Role-Based Access** | `admin` · `editor` enforced at API level                                                             |
| **Notes CRUD**        | Create, read, update, delete with ownership tracking                                                 |
| **AI Assistant**      | Summarize, improve writing, rephrase, auto-generate titles, custom prompts (OpenRouter + Mistral 7B) |
| **Markdown**          | Full rendering with edit/preview toggle                                                              |
| **Activity Log**      | Tracks CREATE / EDIT / DELETE / SHARE / ROLE_CHANGE                                                  |
| **Search**            | Debounced client-side search                                                                         |
| **Shareable Links**   | Public read-only URLs — no login required                                                            |
| **Rate Limiting**     | Upstash Redis sliding window (50 req / 60s)                                                          |
| **Dark/Light Mode**   | Persistent theme toggle with smooth transition                                                       |

---

## 🔐 Role Permissions

| Action                  | admin | editor |
| ----------------------- | ----- | ------ |
| View notes              | ✅    | ✅     |
| Create / Edit own notes | ✅    | ✅     |
| Edit others' notes      | ✅    | ❌     |
| Delete notes            | ✅    | ✅*    |
| View activity log       | ✅    | ❌     |
| Manage users            | ✅    | ❌     |
| Share notes             | ✅    | ✅     |
| Use AI Assistant        | ✅    | ✅     |
| Apply AI changes        | ✅    | ✅     |

*Editors can only delete their own notes.

---

## 🚀 Local Development

### Prerequisites

- Node.js 20+
- MongoDB Atlas (or local)
- [Upstash Redis](https://upstash.com/) account
- [OpenRouter](https://openrouter.ai/) API key

### Backend

```bash
cd backend && npm install
```

Create `backend/.env` (see `backend/.env.example`):

```env
MONGO_URI=
JWT_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
OPENROUTER_API_KEY=
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

```bash
npm run dev    # hot reload with ts-node-dev
npm run build  # compile TypeScript
npm start      # run compiled output
```

### Frontend

```bash
cd frontend && npm install
```

Create `frontend/.env` (see `frontend/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev    # Vite dev server on port 5173
npm run build  # production build
```

> Vite proxies `/api` → `http://localhost:5000` automatically during development.

---

## ☁️ Deployment

| Service     | Platform | Config          |
| ----------- | -------- | --------------- |
| **Backend** | Render   | `render.yaml`   |
| **Frontend**| Netlify  | `netlify.toml`  |

**Backend env vars** — same as `.env` above, set in Render dashboard.

**Frontend env var** — `VITE_API_BASE_URL=https://your-render-url.onrender.com/api`

---

## 📄 License

MIT
