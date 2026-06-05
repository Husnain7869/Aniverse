from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, String, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Rating(Base):
    """User's personal score for an anime — separate from AniList community score."""
    __tablename__ = "ratings"
    __table_args__ = (UniqueConstraint("user_id", "anilist_id", name="uq_user_rating"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    anilist_id = Column(Integer, nullable=False, index=True)
    score = Column(Float, nullable=False)          # 0–10
    review = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ratings")


class WatchActivity(Base):
    """One row per progress-update event; drives monthly activity charts."""
    __tablename__ = "watch_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    anilist_id = Column(Integer, nullable=False)
    episodes_delta = Column(Integer, nullable=False, default=1)  # how many eps were watched this event
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="watch_activity")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge = Column(String(100), nullable=False)
    title = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    icon = Column(String(10), nullable=True)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendation_history")
