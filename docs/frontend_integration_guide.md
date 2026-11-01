# Frontend Integration & Mock-to-Live Backend Guide

This guide covers running the React frontend (`frontend/`) in Mock Mode or against the live
Django API, the seeded evaluation accounts, every implemented route, and the Week 4 CI /
Week 5 production packaging flow.

---

## 1. Mock Mode vs. Live Django Backend Mode

The frontend switches data sources entirely through Vite environment variables read at build
time. Copy `frontend/.env.example` to `frontend/.env` and edit the two values:

```bash
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK=true
```

| Mode | `VITE_USE_MOCK` | `VITE_API_URL` | Data source |
| --- | --- | --- | --- |
| Mock Mode | `true` | unused (any value) | In-browser `src/api/mockServer.js` |
| Live Django Mode | `false` | `http://localhost:8000/api` | Django REST API + `/media/` files |

### Mock Mode (no backend required)

```bash
cd frontend
# .env
# VITE_USE_MOCK=true
npm install
npm run dev
```

Open the printed Vite URL (default `http://localhost:5173`). The mock server seeds clubs,
memberships, and the five evaluation accounts, and returns `blob:` logo URLs so the UI works
offline.

### Live Django Backend Mode

1. Start Django on port 8000 (from `backend/`):

   ```bash
   python manage.py migrate
   python manage.py seed_demo_data   # or the project's seed command
   python manage.py runserver 0.0.0.0:8000
   ```

2. Point the frontend at it and disable mocks:

   ```bash
   cd frontend
   # .env
   # VITE_API_URL=http://localhost:8000/api
   # VITE_USE_MOCK=false
   npm run dev
   ```

3. Ensure Django serves media in development (`MEDIA_URL = '/media/'` plus the usual
   `static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)` URL pattern) and that
   `django-cors-headers` allows `http://localhost:5173`.

### Docker Compose (full stack)

From the repository root, one command boots PostgreSQL, Django, and the Vite frontend together:

```bash
docker compose up --build
```

This starts:

- `db` — PostgreSQL 16;
- `backend` — Django API at `http://localhost:8000/api`;
- `frontend` — Vite dev server at `http://localhost:5173`, built with
  `VITE_USE_MOCK=false` and `VITE_API_URL=http://localhost:8000/api`.

### Logo URL normalization

Django may return a club logo as an absolute URL (`http://localhost:8000/media/...`), a
root-relative path (`/media/...`), or the mock server may return `blob:`/`data:` URLs.
`resolveLogoUrl()` in `frontend/src/components/ClubVisualPlate.jsx` normalizes all of them:

- absolute / `blob:` / `data:` URLs pass through unchanged;
- relative paths are joined to the origin derived from `VITE_API_URL` (the trailing `/api`
  segment is stripped).

This makes the same component work in Mock Mode, local Docker Compose
(`http://localhost:8000/media/...`), and production Nginx (`/media/...`).

### Production build against the live API

```bash
cd frontend
VITE_USE_MOCK=false VITE_API_URL=http://localhost:8000/api npm run build
```

---

## 2. Seeded Evaluation Accounts

All five accounts share the password **`Pass1234!`**. The Login page also exposes one-click
buttons that fill these credentials automatically.

| # | Label | Email | Role | Seeded state |
| --- | --- | --- | --- | --- |
| 1 | Student One | `student1@university.edu` | Student | Approved in Robotics, Pending in Debate |
| 2 | Student Two | `student2@university.edu` | Student | Pending in Robotics |
| 3 | Robotics Manager | `manager.robotics@university.edu` | Club Manager | Assigned to Robotics & Photography |
| 4 | Debate Manager | `manager.debate@university.edu` | Club Manager | Assigned to Debate Society |
| 5 | System Admin | `admin@university.edu` | Administrator | Full registry control |

Password for every seeded account: **`Pass1234!`**

---

## 3. Implemented Routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Almanac / home | Public |
| `/clubs` | Club Directory (search + discipline filters) | Public |
| `/clubs/:slug` | Club Profile / dossier + join flow | Public |
| `/login` | University Sign In | Public |
| `/register` | Student Registration | Public |
| `/dashboard/student` | Student Memberships Desk | `STUDENT` |
| `/dashboard/manager` | Club Manager Desk | `CLUB_MANAGER`, `ADMIN` |
| `/dashboard/admin` | University Admin Desk | `ADMIN` |
| `*` (anything else) | Designed 404 — "Page Not in Registry." | Public |

Protected routes redirect unauthenticated visitors to `/login?next=<path>`; authenticated
users who lack the required role are sent back to their own dashboard.

---

## 4. Week 4 GitHub Actions CI

The CI job runs inside `frontend/` and must pass both checks before a PR can merge:

```bash
cd frontend
npm ci
npm run lint     # ESLint 9 flat config: eslint.config.js
npm run build    # Vite production bundle -> dist/
```

- **Lint** uses `frontend/eslint.config.js` (ESLint 9 flat config) with `@eslint/js`,
  `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
  `dist/` and `node_modules/` are ignored. The config allows unused `React` imports
  (`varsIgnorePattern: '^React$'`) and `_`-prefixed arguments, so CI expects **zero errors**.
- **Build** must produce `frontend/dist/` with no warnings that fail the job.

Run the exact same commands locally before pushing.

---

## 5. Week 5 Production Docker Packaging

Two files under `frontend/` produce the production image:

- `frontend/Dockerfile.prod` — multi-stage build:
  1. `node:20-alpine` runs `npm ci` and `npm run build`, with build args
     `VITE_API_URL` (default `/api`) and `VITE_USE_MOCK` (default `false`).
  2. `nginx:1.27-alpine` serves the compiled `dist/` on port 80.
- `frontend/nginx.spa.conf` — Nginx server block with:
  - React Router SPA fallback (`try_files $uri $uri/ /index.html`);
  - `/static/` and `/media/` aliases for Django shared volumes;
  - Helmet-equivalent security headers: `X-Content-Type-Options`, `X-Frame-Options`,
    `Referrer-Policy`, `Cross-Origin-Opener-Policy`, and a Content-Security-Policy that
    permits Google Fonts and the local Django API.

Build and run locally:

```bash
cd frontend
docker build -f Dockerfile.prod \
  --build-arg VITE_API_URL=http://localhost:8000/api \
  --build-arg VITE_USE_MOCK=false \
  -t thejuclubhouse-frontend:prod .

docker run --rm -p 8080:80 thejuclubhouse-frontend:prod
```

Then open `http://localhost:8080`. Deep links such as `/clubs/robotics-society` and
`/non-existent-route` are served `index.html` by the SPA fallback.

When mounting Django static/media volumes (e.g. from `docker-compose.prod.yml`), mount them at
`/var/www/static/` and `/var/www/media/` so the Nginx aliases resolve.

---

## 6. Motion & Accessibility Notes

- `frontend/src/index.css` adds a transform/opacity-only entrance animation
  (`tasteRiseIn`) for `main > section` and a 1px press offset for active controls.
- `@media (prefers-reduced-motion: reduce)` disables all of it and forces full opacity, so
  content is never hidden when animations are unavailable or scripts fail.
- The 404 page keeps its headline to at most two lines at 1440 px, 768 px, and 390 px and
  offers flat buttons back to `/` (Almanac) and `/clubs` (Club Directory).
