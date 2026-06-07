"""
Stats Service — every number is computed from real database records.
No hardcoded values, no random data, no mocks.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from typing import List

from ..models.anime_list import AnimeList
from ..models.rating import Rating, WatchActivity
from ..schemas.schemas import (
    UserStats, GenreBreakdown, MonthlyActivity, ScoreBucket,
    FavoriteAnime, TimelineEvent
)


async def compute_user_stats(user_id: int, db: AsyncSession, user=None) -> UserStats:
    # ── 1. Fetch all list entries ─────────────────────────────────────────────
    list_result = await db.execute(
        select(AnimeList).where(AnimeList.user_id == user_id)
    )
    entries: List[AnimeList] = list_result.scalars().all()

    # ── 2. Fetch all user ratings ─────────────────────────────────────────────
    ratings_result = await db.execute(
        select(Rating).where(Rating.user_id == user_id)
    )
    ratings: List[Rating] = ratings_result.scalars().all()

    # ── 3. Fetch watch activity (last 12 months) ──────────────────────────────
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    activity_result = await db.execute(
        select(WatchActivity)
        .where(WatchActivity.user_id == user_id, WatchActivity.recorded_at >= twelve_months_ago)
        .order_by(WatchActivity.recorded_at)
    )
    activities: List[WatchActivity] = activity_result.scalars().all()

    # ── 4. Status counts ──────────────────────────────────────────────────────
    status_map = defaultdict(int)
    for e in entries:
        status_map[e.status] += 1

    watching      = status_map["watching"]
    completed     = status_map["completed"]
    plan_to_watch = status_map["plan_to_watch"]
    on_hold       = status_map["on_hold"]
    dropped       = status_map["dropped"]
    total_anime   = len(entries)

    # ── 5. Episodes & time ────────────────────────────────────────────────────
    total_episodes = sum(e.progress for e in entries)
    total_minutes  = sum(e.watched_minutes for e in entries)
    total_hours    = round(total_minutes / 60, 1)

    # ── 6. Mean score from USER ratings ──────────────────────────────────────
    mean_score = None
    if ratings:
        mean_score = round(sum(r.score for r in ratings) / len(ratings), 2)

    # ── 7. Score distribution (user ratings bucketed) ─────────────────────────
    buckets: dict[str, int] = {"1-2": 0, "3-4": 0, "5-6": 0, "7-8": 0, "9-10": 0}
    for r in ratings:
        s = r.score
        if s <= 2:   buckets["1-2"]  += 1
        elif s <= 4: buckets["3-4"]  += 1
        elif s <= 6: buckets["5-6"]  += 1
        elif s <= 8: buckets["7-8"]  += 1
        else:        buckets["9-10"] += 1

    # Also include user_score on list entries (inline ratings)
    for e in entries:
        if e.user_score and not any(r.anilist_id == e.anilist_id for r in ratings):
            s = e.user_score
            if s <= 2:   buckets["1-2"]  += 1
            elif s <= 4: buckets["3-4"]  += 1
            elif s <= 6: buckets["5-6"]  += 1
            elif s <= 8: buckets["7-8"]  += 1
            else:        buckets["9-10"] += 1

    score_distribution = [ScoreBucket(range=k, count=v) for k, v in buckets.items()]

    # ── 8. Genre breakdown from stored genres ─────────────────────────────────
    genre_counter: Counter = Counter()
    for e in entries:
        if e.genres:
            for g in e.genres:
                genre_counter[g] += 1

    top_genres: List[GenreBreakdown] = []
    total_genre_count = sum(genre_counter.values()) or 1
    for genre, count in genre_counter.most_common(10):
        top_genres.append(GenreBreakdown(
            genre=genre,
            count=count,
            percentage=round(count / total_genre_count * 100, 1),
        ))

    # ── 9. Monthly activity from WatchActivity events ─────────────────────────
    monthly: dict[str, dict] = defaultdict(lambda: {"episodes": 0, "minutes": 0})
    for act in activities:
        key = act.recorded_at.strftime("%Y-%m")
        monthly[key]["episodes"] += act.episodes_delta
        monthly[key]["minutes"]  += act.episodes_delta * 24  # avg 24 min fallback

    # Also enrich minutes with actual duration where we can correlate
    anilist_duration_map = {e.anilist_id: (e.avg_episode_duration or 24) for e in entries}
    monthly2: dict[str, dict] = defaultdict(lambda: {"episodes": 0, "minutes": 0})
    for act in activities:
        key = act.recorded_at.strftime("%Y-%m")
        dur = anilist_duration_map.get(act.anilist_id, 24)
        monthly2[key]["episodes"] += act.episodes_delta
        monthly2[key]["minutes"]  += act.episodes_delta * dur

    monthly_activity = [
        MonthlyActivity(month=k, episodes=v["episodes"], minutes=v["minutes"])
        for k, v in sorted(monthly2.items())
    ]

    # ── 10. Current streak ────────────────────────────────────────────────────
    streak = _compute_streak(activities)

    # ── 11. Level based on total_episodes ─────────────────────────────────────
    level = max(1, total_episodes // 50)

    # ── 12. Favorite anime (highest user score, fallback to first completed) ─────
    favorite_anime = None
    scored = [(e.user_score or 0, e) for e in entries if e.user_score]
    if scored:
        best = max(scored, key=lambda x: x[0])[1]
        favorite_anime = FavoriteAnime(
            anilist_id=best.anilist_id,
            title=best.title,
            cover_image=best.cover_image,
            user_score=best.user_score,
            genres=best.genres or [],
        )
    elif ratings:
        best_rating = max(ratings, key=lambda r: r.score)
        entry_map = {e.anilist_id: e for e in entries}
        e = entry_map.get(best_rating.anilist_id)
        if e:
            favorite_anime = FavoriteAnime(
                anilist_id=e.anilist_id,
                title=e.title,
                cover_image=e.cover_image,
                user_score=best_rating.score,
                genres=e.genres or [],
            )

    # ── 13. Timeline events from list entries ─────────────────────────────────
    timeline: list[TimelineEvent] = []
    for e in sorted(entries, key=lambda x: x.created_at):
        date_str = e.created_at.strftime("%b %d, %Y").replace(" 0", " ")
        if e.status == "completed":
            kind = "completed"
            label = f"Completed {e.title}"
        elif e.status == "watching":
            kind = "started"
            label = f"Started watching {e.title}"
        else:
            kind = "added"
            label = f"Added {e.title} to your list"
        timeline.append(TimelineEvent(
            date=date_str,
            label=label,
            anime_title=e.title,
            cover_image=e.cover_image,
            kind=kind,
            episode=e.progress if e.progress > 0 else None,
        ))

    # Milestone event
    if total_episodes > 0:
        timeline.append(TimelineEvent(
            date=datetime.utcnow().strftime("%b %d, %Y").replace(" 0", " "),
            label=f"Reached {total_episodes} episodes watched",
            anime_title="",
            cover_image=None,
            kind="milestone",
            episode=total_episodes,
        ))

    # Most recent 4 + milestone
    timeline = timeline[-5:] if len(timeline) > 5 else timeline

    # ── 14. Member since ─────────────────────────────────────────────────────
    member_since = ""
    if user and hasattr(user, 'created_at') and user.created_at:
        member_since = user.created_at.strftime("%B %Y")

    return UserStats(
        watching=watching,
        completed=completed,
        plan_to_watch=plan_to_watch,
        on_hold=on_hold,
        dropped=dropped,
        total_anime=total_anime,
        total_episodes_watched=total_episodes,
        total_minutes_watched=total_minutes,
        total_hours_watched=total_hours,
        mean_score=mean_score,
        score_distribution=score_distribution,
        top_genres=top_genres,
        monthly_activity=monthly_activity,
        current_streak_days=streak,
        level=level,
        favorite_anime=favorite_anime,
        timeline=timeline,
        member_since=member_since,
    )


def _compute_streak(activities: List[WatchActivity]) -> int:
    """Count consecutive days with watch activity ending today."""
    if not activities:
        return 0
    active_days = {act.recorded_at.date() for act in activities}
    today = datetime.utcnow().date()
    streak = 0
    day = today
    while day in active_days:
        streak += 1
        day -= timedelta(days=1)
    return streak
