from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str]
    bio: Optional[str]
    level: int
    created_at: datetime
    class Config: from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


# ── AnimeList ─────────────────────────────────────────────────────────────────

class AnimeListCreate(BaseModel):
    anilist_id: int
    title: str
    title_japanese: Optional[str] = None
    cover_image: Optional[str] = None
    status: str = "plan_to_watch"
    progress: int = 0
    total_episodes: Optional[int] = None
    genres: Optional[List[str]] = None
    avg_episode_duration: Optional[int] = None
    user_score: Optional[float] = None

class AnimeListUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    user_score: Optional[float] = Field(None, ge=0, le=10)
    start_date: Optional[datetime] = None
    finish_date: Optional[datetime] = None

class AnimeListOut(BaseModel):
    id: int
    anilist_id: int
    title: str
    title_japanese: Optional[str]
    cover_image: Optional[str]
    status: str
    progress: int
    total_episodes: Optional[int]
    genres: Optional[List[str]]
    avg_episode_duration: Optional[int]
    user_score: Optional[float]
    start_date: Optional[datetime]
    finish_date: Optional[datetime]
    last_watched: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config: from_attributes = True


# ── Rating ────────────────────────────────────────────────────────────────────

class RatingCreate(BaseModel):
    anilist_id: int
    score: float = Field(..., ge=0, le=10)
    review: Optional[str] = None

class RatingOut(BaseModel):
    id: int
    anilist_id: int
    score: float
    review: Optional[str]
    created_at: datetime
    class Config: from_attributes = True


# ── Stats ─────────────────────────────────────────────────────────────────────

class GenreBreakdown(BaseModel):
    genre: str
    count: int
    percentage: float

class MonthlyActivity(BaseModel):
    month: str       # "2024-03"
    episodes: int
    minutes: int

class ScoreBucket(BaseModel):
    range: str       # "1-2", "3-4", …
    count: int

class UserStats(BaseModel):
    # Counts
    watching: int
    completed: int
    plan_to_watch: int
    on_hold: int
    dropped: int
    total_anime: int

    # Episodes & time
    total_episodes_watched: int
    total_minutes_watched: int
    total_hours_watched: float

    # Scores (user ratings only)
    mean_score: Optional[float]
    score_distribution: List[ScoreBucket]

    # Genres derived from list
    top_genres: List[GenreBreakdown]

    # Activity
    monthly_activity: List[MonthlyActivity]

    # Streak (days since last watch activity)
    current_streak_days: int

    level: int


# ── Recommendations ───────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    conversation_history: Optional[List[Dict[str, str]]] = None   # [{role, content}, ...]

class RecommendResponse(BaseModel):
    response: str
    prompt: str
