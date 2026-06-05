"""
Personal ratings API — completely separate from AniList community scores.
Users can rate any anime 0-10 with an optional review.
These ratings drive statistics, recommendations, and the AI context.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.rating import Rating
from ..models.anime_list import AnimeList
from ..schemas.schemas import RatingCreate, RatingOut

router = APIRouter(prefix="/api/ratings", tags=["Ratings"])


@router.get("/", response_model=list[RatingOut])
async def get_my_ratings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Rating).where(Rating.user_id == current_user.id).order_by(Rating.score.desc())
    )
    return result.scalars().all()


@router.get("/{anilist_id}", response_model=Optional[RatingOut])
async def get_rating_for_anime(
    anilist_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Rating).where(Rating.user_id == current_user.id, Rating.anilist_id == anilist_id)
    )
    return result.scalar_one_or_none()


@router.post("/", response_model=RatingOut, status_code=201)
async def upsert_rating(
    data: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create or update a rating. Also syncs user_score on the list entry."""
    result = await db.execute(
        select(Rating).where(Rating.user_id == current_user.id, Rating.anilist_id == data.anilist_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.score = data.score
        if data.review is not None:
            existing.review = data.review
        rating = existing
    else:
        rating = Rating(user_id=current_user.id, **data.model_dump())
        db.add(rating)

    # Keep list entry user_score in sync
    list_result = await db.execute(
        select(AnimeList).where(AnimeList.user_id == current_user.id, AnimeList.anilist_id == data.anilist_id)
    )
    list_entry = list_result.scalar_one_or_none()
    if list_entry:
        list_entry.user_score = data.score

    await db.commit()
    await db.refresh(rating)
    return rating


@router.delete("/{anilist_id}", status_code=204)
async def delete_rating(
    anilist_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Rating).where(Rating.user_id == current_user.id, Rating.anilist_id == anilist_id)
    )
    rating = result.scalar_one_or_none()
    if not rating:
        raise HTTPException(404, "Rating not found")
    await db.delete(rating)
    await db.commit()
