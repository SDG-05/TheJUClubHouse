# TheJUClubHouse — University Club Directory & Membership Platform

A monorepo housing the full stack for the university club directory and membership platform.

## Monorepo layout

| Directory | Purpose |
| --- | --- |
| `backend/` | Django + DRF API server (club directory, membership, authentication). |
| `frontend/` | Vite + React + Tailwind CSS single-page application. |
| `postman/` | Postman collections for exercising and documenting the API. |
| `docs/` | Architecture notes, API contracts, and phase documentation. |

## Branching model

- `main` — stable, deployable code.
- `develop` — integration branch for completed feature work.
- `feature/*` — short-lived branches per phase or task (e.g. `feature/frontend-setup-and-docs`).

## Getting started (frontend)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

## Backend

Backend scaffolding is introduced in a later phase.
