from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.rating import RecommendationHistory
from ..services.ai_service import chat_with_ai
from ..schemas.schemas import RecommendRequest, RecommendResponse

router = APIRouter(prefix="/api/recommendations", tags=["AI Recommendations"])


@router.post("/", response_model=RecommendResponse)
async def recommend(
    data: RecommendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Full AI chat endpoint.
    - Rebuilds user context from DB on every call
    - Supports full conversation history for memory
    - Never recommends anime already in the user's list
    """
    response = await chat_with_ai(
        user_id=current_user.id,
        username=current_user.username,
        prompt=data.prompt,
        conversation_history=data.conversation_history or [],
        db=db,
    )
    return RecommendResponse(response=response, prompt=data.prompt)


@router.get("/history")
async def history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RecommendationHistory)
        .where(RecommendationHistory.user_id == current_user.id)
        .order_by(RecommendationHistory.created_at.desc())
        .limit(20)
    )
    items = result.scalars().all()
    return [{"prompt": i.prompt, "response": i.response, "created_at": i.created_at} for i in items]
