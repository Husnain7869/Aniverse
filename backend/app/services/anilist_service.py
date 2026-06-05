import httpx
from ..core.config import settings

TRENDING_QUERY = """
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(sort: TRENDING_DESC, type: ANIME) {
      id
      title { romaji english }
      coverImage { large extraLarge }
      averageScore
      episodes
      status
      genres
      popularity
      nextAiringEpisode { airingAt episode }
      startDate { year month day }
    }
  }
}
"""

SEASONAL_QUERY = """
query ($season: MediaSeason, $year: Int, $page: Int) {
  Page(page: $page, perPage: 20) {
    media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
      id
      title { romaji english }
      coverImage { large extraLarge }
      averageScore
      episodes
      status
      genres
      popularity
    }
  }
}
"""

SEARCH_QUERY = """
query ($search: String, $page: Int, $genre: String, $status: MediaStatus, $year: Int) {
  Page(page: $page, perPage: 20) {
    media(
      search: $search
      type: ANIME
      sort: SEARCH_MATCH
      genre: $genre
      status: $status
      seasonYear: $year
    ) {
      id
      title { romaji english }
      coverImage { large extraLarge }
      averageScore
      episodes
      status
      genres
      popularity
    }
  }
}
"""

DETAILS_QUERY = """
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { extraLarge }
    bannerImage
    description(asHtml: false)
    averageScore
    popularity
    episodes
    status
    genres
    startDate { year month day }
    endDate { year month day }
    studios { nodes { name isAnimationStudio } }
    characters(sort: ROLE, perPage: 12) {
      nodes {
        name { full }
        image { medium }
        description
      }
    }
    staff(sort: RELEVANCE, perPage: 8) {
      nodes {
        name { full }
        image { medium }
        primaryOccupations
      }
    }
    recommendations(sort: RATING_DESC, perPage: 8) {
      nodes {
        mediaRecommendation {
          id
          title { romaji }
          coverImage { large }
          averageScore
          genres
        }
      }
    }
    relations {
      nodes {
        id
        title { romaji }
        coverImage { large }
        type
        format
      }
    }
    trailer { id site }
    nextAiringEpisode { airingAt episode }
  }
}
"""


async def _query(query: str, variables: dict = None) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            settings.ANILIST_API,
            json={"query": query, "variables": variables or {}},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_trending(page: int = 1, per_page: int = 20) -> list:
    data = await _query(TRENDING_QUERY, {"page": page, "perPage": per_page})
    return data["data"]["Page"]["media"]


async def get_seasonal(season: str, year: int, page: int = 1) -> list:
    data = await _query(SEASONAL_QUERY, {"season": season, "year": year, "page": page})
    return data["data"]["Page"]["media"]


async def search_anime(
    search: str = None,
    page: int = 1,
    genre: str = None,
    status: str = None,
    year: int = None,
) -> list:
    variables = {"search": search, "page": page, "genre": genre, "status": status, "year": year}
    data = await _query(SEARCH_QUERY, variables)
    return data["data"]["Page"]["media"]


async def get_anime_details(anime_id: int) -> dict:
    data = await _query(DETAILS_QUERY, {"id": anime_id})
    return data["data"]["Media"]
