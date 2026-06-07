import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../components/ui";
import { getStats } from "../api/backend";
import useAuthStore from "../store/authStore";

import BANNER_URL from "./banners/Frieren.png";

// ── Inline SVG icons (no emoji) ──────────────────────────────────────────────
const Icon = {
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Play: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Fire: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#ef4444" }}>
      <path d="M12 2C9.5 6 7 8.5 7 12.5C7 16.09 9.24 19 12 19C14.76 19 17 16.09 17 12.5C17 8.5 14.5 6 12 2ZM12 17C10.34 17 9 15.43 9 13.5C9 11.5 10 9.5 12 7C14 9.5 15 11.5 15 13.5C15 15.43 13.66 17 12 17Z" />
    </svg>
  ),
  Compass: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--purple-600)" }}>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  ),
  ImageOff: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--purple-300)" }}>
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
      <line x1="13.5" y1="6.5" x2="16" y2="4" />
      <path d="M21 15l-5-5L5 21" />
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  ),
};

// ── Cover image with graceful fallback ───────────────────────────────────────
function CoverImg({ src, alt, style }) {
  return src ? (
    <img
      src={src} alt={alt}
      style={style}
      onError={e => {
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "flex";
      }}
    />
  ) : null;
}

function CoverPlaceholder({ style, size }) {
  return (
    <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--purple-100)", flexDirection: "column", gap: 4 }}>
      <Icon.ImageOff size={size || 28} />
      <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>No Image</span>
    </div>
  );
}

