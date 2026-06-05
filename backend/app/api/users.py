from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.rating import Achievement
from ..schemas.schemas import UserOut, UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.username:
        existing = await db.execute(select(User).where(User.username == data.username, User.id != current_user.id))
        if existing.scalar_one_or_none():
            raise HTTPException(400, "Username already taken")
        current_user.username = data.username
    if data.bio is not None:
        current_user.bio = data.bio
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/me/achievements")
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Achievement).where(Achievement.user_id == current_user.id))
    return [{"badge": a.badge, "title": a.title, "description": a.description, "icon": a.icon, "unlocked_at": a.unlocked_at} for a in result.scalars().all()]
