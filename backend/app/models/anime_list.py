from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class AnimeList(Base):
    __tablename__ = "anime_lists"
    __table_args__ = (UniqueConstraint("user_id", "anilist_id", name="uq_user_anime"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    anilist_id = Column(Integer, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    title_japanese = Column(String(500), nullable=True)
    cover_image = Column(String(500), nullable=True)

    # status: watching | completed | plan_to_watch | dropped | on_hold
    status = Column(String(50), nullable=False, default="plan_to_watch")
    progress = Column(Integer, default=0)
    total_episodes = Column(Integer, nullable=True)

    # Metadata stored at add-time from AniList so stats never need external calls
    genres = Column(JSON, nullable=True)          # ["Action", "Drama", ...]
    avg_episode_duration = Column(Integer, nullable=True)  # minutes per episode

    # Ratings
    user_score = Column(Float, nullable=True)     # user's personal 0-10 score

    # Timestamps
    start_date   = Column(DateTime, nullable=True)
    finish_date  = Column(DateTime, nullable=True)
    last_watched = Column(DateTime, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="anime_lists")

    # ── Computed helpers ──────────────────────────────────────────────────────

    @property
    def watched_minutes(self) -> int:
        """Total minutes watched based on progress × episode duration."""
        dur = self.avg_episode_duration or 24  # fallback 24 min
        return self.progress * dur

    @property
    def completion_pct(self) -> float:
        if not self.total_episodes:
            return 0.0
        return round((self.progress / self.total_episodes) * 100, 1)
