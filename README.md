# UniPath AI

An explainable AI-powered university admission decision-support platform for students in Pakistan. Initial scope: Lahore.

## Stack

- **Frontend:** React 18 + Vite + Plain CSS (no Tailwind, no TypeScript)
- **Backend:** Python 3.11+ + FastAPI + Pydantic
- **AI:** Groq OpenAI-compatible endpoint (optional; deterministic fallback built in)

## Project Structure

```
.
├── frontend/        # Vite React app (src/, public/, vite.config.js)
├── backend/         # FastAPI app (app/, data/, requirements.txt)
├── README.md
└── .gitignore
```

## Prerequisites

- **Python** 3.11 or newer
- **Node.js** 18 or newer + **npm**
- (Optional) A Groq API key for the LLM counselor — the app still works without one.

## Quick Start

### 1. Backend

Open a PowerShell terminal in the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**. Swagger docs: http://localhost:8000/docs.

### 2. Frontend

Open a **second** PowerShell terminal in the project root:

```powershell
cd frontend
npm install
npm run dev
```

The app will open at **http://localhost:5173** (Vite will auto-pick the next free port if 5173 is in use, e.g. 5174). The dev server proxies all `/api/*` calls to `http://localhost:8000`, so both servers must be running together.

### 3. Environment Variables

Copy `.env.example` to `.env` in the relevant folder and fill in what you need:

```
# backend/.env
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
FRONTEND_ORIGIN=http://localhost:5173
```

Leave `GROQ_API_KEY` blank to use the deterministic counselor fallback.

## Production Build

To produce a static build of the frontend:

```powershell
cd frontend
npm run build
```

Output lands in `frontend/dist/`. The backend is unchanged — run it the same way as in development.

## Typical Workflow

1. Complete the multi-step **Profile** (Personal → Academic → Tests → Program → Budget → Review).
2. Click **Analyze My Options** on the Review step to generate recommendations.
3. Browse **Recommendations**, **Universities**, **Deadlines**, **Analytics**.
4. Pick up to 3 programs and open **Compare** for a side-by-side table.
5. Use the **AI Counselor** to ask questions grounded in verified university data and your calculated results.

## Tests & Manual Checks

- Backend API smoke tests (PowerShell):
  ```powershell
  Invoke-RestMethod http://localhost:8000/api/health
  ```
- Frontend build check: `npm run build` (must exit 0).

## Notes for Contributors

- **Do not commit** `backend/venv/`, `frontend/node_modules/`, or `frontend/dist/` — they are already in `.gitignore`.
- **Do commit** `backend/app/data/tests.json` and `frontend/src/config/tests.js` — they are the single source of truth for entry-test marks (ECAT = 400, NAT = 100, etc.).
- Keep `README.md`, `.gitignore`, and `frontend/public/unipath-icon.svg` in sync across contributors.

## License

Private / internal project. All rights reserved.
