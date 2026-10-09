# ProblemLens Settings Upgrade

## Frontend
- `src/pages/settings/Settings.jsx` retains the existing live settings state, API sync, dirty-state tracking, theme application, password-change flow, and notifications.
- `src/pages/settings/Settings.css` adds responsive polish, focus states, reduced-motion support, mobile dialog handling, and subtle transitions.
- Existing Tailwind utilities and `src/services/api.js` are retained for compatibility.

## Backend
- Settings endpoints remain authenticated through `protect`.
- Preferences are allow-listed and validated by the settings controller before persistence.
- Existing `GET /api/settings`, `PUT /api/settings`, `PUT /api/settings/notifications`, and `PUT /api/settings/appearance` endpoints are retained.

## Run
1. Extract frontend and backend into their existing project folders.
2. Run `npm install` in each folder if dependencies are not installed.
3. Configure the backend `.env` and frontend `.env` using each project's `.env.example`.
4. Start backend with `npm run dev`; start frontend with `npm run dev`.

Note: password changes use the existing `/api/auth/change-password` endpoint. Verify that route is implemented and checks the current password on the server before deploying.
