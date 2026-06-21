"""
AI Service — real OpenAI/Anthropic integration with full conversation memory.
Falls back gracefully if no API keys are configured.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict

from ..models.rating import RecommendationHistory
from ..services.recommendation_service import build_user_context, build_system_prompt
from ..core.config import settings


async def chat_with_ai(
    user_id: int,
    username: str,
    prompt: str,
    conversation_history: List[Dict[str, str]],
    db: AsyncSession,
) -> str:
    # Always rebuild context from current DB state
    ctx = await build_user_context(user_id, db)
    system_prompt = build_system_prompt(ctx, username)

    # Build messages with history (last 20 turns)
    messages = []
    for msg in conversation_history[-20:]:
        if msg.get("role") in ("user", "assistant"):
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": prompt})

    result = await _call_ai(system_prompt, messages)

    # Persist exchange
    db.add(RecommendationHistory(user_id=user_id, prompt=prompt, response=result))
    await db.commit()

    return result


async def _call_ai(system_prompt: str, messages: list) -> str:
    # Try OpenAI
    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            resp = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": system_prompt}] + messages,
                max_tokens=600,
                temperature=0.75,
            )
            return resp.choices[0].message.content
        except Exception as e:
            print(f"OpenAI error: {e}")

    # Try Anthropic
    if settings.ANTHROPIC_API_KEY:
        try:
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            resp = await client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=600,
                system=system_prompt,
                messages=messages,
            )
            return resp.content[0].text
        except Exception as e:
            print(f"Anthropic error: {e}")

    # Offline fallback
    return _offline_fallback(messages[-1]["content"])


def _offline_fallback(prompt: str) -> str:
    p = prompt.lower().strip()

    greetings = ["hi", "hello", "hey", "sup", "yo", "good morning", "good evening", "what's up"]
    if any(p.startswith(g) for g in greetings) or p in greetings:
        return "Hey! 👋 I'm Aniverse AI. I need an OpenAI or Anthropic API key to give personalized recommendations.\n\nAdd `OPENAI_API_KEY=sk-...` to your backend `.env` file and restart. I'll then know exactly what you've watched and what to suggest next!"

    if any(w in p for w in ["dark", "psychological", "thriller", "horror", "disturbing"]):
        return "Some acclaimed dark/psychological anime:\n\n🌑 **Monster** (74 eps, 2004) — A surgeon hunts a serial killer he once saved.\n🌑 **Paranoia Agent** (13 eps, 2004) — Satoshi Kon's only series. Unsettling and brilliant.\n🌑 **Shiki** (22 eps, 2010) — Village horror that asks real moral questions.\n🌑 **91 Days** (13 eps, 2016) — Prohibition-era revenge thriller.\n\n*Add an AI key for picks tailored to your watch history.*"

    if any(w in p for w in ["romance", "love", "romantic"]):
        return "Top romance anime:\n\n💜 **Toradora!** (25 eps) — The genre benchmark.\n💜 **Your Lie in April** (22 eps) — Music and heartbreak.\n💜 **Kaguya-sama: Love is War** (37 eps) — Comedy of romantic warfare.\n💜 **Fruits Basket 2019** (63 eps) — Deep emotional healing.\n\n*Add an AI key for picks based on your actual taste.*"

    if any(w in p for w in ["action", "fight", "battle", "shonen"]):
        return "Top action anime:\n\n⚔️ **Vinland Saga** (48 eps) — Viking epic with stunning character arcs.\n⚔️ **Fullmetal Alchemist: Brotherhood** (64 eps) — Near-perfect storytelling.\n⚔️ **Hunter x Hunter 2011** (148 eps) — Deep strategy and emotion.\n⚔️ **Demon Slayer** (55 eps) — Breathtaking animation.\n\n*Add an AI key for personalized picks.*"

    if any(w in p for w in ["hidden", "gem", "underrated", "unknown", "obscure"]):
        return "Hidden gems:\n\n✨ **The Tatami Galaxy** (11 eps) — Mind-bending coming-of-age.\n✨ **Mushishi** (26 eps) — Atmospheric, meditative, unlike anything else.\n✨ **Planetes** (26 eps) — Realistic sci-fi about space garbage collectors.\n✨ **Ping Pong the Animation** (11 eps) — Sports anime as profound character study.\n\n*Add an AI key for picks based on your watch history.*"

    return "I'd love to give you a personalized recommendation!\n\nTo unlock full AI capabilities, add an API key to your backend `.env`:\n```\nOPENAI_API_KEY=sk-your-key-here\n```\nThen restart the backend. I'll have access to your full watch history, ratings, and taste profile! 🎌"