export default function Stats() {
  const { user } = useAuthStore();
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return (
    <div className="fade-up">
      <Skeleton height={220} style={{ borderRadius: 20, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 20, marginBottom: 24 }}>
        {[...Array(3)].map((_, i) => <Skeleton key={i} height={280} />)}
      </div>
      <Skeleton height={180} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 16, color: "var(--text-muted)" }}>Could not load stats. Make sure the backend is running.</div>
    </div>
  );

  const totalStatus = stats.watching + stats.completed + stats.plan_to_watch + stats.on_hold + stats.dropped;
  const statusList = [
    { label: "Watching", val: stats.watching, color: "#7c3aed", pct: totalStatus ? Math.round(stats.watching / totalStatus * 100) : 0 },
    { label: "Completed", val: stats.completed, color: "#10b981", pct: totalStatus ? Math.round(stats.completed / totalStatus * 100) : 0 },
    { label: "Plan to Watch", val: stats.plan_to_watch, color: "#3b82f6", pct: totalStatus ? Math.round(stats.plan_to_watch / totalStatus * 100) : 0 },
    { label: "On Hold", val: stats.on_hold, color: "#f59e0b", pct: totalStatus ? Math.round(stats.on_hold / totalStatus * 100) : 0 },
    { label: "Dropped", val: stats.dropped, color: "#ef4444", pct: totalStatus ? Math.round(stats.dropped / totalStatus * 100) : 0 },
  ];

  const topGenres = stats.top_genres || [];
  const maxGenrePct = topGenres[0]?.percentage || 1;

  const personalityMap = {
    Fantasy: { name: "The Fantasy Wanderer", desc: "You enjoy emotional journeys, world-building, and character-driven stories that leave a lasting impact.", Icon: Icon.Compass },
    Action: { name: "The Action Seeker", desc: "You thrive on high-stakes battles and adrenaline-pumping storylines.", Icon: Icon.Compass },
    Romance: { name: "The Hopeless Romantic", desc: "You love heartfelt connections and emotional character arcs.", Icon: Icon.Heart },
    "Slice of Life": { name: "The Cozy Wanderer", desc: "You appreciate the beauty in everyday moments and quiet stories.", Icon: Icon.Sparkle },
  };
  const topGenre = topGenres[0]?.genre || "Fantasy";
  const personality = personalityMap[topGenre] || personalityMap["Fantasy"];
  const PersonalityIcon = personality.Icon;

  const suggestions = [
    { title: "Vinland Saga" },
    { title: "Mushoku Tensei" },
    { title: "Re:Zero – Starting Life in Another World" },
  ];

  const timeline = stats.timeline || [];
  const memberSince = stats.member_since || (user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "");

  const kindColors = {
    started: "#7c3aed",
    completed: "#10b981",
    added: "#7c3aed",
    milestone: "#f59e0b",
  };
  const kindBadge = {
    started: { label: "Watching ▶", bg: "#7c3aed18", color: "#7c3aed" },
    completed: { label: "Completed ✓", bg: "#10b98118", color: "#10b981" },
    added: { label: "Watching ▶", bg: "#7c3aed18", color: "#7c3aed" },
    milestone: { label: "Milestone ★", bg: "#f59e0b18", color: "#f59e0b" },
  };

  const donutR = 52;
  const donutCirc = 2 * Math.PI * donutR;

  return (
    <div className="fade-up">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 28,
        background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)",
        minHeight: 200,
      }}>
        <img
          src={BANNER_URL}
          alt="banner"
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            height: "100%", width: "50%",
            objectFit: "cover", objectPosition: "center top",
            display: "block",
          }}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(109,40,217,0.95) 0%, rgba(109,40,217,0.75) 48%, rgba(109,40,217,0.15) 68%, transparent 100%)",
        }} />
        <div style={{ position: "relative", zIndex: 2, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16, minHeight: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "3px solid rgba(255,255,255,0.3)",
              overflow: "hidden", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                )
              }
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 6, lineHeight: 1 }}>
                {user?.username || "Anime Fan"}'s Anime Journey
              </h1>
              {memberSince && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>
                  <Icon.Calendar />
                  Watching since {memberSince}
                </div>
              )}
            </div>
          </div>

          {/* Stats pills */}
          <div style={{
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)",
            borderRadius: 14, padding: "14px 24px",
            display: "flex", alignItems: "center",
            border: "1px solid rgba(255,255,255,0.2)",
            width: "fit-content", gap: 0,
          }}>
            {[
              { IconC: Icon.Play, label: "Hours Watched", value: `${stats.total_hours_watched}h`, iconColor: "#fff" },
              { IconC: Icon.Calendar, label: "Episodes Watched", value: stats.total_episodes_watched.toLocaleString(), iconColor: "#fff" },
              { IconC: Icon.Check, label: "Anime Completed", value: stats.completed, iconColor: "#fff" },
              { IconC: Icon.Star, label: "Average Score", value: stats.mean_score ? `${stats.mean_score}/10` : "—", iconColor: "#f59e0b" },
              { IconC: Icon.Fire, label: "Day Streak", value: stats.current_streak_days, iconColor: "#ef4444" },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                display: "flex", alignItems: "center", gap: 8,
                paddingRight: i < arr.length - 1 ? 28 : 0,
                marginRight: i < arr.length - 1 ? 28 : 0,
                borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.25)" : "none",
              }}>
                <span style={{ color: s.iconColor, display: "flex", alignItems: "center" }}><s.IconC /></span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 600, letterSpacing: 0.3, marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Three-column cards ───────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 20, marginBottom: 24 }}>

        {/* Anime Taste */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "var(--purple-600)", display: "flex" }}><Icon.Star /></span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Anime Taste</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>The genres you watch the most</p>

          {topGenres.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              Add anime to see your genre breakdown
            </div>
          ) : topGenres.slice(0, 5).map(g => (
            <div key={g.genre} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>
                <span>{g.genre}</span>
                <span style={{ color: "var(--purple-600)" }}>{g.percentage}%</span>
              </div>
              <div style={{ background: "var(--purple-100)", borderRadius: 99, height: 7, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(g.percentage / maxGenrePct) * 100}%`,
                  background: "linear-gradient(90deg, var(--purple-700), var(--purple-400))",
                  borderRadius: 99,
                }} />
              </div>
            </div>
          ))}

          {topGenres.length > 0 && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--purple-50)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ display: "flex", flexShrink: 0, marginTop: 1 }}><Icon.Sparkle /></span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, lineHeight: 1.5 }}>
                Your taste leans toward emotional {topGenre.toLowerCase()} stories with strong character development.
              </span>
            </div>
          )}
        </div>

        {/* Favorite Anime */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "#f472b6", display: "flex" }}><Icon.Heart /></span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Favorite Anime</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>The anime that left the biggest impression</p>

          {!stats.favorite_anime ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
              Rate anime to see your favorite
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16 }}>
              {/* Cover with fallback */}
              <div style={{ width: 110, flexShrink: 0, borderRadius: 12, overflow: "hidden", alignSelf: "flex-start", background: "var(--purple-100)", aspectRatio: "2/3", position: "relative" }}>
                {stats.favorite_anime.cover_image ? (
                  <>
                    <img
                      src={stats.favorite_anime.cover_image}
                      alt={stats.favorite_anime.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                    <div style={{ display: "none", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, position: "absolute", inset: 0 }}>
                      <Icon.ImageOff size={32} />
                      <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>No Image</span>
                    </div>
                  </>
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
                    <Icon.ImageOff size={32} />
                    <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>No Image</span>
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 10, lineHeight: 1.3 }}>
                  {stats.favorite_anime.title}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ color: "#f59e0b", display: "flex" }}><Icon.Star /></span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
                    {stats.favorite_anime.user_score}/10
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--purple-600)", background: "var(--purple-100)", borderRadius: 99, padding: "2px 10px" }}>
                    Your Highest Rated
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {(stats.favorite_anime.genres || []).slice(0, 3).map(g => (
                    <span key={g} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", background: "var(--surface2)", borderRadius: 99, padding: "3px 10px", border: "1px solid var(--border)" }}>
                      {g}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.6, fontStyle: "italic", borderLeft: "3px solid var(--purple-300)", paddingLeft: 10 }}>
                  You tend to enjoy reflective fantasy stories focused on character growth and beautiful world-building.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Anime Personality */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "var(--purple-600)", display: "flex" }}><Icon.Users /></span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Anime Personality</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>Based on your watching patterns</p>

          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: "var(--purple-700)", marginBottom: 14 }}>
              {personality.name}
            </div>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--purple-100), var(--purple-200))",
              border: "2px solid var(--purple-300)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px", color: "var(--purple-600)",
            }}>
              <PersonalityIcon />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 500 }}>
              {personality.desc}
            </p>
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "var(--purple-600)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Similar users also love:
            </p>
            {suggestions.map(s => (
              <div key={s.title} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: "linear-gradient(135deg, var(--purple-200), var(--purple-300))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--purple-700)" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Timeline + Quick Stats ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* Timeline */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "var(--purple-600)", display: "flex" }}><Icon.Clock /></span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Anime Journey Timeline</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Your anime journey so far</p>

          {timeline.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
              Start adding anime to see your journey!
            </div>
          ) : timeline.map((ev, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: i < timeline.length - 1 ? 0 : 0 }}>
              {/* Dot + line */}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: kindColors[ev.kind] || "var(--purple-600)",
                  border: "2px solid white",
                  boxShadow: `0 0 0 2px ${kindColors[ev.kind] || "var(--purple-600)"}44`,
                  flexShrink: 0,
                }} />
                {i < timeline.length - 1 && (
                  <div style={{ width: 2, height: 28, background: "var(--border)", marginTop: 3, marginBottom: 3 }} />
                )}
              </div>

              {/* Date */}
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, minWidth: 88, flexShrink: 0, alignSelf: "flex-start", paddingTop: 0 }}>
                {ev.date}
              </span>

              {/* Cover thumbnail */}
              <div style={{ width: 36, height: 36, borderRadius: 7, overflow: "hidden", flexShrink: 0, background: "var(--purple-100)", alignSelf: "flex-start", position: "relative" }}>
                {ev.cover_image && ev.kind !== "milestone" ? (
                  <>
                    <img
                      src={ev.cover_image}
                      alt={ev.anime_title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                    <div style={{ display: "none", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", position: "absolute", inset: 0 }}>
                      <Icon.ImageOff size={16} />
                    </div>
                  </>
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {ev.kind === "milestone"
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" /></svg>
                      : <Icon.ImageOff size={16} />
                    }
                  </div>
                )}
              </div>

              {/* Label + badge row */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, alignSelf: "flex-start", paddingBottom: i < timeline.length - 1 ? 16 : 0 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700, flex: 1 }}>
                  {ev.label}
                </span>
                {kindBadge[ev.kind] && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, flexShrink: 0,
                    background: kindBadge[ev.kind].bg, color: kindBadge[ev.kind].color,
                    whiteSpace: "nowrap",
                  }}>
                    {kindBadge[ev.kind].label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats donut */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>Quick Stats</div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <svg viewBox="0 0 130 130" width="150" height="150">
              {totalStatus === 0 ? (
                <circle cx="65" cy="65" r={donutR} fill="none" stroke="var(--border)" strokeWidth="18" />
              ) : (() => {
                let offset = 0;
                return statusList.map((s, idx) => {
                  const dash = (s.pct / 100) * donutCirc;
                  const el = (
                    <circle key={idx} cx="65" cy="65" r={donutR} fill="none"
                      stroke={s.color} strokeWidth="18"
                      strokeDasharray={`${dash} ${donutCirc - dash}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 65 65)"
                    />
                  );
                  offset += dash;
                  return el;
                });
              })()}
              <text x="65" y="60" textAnchor="middle" fontSize="22" fontWeight="900" fill="var(--text-primary)" fontFamily="Nunito">{totalStatus}</text>
              <text x="65" y="76" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="Nunito" fontWeight="600">Total</text>
            </svg>
          </div>

          {statusList.map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--text-secondary)", flex: 1, fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", minWidth: 18, textAlign: "right" }}>{s.val}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 38, textAlign: "right" }}>({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
