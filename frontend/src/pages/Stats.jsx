import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../components/ui";
import { getStats } from "../api/backend";
import useAuthStore from "../store/authStore";
import { useIsMobile } from "../hooks/useIsMobile";
import BANNER_URL from "./banners/Frieren.png";

// ── Inline SVG icons ─────────────────────────────────────────────────────────
const Icon = {
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Play: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Calendar: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Fire: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
      <path d="M12 2C9.5 6 7 8.5 7 12.5C7 16.09 9.24 19 12 19C14.76 19 17 16.09 17 12.5C17 8.5 14.5 6 12 2ZM12 17C10.34 17 9 15.43 9 13.5C9 11.5 10 9.5 12 7C14 9.5 15 11.5 15 13.5C15 15.43 13.66 17 12 17Z"/>
    </svg>
  ),
  Compass: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--purple-600)">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
    </svg>
  ),
  ImageOff: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--purple-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22"/>
      <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/>
      <line x1="13.5" y1="6.5" x2="16" y2="4"/>
      <path d="M21 15l-5-5L5 21"/>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    </svg>
  ),
  TV: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
};

function ImgWithFallback({ src, alt, imgStyle, wrapStyle }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", ...wrapStyle }}>
      {src ? (
        <>
          <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...imgStyle }}
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
          <div style={{ display: "none", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, background: "var(--purple-50)", position: "absolute", inset: 0 }}>
            <Icon.ImageOff size={22} /><span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>No Image</span>
          </div>
        </>
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, background: "var(--purple-50)" }}>
          <Icon.ImageOff size={22} /><span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>No Image</span>
        </div>
      )}
    </div>
  );
}

