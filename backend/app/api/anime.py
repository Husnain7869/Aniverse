from fastapi import APIRouter, Query
from typing import Optional
from ..services.anilist_service import get_trending, get_seasonal, search_anime, get_anime_details

router = APIRouter(prefix="/api/anime", tags=["Anime"])


@router.get("/trending")
async def trending(page: int = 1, per_page: int = 20):
    return await get_trending(page=page, per_page=per_page)


@router.get("/seasonal")
async def seasonal(
    season: str = Query("SPRING", enum=["WINTER", "SPRING", "SUMMER", "FALL"]),
    year: int = 2024,
    page: int = 1,
):
    return await get_seasonal(season=season, year=year, page=page)


@router.get("/search")
async def search(
    q: Optional[str] = None,
    genre: Optional[str] = None,
    status: Optional[str] = None,
    year: Optional[int] = None,
    page: int = 1,
):
    return await search_anime(search=q, page=page, genre=genre, status=status, year=year)


@router.get("/{anime_id}")
async def details(anime_id: int):
    return await get_anime_details(anime_id=anime_id)
