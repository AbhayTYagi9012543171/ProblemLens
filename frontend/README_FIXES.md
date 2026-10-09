# ProblemLens full-stack source (corrected)

This bundle contains the frontend, Express backend, and FastAPI AI service with the targeted fixes applied.

## Folder structure
- `frontend/` — React + Vite frontend
- `backend/` — Express + MongoDB API
- `ai-service/` — FastAPI analysis service

## Local startup
Run MongoDB first, then open three terminals.

### 1. AI service
```bash
cd ai-service
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env  # Windows; on macOS/Linux use: cp .env.example .env
python -m app.main
```
AI health endpoint: `http://127.0.0.1:8001/health`.

### 2. Backend
```bash
cd backend
npm install
copy .env.example .env  # Windows; on macOS/Linux use: cp .env.example .env
npm run dev
```
Confirm `AI_SERVICE_URL=http://127.0.0.1:8001` in `backend/.env`. For production, replace `JWT_SECRET` with a unique random value of at least 32 characters. Never commit the real `.env`.

### 3. Frontend
```bash
cd frontend
npm install
# Confirm VITE_API_URL=http://localhost:5000/api in .env if needed
npm run dev
```
Vite defaults to `http://localhost:5173`; the backend example config uses that origin.

## Fixes included
- Standardized the backend's default AI URL to port 8001, matching the AI service configuration.
- Removed duplicate AI URL configuration from backend `.env.example`.
- Added production JWT secret validation.
- Removed frontend logs that could expose auth responses, credentials, or password reset data.
- Made AI health checks time out and avoid exposing internal service URLs and raw exceptions.
- Prevented project controller 500 responses from returning raw exception messages.
- Added favicon SVG and ICO assets and referenced them in `index.html`.
- Implemented type-specific AI analysis results for SUMMARY, KEYWORDS, SENTIMENT, CLUSTERS, PATTERNS, and FULL.
- Excluded virtual environments, Python caches, and stale build output from the source archives.

## Notes
- The example environment files are templates. Copy them to `.env` locally and update values for your machine.
- `GET /api/ai/health` is protected by the backend's existing authentication middleware; test it with a valid login session or authorized bearer token.
- Run the full app against your own MongoDB and exercise registration, login, projects, evidence, AI analysis, reports, and settings before deployment.