export default function Stats() {
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return (
    <div className="fade-up">
      <Skeleton height={240} style={{ borderRadius: 0, marginBottom: 24, marginLeft: isMobile ? -14 : -32, marginRight: isMobile ? -14 : -32, marginTop: isMobile ? -16 : -28 }} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr 1fr", gap: 20, marginBottom: 24 }}>
        {[...Array(3)].map((_, i) => <Skeleton key={i} height={300} />)}
      </div>
      <Skeleton height={200} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 8 }}>
        {error?.response?.status === 401
          ? "Session expired. Please log in again."
          : "Could not load stats. Make sure the backend is running."}
      </div>
      {error?.response?.status === 401 && (
        <a href="/login" style={{ color: "var(--purple-500)", fontWeight: 700, fontSize: 14 }}>Go to Login →</a>
      )}
    </div>
  );

  const totalStatus = stats.watching + stats.completed + stats.plan_to_watch + stats.on_hold + stats.dropped;
  const statusList = [
    { label: "Watching",      val: stats.watching,      color: "#7c3aed", pct: totalStatus ? Math.round(stats.watching / totalStatus * 100) : 0 },
    { label: "Completed",     val: stats.completed,     color: "#10b981", pct: totalStatus ? Math.round(stats.completed / totalStatus * 100) : 0 },
    { label: "Plan to Watch", val: stats.plan_to_watch, color: "#3b82f6", pct: totalStatus ? Math.round(stats.plan_to_watch / totalStatus * 100) : 0 },
    { label: "On Hold",       val: stats.on_hold,       color: "#f59e0b", pct: totalStatus ? Math.round(stats.on_hold / totalStatus * 100) : 0 },
    { label: "Dropped",       val: stats.dropped,       color: "#ef4444", pct: totalStatus ? Math.round(stats.dropped / totalStatus * 100) : 0 },
  ];

  const topGenres = stats.top_genres || [];
  const maxGenrePct = topGenres[0]?.percentage || 1;

  const personalityMap = {
    Fantasy:         { name: "The Fantasy Wanderer", desc: "You enjoy emotional journeys, world-building, and character-driven stories that leave a lasting impact." },
    Action:          { name: "The Action Seeker",    desc: "You thrive on high-stakes battles and adrenaline-pumping storylines." },
    Romance:         { name: "The Hopeless Romantic", desc: "You love heartfelt connections and emotional character arcs." },
    "Slice of Life": { name: "The Cozy Wanderer",    desc: "You appreciate the beauty in everyday moments and quiet stories." },
  };
  const topGenre = topGenres[0]?.genre || "Fantasy";
  const personality = personalityMap[topGenre] || personalityMap["Fantasy"];

  const suggestions = ["Vinland Saga", "Mushoku Tensei", "Re:Zero – Starting Life in Another World"];

  const timeline = stats.timeline || [];
  const memberSince = stats.member_since || (user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "");

  const kindColors = { started: "#7c3aed", completed: "#10b981", added: "#7c3aed", milestone: "#f59e0b" };
  const kindBadge  = {
    started:   { label: "Watching ▶",  bg: "#7c3aed18", color: "#7c3aed" },
    completed: { label: "Completed ✓", bg: "#10b98118", color: "#10b981" },
    added:     { label: "Watching ▶",  bg: "#7c3aed18", color: "#7c3aed" },
    milestone: { label: "Milestone ★", bg: "#f59e0b18", color: "#f59e0b" },
  };

  const donutR = 52, donutCirc = 2 * Math.PI * donutR;

  return (
    <div className="fade-up">

      {/* ── Hero Banner — bleeds edge-to-edge out of the main padding ─────────── */}
      <div style={{
        position: "relative",
        marginLeft: isMobile ? -14 : -32, marginRight: isMobile ? -14 : -32, marginTop: isMobile ? -16 : -28,
        marginBottom: 28,
        height: 240,
        overflow: "hidden",
        background: "linear-gradient(110deg, #5b21b6 0%, #7c3aed 45%, #8b5cf6 100%)",
      }}>
        {/* Frieren image — right half */}
        <img
          src={BANNER_URL}
          alt="banner"
          style={{
            position: "absolute",
            top: 0, right: 0,
            height: "100%",
            width: "62%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
          onError={e => { e.target.style.display = "none"; }}
        />
        {/* Gradient fade from purple into image */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, #6d28d9 0%, #7c3aed 30%, rgba(109,40,217,0.82) 42%, rgba(109,40,217,0.3) 58%, transparent 75%)",
          pointerEvents: "none",
        }} />

        {/* Content — padded back to match the page */}
        <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "16px 16px" : "28px 32px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Top: avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 18 }}>
            <div style={{
              width: isMobile ? 48 : 68, height: isMobile ? 48 : 68, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "2.5px solid rgba(255,255,255,0.35)",
              overflow: "hidden", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              }
            </div>
            <div>
              <h1 style={{ fontSize: isMobile ? 18 : 28, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 7 }}>
                {user?.username || "Anime Fan"}'s Anime Journey
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }}>
                <Icon.Calendar /> Watching since {memberSince || "—"}
              </div>
            </div>
          </div>

          {/* Bottom: stat pills bar */}
          <div style={{
            background: "rgba(255,255,255,0.13)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 14,
            padding: isMobile ? "10px 14px" : "13px 24px",
            display: "flex",
            alignItems: "center",
            gap: 0,
            alignSelf: "stretch",
            overflowX: isMobile ? "auto" : "visible",
            flexWrap: isMobile ? "nowrap" : "nowrap",
          }}>
            {[
              { IC: Icon.Play,     label: "Hours Watched",    value: `${stats.total_hours_watched}h`,                               col: "#fff" },
              { IC: Icon.Calendar, label: "Episodes Watched", value: stats.total_episodes_watched.toLocaleString(),                  col: "#fff" },
              { IC: Icon.Check,   label: "Anime Completed",  value: stats.completed,                                                col: "#fff" },
              { IC: Icon.Star,    label: "Average Score",    value: stats.mean_score ? `${stats.mean_score}/10` : "—",              col: "#f59e0b" },
              { IC: Icon.Fire,    label: "Day Streak",       value: `${stats.current_streak_days}`,                                 col: "#ef4444" },
            ].map(({ IC, label, value, col }, i, arr) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: isMobile ? 6 : 9, flexShrink: 0,
                paddingRight: i < arr.length - 1 ? (isMobile ? 16 : 28) : 0,
                marginRight: i < arr.length - 1 ? (isMobile ? 16 : 28) : 0,
                borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.22)" : "none",
              }}>
                <span style={{ color: col, display: "flex", alignItems: "center" }}><IC /></span>
                <div>
                  <div style={{ fontSize: isMobile ? 14 : 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: isMobile ? 9 : 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: 2, letterSpacing: 0.2 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Three cards ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.25fr 1fr", gap: 18, marginBottom: 20 }}>

        {/* Anime Taste */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ color: "var(--purple-600)", display: "flex" }}><Icon.Star /></span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Anime Taste</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>The genres you watch the most</p>

          {topGenres.length === 0
            ? <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Add anime to see your genre breakdown</div>
            : topGenres.slice(0, 5).map(g => (
              <div key={g.genre} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>
                  <span>{g.genre}</span>
                  <span style={{ color: "var(--purple-600)" }}>{g.percentage}%</span>
                </div>
                <div style={{ background: "var(--purple-100)", borderRadius: 99, height: 7, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(g.percentage / maxGenrePct) * 100}%`, background: "linear-gradient(90deg,var(--purple-700),var(--purple-400))", borderRadius: 99 }} />
                </div>
              </div>
            ))
          }

          {topGenres.length > 0 && (
            <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--purple-50)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ display: "flex", flexShrink: 0, marginTop: 1 }}><Icon.Sparkle /></span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, lineHeight: 1.5 }}>
                Your taste leans toward emotional {topGenre.toLowerCase()} stories with strong character development.
              </span>
            </div>
          )}
        </div>

        {/* Favorite Anime */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ color: "#f472b6", display: "flex" }}><Icon.Heart /></span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Favorite Anime</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>The anime that left the biggest impression</p>

          {!stats.favorite_anime
            ? <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>Rate anime to see your favorite</div>
            : (
              <div style={{ display: "flex", gap: 16 }}>
                <ImgWithFallback
                  src={stats.favorite_anime.cover_image}
                  alt={stats.favorite_anime.title}
                  wrapStyle={{ width: 105, flexShrink: 0, borderRadius: 10, aspectRatio: "2/3" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 9, lineHeight: 1.3 }}>
                    {stats.favorite_anime.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9, flexWrap: "wrap" }}>
                    <span style={{ color: "#f59e0b", display: "flex" }}><Icon.Star /></span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{stats.favorite_anime.user_score}/10</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--purple-600)", background: "var(--purple-100)", borderRadius: 99, padding: "2px 9px" }}>Your Highest Rated</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 11 }}>
                    {(stats.favorite_anime.genres || []).slice(0, 3).map(g => (
                      <span key={g} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", background: "var(--surface2)", borderRadius: 99, padding: "3px 10px", border: "1px solid var(--border)" }}>{g}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.6, fontStyle: "italic", borderLeft: "3px solid var(--purple-300)", paddingLeft: 10 }}>
                    You tend to enjoy reflective fantasy stories focused on character growth and beautiful world-building.
                  </div>
                </div>
              </div>
            )
          }
        </div>

        {/* Anime Personality */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ color: "var(--purple-600)", display: "flex" }}><Icon.Users /></span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Anime Personality</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18 }}>Based on your watching patterns</p>

          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: "var(--purple-700)", marginBottom: 14 }}>{personality.name}</p>
            <div style={{
              width: 58, height: 58, borderRadius: "50%",
              background: "linear-gradient(135deg,var(--purple-100),var(--purple-200))",
              border: "2px solid var(--purple-300)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px", color: "var(--purple-600)",
            }}>
              <Icon.Compass size={22} />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 500 }}>{personality.desc}</p>
          </div>

          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "var(--purple-600)", marginBottom: 9, textTransform: "uppercase", letterSpacing: 0.6 }}>
              Similar users also love:
            </p>
            {suggestions.map(title => (
              <div key={title} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: "linear-gradient(135deg,var(--purple-100),var(--purple-200))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon.TV />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom: Timeline + Quick Stats ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 18, alignItems: "start" }}>

        {/* Timeline */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ color: "var(--purple-600)", display: "flex" }}><Icon.Clock /></span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Anime Journey Timeline</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Your anime journey so far</p>

          {timeline.length === 0
            ? <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>Start adding anime to see your journey!</div>
            : timeline.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                {/* Dot + connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
                  <div style={{
                    width: 11, height: 11, borderRadius: "50%",
                    background: kindColors[ev.kind] || "var(--purple-600)",
                    border: "2px solid #fff",
                    boxShadow: `0 0 0 2px ${kindColors[ev.kind] || "var(--purple-600)"}44`,
                  }} />
                  {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: "var(--border)", margin: "3px 0" }} />}
                </div>

                {/* Row content */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, paddingBottom: i < timeline.length - 1 ? 14 : 0 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, minWidth: 78, flexShrink: 0 }}>{ev.date}</span>

                  <ImgWithFallback
                    src={ev.kind !== "milestone" ? ev.cover_image : null}
                    alt={ev.anime_title}
                    wrapStyle={{ width: 34, height: 34, borderRadius: 6, flexShrink: 0 }}
                  />

                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700, flex: 1 }}>{ev.label}</span>

                  {kindBadge[ev.kind] && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, flexShrink: 0, whiteSpace: "nowrap",
                      background: kindBadge[ev.kind].bg, color: kindBadge[ev.kind].color,
                    }}>{kindBadge[ev.kind].label}</span>
                  )}
                </div>
              </div>
            ))
          }
        </div>

        {/* Quick Stats donut */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 18 }}>Quick Stats</div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <svg viewBox="0 0 130 130" width="148" height="148">
              {totalStatus === 0
                ? <circle cx="65" cy="65" r={donutR} fill="none" stroke="var(--border)" strokeWidth="18" />
                : (() => {
                  let offset = 0;
                  return statusList.map((s, idx) => {
                    const dash = (s.pct / 100) * donutCirc;
                    const el = <circle key={idx} cx="65" cy="65" r={donutR} fill="none" stroke={s.color} strokeWidth="18"
                      strokeDasharray={`${dash} ${donutCirc - dash}`} strokeDashoffset={-offset} transform="rotate(-90 65 65)" />;
                    offset += dash;
                    return el;
                  });
                })()
              }
              <text x="65" y="60" textAnchor="middle" fontSize="22" fontWeight="900" fill="var(--text-primary)" fontFamily="Nunito">{totalStatus}</text>
              <text x="65" y="76" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="Nunito" fontWeight="600">Total</text>
            </svg>
          </div>

          {statusList.map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1, fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>{s.val}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
