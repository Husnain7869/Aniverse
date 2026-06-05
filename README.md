# 🌸 AniVerse — AI-Powered Anime Tracking Platform

> Track Your Anime Journey

A full-stack anime tracking platform with AI-powered recommendations, built with React + FastAPI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

---

### 1. Database Setup
```sql
CREATE DATABASE aniverse;
CREATE USER aniverse_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE aniverse TO aniverse_user;
```

---

### 2. Backend Setup
```bash
cd backend

# Copy env file
cp .env.example .env
# Edit .env with your DB credentials and OpenAI key

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server (tables auto-create on startup)
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🗂 Project Structure

```
aniverse/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI routers
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── anime.py
│   │   │   ├── lists.py
│   │   │   ├── stats.py
│   │   │   └── recommendations.py
│   │   ├── core/           # Config, DB, Security
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/            # API service functions
    │   ├── components/     # Reusable components
    │   ├── pages/          # Page components
    │   ├── store/          # Zustand state
    │   └── App.jsx
    └── package.json
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login (returns JWT) |
| GET | /api/users/me | Current user |
| PATCH | /api/users/me | Update profile |
| GET | /api/anime/trending | Trending anime |
| GET | /api/anime/search?q= | Search |
| GET | /api/anime/{id} | Anime details |
| GET | /api/lists/ | Get watchlist |
| POST | /api/lists/ | Add to list |
| PATCH | /api/lists/{id} | Update entry |
| DELETE | /api/lists/{id} | Remove entry |
| GET | /api/stats/ | User statistics |
| POST | /api/recommendations/ | AI recommendation |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub, connect in Vercel
# Set env: VITE_API_URL=https://your-backend.railway.app
```

### Backend → Railway
- Connect GitHub repo
- Set root directory to `backend`
- Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add environment variables from `.env.example`

---

## 🔑 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/aniverse
SECRET_KEY=your-long-random-secret-key
OPENAI_API_KEY=sk-your-openai-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

---

## ✨ Features

- 🔐 JWT Authentication
- 📋 Full Watchlist Management (Watching/Completed/Plan/On Hold/Dropped)
- 🤖 AI Recommendations powered by OpenAI GPT-4o-mini
- 📊 Detailed Statistics & Charts
- 🔍 Anime Search & Discovery via AniList GraphQL
- 🏆 Achievement System
- 🎨 Dark anime-inspired UI with glassmorphism
- 📱 Fully Responsive
