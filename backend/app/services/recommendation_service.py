"""
Recommendation Service
Builds a real user context from DB and uses it to generate personalized
recommendations. The context is rebuilt on every call so it always
reflects the current state of the user's list.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from collections import Counter
from typing import List, Optional, Dict

from ..models.anime_list import AnimeList
from ..models.rating import Rating
from ..services.anilist_service import search_anime


async def build_user_context(user_id: int, db: AsyncSession) -> dict:
    """
    Returns a structured dict describing exactly what the user has watched,
    rated, dropped, and prefers. This is the single source of truth injected
    into every AI prompt.
    """
    list_result = await db.execute(
        select(AnimeList).where(AnimeList.user_id == user_id).order_by(AnimeList.updated_at.desc())
    )
    entries: List[AnimeList] = list_result.scalars().all()

    ratings_result = await db.execute(
        select(Rating).where(Rating.user_id == user_id)
    )
    ratings: List[Rating] = ratings_result.scalars().all()

    # Build rating lookup: anilist_id → score
    rating_map: Dict[int, float] = {r.anilist_id: r.score for r in ratings}
    # Also include inline user_score from list entries
    for e in entries:
        if e.user_score and e.anilist_id not in rating_map:
            rating_map[e.anilist_id] = e.user_score

    # Partition by status
    completed   = [e for e in entries if e.status == "completed"]
    watching    = [e for e in entries if e.status == "watching"]
    dropped     = [e for e in entries if e.status == "dropped"]
    on_hold     = [e for e in entries if e.status == "on_hold"]
    plan        = [e for e in entries if e.status == "plan_to_watch"]

    # All anilist_ids already in list (never recommend these)
    known_ids = {e.anilist_id for e in entries}

    # Genre analysis — weight by score
    genre_scores: Counter = Counter()
    genre_counts: Counter = Counter()
    for e in entries:
        if e.genres:
            score = rating_map.get(e.anilist_id, 5.0)
            for g in e.genres:
                genre_scores[g] += score
                genre_counts[g] += 1

    # Weighted genre preference
    top_genres = sorted(
        genre_counts.keys(),
        key=lambda g: genre_scores[g] / genre_counts[g],
        reverse=True
    )[:5]

    # Highly rated (≥8)
    loved = [(e.title, rating_map[e.anilist_id]) for e in entries if rating_map.get(e.anilist_id, 0) >= 8]
    loved.sort(key=lambda x: x[1], reverse=True)

    # Disliked (≤4)
    disliked = [(e.title, rating_map[e.anilist_id]) for e in entries if 0 < rating_map.get(e.anilist_id, 10) <= 4]

    return {
        "completed": [{"title": e.title, "score": rating_map.get(e.anilist_id), "genres": e.genres} for e in completed],
        "watching":  [{"title": e.title, "progress": f"{e.progress}/{e.total_episodes or '?'}"} for e in watching],
        "dropped":   [{"title": e.title, "score": rating_map.get(e.anilist_id)} for e in dropped],
        "on_hold":   [{"title": e.title} for e in on_hold],
        "plan":      [{"title": e.title} for e in plan[:5]],
        "loved":     loved[:10],
        "disliked":  disliked,
        "top_genres": top_genres,
        "known_ids": known_ids,
        "total_anime": len(entries),
        "mean_score": round(sum(rating_map.values()) / len(rating_map), 2) if rating_map else None,
    }


def build_system_prompt(ctx: dict, username: str) -> str:
    """
    Constructs the full system prompt injecting user context.
    The AI always has complete knowledge of what the user has watched.
    """
    completed_str = ""
    if ctx["completed"]:
        lines = []
        for c in ctx["completed"][:20]:
            score_str = f" — rated {c['score']}/10" if c["score"] else ""
            genres_str = f" [{', '.join(c['genres'][:2])}]" if c.get("genres") else ""
            lines.append(f"  • {c['title']}{genres_str}{score_str}")
        completed_str = "COMPLETED:\n" + "\n".join(lines)

    watching_str = ""
    if ctx["watching"]:
        lines = [f"  • {w['title']} ({w['progress']} eps)" for w in ctx["watching"]]
        watching_str = "\nCURRENTLY WATCHING:\n" + "\n".join(lines)

    dropped_str = ""
    if ctx["dropped"]:
        lines = [f"  • {d['title']}" + (f" (rated {d['score']}/10)" if d["score"] else "") for d in ctx["dropped"]]
        dropped_str = "\nDROPPED (don't recommend similar):\n" + "\n".join(lines)

    loved_str = ""
    if ctx["loved"]:
        lines = [f"  • {t} ({s}/10)" for t, s in ctx["loved"][:8]]
        loved_str = "\nFAVORITE ANIME (highest rated):\n" + "\n".join(lines)

    genres_str = f"\nFAVORITE GENRES (in order): {', '.join(ctx['top_genres'])}" if ctx["top_genres"] else ""

    known_str = f"\nANIME ALREADY IN LIST ({ctx['total_anime']} total): Never recommend these."

    mean = f"\nMEAN SCORE: {ctx['mean_score']}/10" if ctx["mean_score"] else ""

    return f"""You are AniMind AI — a knowledgeable, warm anime companion for {username}.

You have full knowledge of their anime history:
{completed_str}{watching_str}{dropped_str}{loved_str}{genres_str}{known_str}{mean}

YOUR RULES:
1. NEVER recommend anime already in their list (completed, watching, on hold, dropped, or planned).
2. Tailor every recommendation to their demonstrated taste.
3. If they loved {ctx['loved'][0][0] if ctx['loved'] else 'a show'}, suggest thematically similar anime.
4. If they dropped or disliked something, avoid recommending similar shows.
5. If the user is just chatting (greetings, off-topic), respond naturally — don't force anime recs.
6. If asked something unrelated or rude, respond as a normal assistant would — don't force recommendations.
7. When recommending, include: title, episode count, year, and a specific reason tied to their taste.
8. Format recommendations as clean bullet points. Keep responses under 300 words unless asked for more.
9. You have memory of this conversation — reference earlier messages when relevant.
10. If the user has no history yet, give great general recommendations for their request."""
