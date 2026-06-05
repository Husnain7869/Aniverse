from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.anime_list import AnimeList
from ..models.rating import WatchActivity
from ..schemas.schemas import AnimeListCreate, AnimeListUpdate, AnimeListOut
from ..services.achievement_service import check_and_award_achievements

router = APIRouter(prefix="/api/lists", tags=["Watchlist"])


@router.get("/", response_model=list[AnimeListOut])
async def get_list(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(AnimeList).where(AnimeList.user_id == current_user.id)
    if status:
        q = q.where(AnimeList.status == status)
    q = q.order_by(AnimeList.updated_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/", response_model=AnimeListOut, status_code=201)
async def add_to_list(
    data: AnimeListCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(AnimeList).where(AnimeList.user_id == current_user.id, AnimeList.anilist_id == data.anilist_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Anime already in your list")

    entry = AnimeList(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    # Log initial activity if already has progress
    if entry.progress > 0:
        act = WatchActivity(user_id=current_user.id, anilist_id=entry.anilist_id, episodes_delta=entry.progress)
        db.add(act)
        await db.commit()

    await check_and_award_achievements(current_user.id, db)
    return entry


@router.patch("/{entry_id}", response_model=AnimeListOut)
async def update_entry(
    entry_id: int,
    data: AnimeListUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AnimeList).where(AnimeList.id == entry_id, AnimeList.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(404, "Entry not found")

    old_progress = entry.progress

    for key, val in data.model_dump(exclude_none=True).items():
        setattr(entry, key, val)

    # Auto-set timestamps
    if data.status == "watching" and not entry.start_date:
        entry.start_date = datetime.utcnow()
    if data.status == "completed":
        entry.finish_date = datetime.utcnow()
        if entry.total_episodes:
            entry.progress = entry.total_episodes

    # Record watch activity for episode progress changes
    new_progress = entry.progress
    if data.progress is not None and new_progress > old_progress:
        delta = new_progress - old_progress
        entry.last_watched = datetime.utcnow()
        act = WatchActivity(
            user_id=current_user.id,
            anilist_id=entry.anilist_id,
            episodes_delta=delta,
        )
        db.add(act)

    await db.commit()
    await db.refresh(entry)
    await check_and_award_achievements(current_user.id, db)
    return entry


@router.delete("/{entry_id}", status_code=204)
async def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AnimeList).where(AnimeList.id == entry_id, AnimeList.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(404, "Entry not found")
    await db.delete(entry)
    await db.commit()
