# ProblemLens Full-Stack Upgrade — Audit & Handoff

## Source audit
- Frontend: React 18 + Vite, React Router, Axios, Tailwind CSS, Framer Motion and lucide-react.
- Backend: Node.js ES modules, Express 5, Mongoose/MongoDB, JWT, bcryptjs, Helmet, CORS and express-rate-limit.
- Existing modules identified: authentication, dashboard, projects, evidence, problems, AI analysis, reports, users/profile, settings and generic resource routes.
- Settings already has a React settings page with general, notification, appearance and security tabs; local preference caching; server sync; theme application; save/discard state; and a password-change flow. The backend has authenticated GET/PUT settings endpoints and stores allow-listed preference fields under the user's `preferences`.
- Existing API client normalizes the `/api` suffix and attaches a bearer token. Backend mounts settings under `/api/settings` and has a health endpoint.

## High-priority risks / limitations found from static inspection
1. The backend archive contains a real `.env` file. It is deliberately excluded from the deliverable ZIP. Keep it local and rotate any credentials if that file has ever been committed or shared.
2. CORS includes a development-only localhost-any-port allowance; ensure production `CLIENT_URL` is configured to exact trusted origins.
3. The settings preference schema is stored as `Mixed`; controller-level allow-listing is therefore important and should be kept in place.
4. The user model stores preferences but is otherwise compact; schema-level typing/migrations should be planned carefully to avoid breaking existing records.
5. Dependencies are not installed in this execution environment. No production build, live database integration, browser/responsive test, or authenticated CRUD integration test can honestly be marked as passed.
6. The available upload is a code snapshot; external AI service URL, MongoDB access, email service (if any), and hosting credentials cannot be verified offline.

## Preserve
- Existing React/Vite and Express/Mongoose architecture.
- Existing route prefixes and API client contract.
- Existing authentication middleware and JWT flow.
- Existing ProblemLens domain modules and database collections.
- Existing settings endpoint contracts: `GET /api/settings`, `PUT /api/settings`, `PUT /api/settings/notifications`, `PUT /api/settings/appearance`.

## Recommended verification sequence
1. Copy `.env.example` to `.env` locally and supply fresh, private values. Never commit `.env`.
2. Run `npm ci` in each project directory.
3. Backend: `npm start` (after MongoDB and required env vars are configured); verify `GET /health`.
4. Frontend: `npm run build`, then `npm run dev`; configure `VITE_API_URL` to the backend origin (with or without `/api`, supported by the API normalizer).
5. Sign in and verify settings GET/PUT persists across refresh; verify password update with valid and invalid current passwords.
6. Test every existing page and CRUD action with real records and role/ownership restrictions.
7. Test desktop/tablet/mobile, reduced motion, keyboard focus, empty/error/loading states and browser console.
8. Before deployment, verify production CORS, rate limits, secret management, database backups and restore procedure.

## Authorization matrix (baseline to verify against route middleware)
| Capability | Anonymous | VIEWER | RESEARCHER | ADMIN |
|---|---:|---:|---:|---:|
| Sign in / public auth flows | Yes | Yes | Yes | Yes |
| Read/update own settings | No | Yes | Yes | Yes |
| Change own password | No | Yes | Yes | Yes |
| Read or mutate domain records | No | Must follow actual route policy | Must follow actual route policy | Must follow actual route policy |
| Manage users / administrative actions | No | No by default | No by default | Only if explicitly enforced by backend |

This is a baseline review matrix, not proof that all route permissions are implemented. Verify each route's middleware before production.

## Readiness status
**Not yet production-verified.** Static inspection only. No tests are represented as passing unless run in the target environment. Required blockers are dependency installation, environment configuration, database access, build/test execution, and route-by-route authorization testing.
