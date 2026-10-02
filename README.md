# ⚡ TaskClash Arena

> A high-energy, full-stack 1v1 productivity duel platform designed to turn task execution into competitive accountability games. Drop tasks, stake rewards, upload real-time proofs, and judge opponents through a decentralized peer-verification consensus engine.

---

## 🚀 Tech Stack

### Frontend
* **Framework:** React 18 with TypeScript & Vite
* **Routing:** React Router v6
* **Styling:** Tailwind CSS (Chirpley-inspired kinetic kinetic UI design)

### Backend
* **Framework:** FastAPI (Python 3.10+)
* **Database & ORM:** SQLite / PostgreSQL via SQLAlchemy
* **Authentication:** JSON Web Tokens (JWT), OAuth2 Password Bearer, bcrypt password hashing
* **Storage:** Local static file serving for multipart media proof uploads (images/videos)

---

## 🛠️ Core Features & Architecture

1. **Secure Authentication & Session Management:** Stateless JWT-based authentication with encrypted password storage.
2. **Dynamic 1v1 Arena Feed:** Users can browse public open challenges, filter by category (*Tech, Fitness, Study, Gaming*), and lock in competing tasks.
3. **Multi-Format Proof Pipeline:** Secure multipart file upload supporting image and video proof submissions (`multipart/form-data`).
4. **Dual-Verification Judge System:** 
   * When both users submit proofs, the duel transitions to the `review` phase.
   * Participants independently cast an `approve` or `reject` verdict.
   * Automated point distribution triggers upon consensus (`+50 PTS` to both winner profiles), updating the global leaderboard instantly.

---

## 📂 Project Structure

```text
taskclash/
├── backend/
│   ├── database.py       # SQLAlchemy engine & session setup
│   ├── main.py           # FastAPI entry point & API route handlers
│   ├── models.py         # Database ORM models (User, Clash)
│   ├── schemas.py        # Pydantic data validation schemas
│   ├── security.py       # JWT creation and password hashing utilities
│   └── uploads/          # Local media storage directory for proof files
└── frontend/
    ├── src/
    │   ├── components/   # Modular UI views (Arena, Leaderboard, Profile, Auth)
    │   ├── App.tsx       # Root component & protected routing setup
    │   ├── main.tsx      # React DOM mounting
    │   └── index.css     # Tailwind CSS base styles
    └── package.json      # Frontend dependencies
