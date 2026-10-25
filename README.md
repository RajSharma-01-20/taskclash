# ⚡ TaskClash Arena

TaskClash is a 1v1 productivity arena where people turn personal goals into head-to-head challenges. Create a challenge, let another player set a competing task, submit proof, and decide the outcome together.

**Live app:** [taskclash.vercel.app](https://taskclash.vercel.app/)

## How it works

1. Create an account and enter the Arena.
2. Post a challenge with a category, task, reward stake, and deadline.
3. Another player accepts and sets their own task for the duel.
4. Both players upload image or video proof when they finish.
5. In the review phase, the participants select the winner or record a tie. The selected winner receives the full reward; a tie splits it evenly.
6. Completed duels update player scores and the leaderboard.

Task categories include **Tech**, **Fitness**, **Study**, and **Gaming**. The app also includes a landing page, player profiles, and a leaderboard.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, React Router, and Tailwind CSS 4
- **Backend:** FastAPI and SQLAlchemy
- **Database:** SQLite by default; PostgreSQL can be configured with `DATABASE_URL`
- **Authentication:** JWT bearer tokens and bcrypt password hashing
- **Proof uploads:** Image and video files served by the backend
- **Hosting:** Vercel frontend and Render API

## Run locally

### Backend

Requires Python 3.10 or newer.

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment, then install and start the API:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`. Its health endpoint is `http://localhost:8000/`.

By default, the backend creates a local SQLite database at `backend/taskclash.db`. Set `DATABASE_URL` to use PostgreSQL. When hosting the API, set `BACKEND_BASE_URL` to its public base URL so uploaded proof links point to the deployed backend.

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local frontend URL, usually `http://localhost:5173`. The frontend defaults to the hosted TaskClash API. To use a different API, set `VITE_API_URL` in `frontend/.env` before starting or building the app:

```env
VITE_API_URL=http://localhost:8000
```

## Build the frontend

```bash
cd frontend
npm run build
```

## Repository layout

```text
taskclash/
├── backend/
│   ├── main.py             # FastAPI routes and duel/reward logic
│   ├── database.py         # SQLAlchemy engine and database session
│   ├── models.py           # User and clash database models
│   ├── schemas.py          # API request and response schemas
│   ├── security.py         # Password hashing and JWT helpers
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/     # Home, Arena, leaderboard, profile, and auth screens
    │   ├── App.tsx         # Navigation and routes
    │   └── apiConfig.ts    # Backend API base URL
    ├── vercel.json         # SPA route rewriting
    └── package.json
```