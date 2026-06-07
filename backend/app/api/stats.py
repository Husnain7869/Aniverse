from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..schemas.schemas import UserStats
from ..services.stats_service import compute_user_stats

router = APIRouter(prefix="/api/stats", tags=["Statistics"])


@router.get("/", response_model=UserStats)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns fully computed statistics from the user's actual database records.
    No hardcoded values — every number is derived from real data.
    """
    return await compute_user_stats(current_user.id, db, user=current_user)
