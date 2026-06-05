from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.anime_list import AnimeList
from ..models.rating import Achievement, WatchActivity

ACHIEVEMENTS = [
    {"badge": "first_anime",    "title": "First Step",       "description": "Added your first anime",           "icon": "🌟", "condition": lambda s: s["total"] >= 1},
    {"badge": "binge_watcher",  "title": "Binge Watcher",    "description": "Completed 10 anime",               "icon": "🎬", "condition": lambda s: s["completed"] >= 10},
    {"badge": "50_completed",   "title": "Completionist",    "description": "Completed 50 anime series",        "icon": "🏆", "condition": lambda s: s["completed"] >= 50},
    {"badge": "100_episodes",   "title": "Episode Hunter",   "description": "Watched 100 episodes",             "icon": "📺", "condition": lambda s: s["episodes"] >= 100},
    {"badge": "1000_episodes",  "title": "Veteran Watcher",  "description": "Watched 1,000 episodes",           "icon": "💎", "condition": lambda s: s["episodes"] >= 1000},
    {"badge": "genre_master",   "title": "Genre Master",     "description": "Watched anime in 5+ genres",       "icon": "🎭", "condition": lambda s: s["genres"] >= 5},
    {"badge": "critic",         "title": "The Critic",       "description": "Rated 20 anime",                   "icon": "⭐", "condition": lambda s: s["rated"] >= 20},
]


async def check_and_award_achievements(user_id: int, db: AsyncSession):
    list_result = await db.execute(select(AnimeList).where(AnimeList.user_id == user_id))
    entries = list_result.scalars().all()

    all_genres = set()
    for e in entries:
        if e.genres:
            all_genres.update(e.genres)

    # Count rated anime (those with user_score)
    rated_count = sum(1 for e in entries if e.user_score is not None)

    stats = {
        "total":     len(entries),
        "completed": sum(1 for e in entries if e.status == "completed"),
        "episodes":  sum(e.progress for e in entries),
        "genres":    len(all_genres),
        "rated":     rated_count,
    }

    existing_result = await db.execute(select(Achievement.badge).where(Achievement.user_id == user_id))
    existing = {row[0] for row in existing_result.fetchall()}

    for ach in ACHIEVEMENTS:
        if ach["badge"] not in existing and ach["condition"](stats):
            db.add(Achievement(user_id=user_id, badge=ach["badge"], title=ach["title"], description=ach["description"], icon=ach["icon"]))

    await db.commit()
