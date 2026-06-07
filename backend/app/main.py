from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text

from .core.database import engine, Base
from .api import auth, users, anime, lists, stats, recommendations, ratings
from .models import User, AnimeList, Rating, WatchActivity, Achievement, RecommendationHistory  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Auto-migrate: add new columns if they don't exist
        await conn.execute(text("ALTER TABLE anime_lists ADD COLUMN IF NOT EXISTS genres JSONB"))
        await conn.execute(text("ALTER TABLE anime_lists ADD COLUMN IF NOT EXISTS avg_episode_duration INTEGER"))
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS watch_activity (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                anilist_id INTEGER NOT NULL,
                episodes_delta INTEGER NOT NULL DEFAULT 1,
                recorded_at TIMESTAMP DEFAULT NOW()
            )
        """))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_wa_user ON watch_activity(user_id)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_wa_time ON watch_activity(recorded_at)"))
    yield


app = FastAPI(
    title="Shiori API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(anime.router)
app.include_router(lists.router)
app.include_router(stats.router)
app.include_router(recommendations.router)
app.include_router(ratings.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "Shiori API", "version": "2.0.0"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
