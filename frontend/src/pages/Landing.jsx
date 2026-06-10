import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useIsMobile } from "../hooks/useIsMobile";
import demonSlayerBanner from "./banners/Demonslayer.png";

// ── AniList: fetch cover art (portrait 2:3) + demo card data ─────────────────
async function fetchAniListData() {
  const query = `query {
    frieren:    Media(id: 154587, type: ANIME) { id title{romaji} coverImage{extraLarge} averageScore episodes status genres description(asHtml:false) startDate{year} }
    jujutsu:    Media(id: 113415, type: ANIME) { id title{romaji} coverImage{extraLarge} averageScore episodes status genres description(asHtml:false) startDate{year} }
    demonSlayer:Media(id: 101922, type: ANIME) { id title{romaji} coverImage{extraLarge} averageScore episodes status genres description(asHtml:false) startDate{year} }
    yourName:   Media(id: 99426,  type: ANIME) { id title{romaji} coverImage{extraLarge} }
  }`;
  try {
    const r = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
    });
    const { data } = await r.json();
    return data || {};
  } catch { return {}; }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcLeaf = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13c0-5 6-11 8-13 2 2 8 8 8 13a7 7 0 0 1-7 7z" stroke="#a855f7" strokeWidth="2"/>
    <path d="M11 20v-9" stroke="#a855f7" strokeWidth="2"/>
  </svg>
);
const IcArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
);
const IcChevDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const IcList = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="6" height="6" rx="1"/><rect x="3" y="13" width="6" height="6" rx="1"/>
    <line x1="13" y1="7" x2="21" y2="7"/><line x1="13" y1="15" x2="21" y2="15"/><line x1="13" y1="19" x2="21" y2="19"/>
  </svg>
);
const IcSparkle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
    <path d="M19 3l.8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8z"/>
  </svg>
);
const IcChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IcBookmark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcHeart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IcStar = ({ filled, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

// ── Petals (fixed: keyframe carries initial rotation so shape stays petal) ───
const PETAL_CSS = `
  @keyframes petalDrift {
    0%   { transform: translateY(-40px) rotate(var(--r0)) scaleX(0.85); opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 0.55; }
    100% { transform: translateY(105vh) rotate(var(--r1)) scaleX(0.85); opacity: 0; }
  }
  .petal { animation: petalDrift var(--dur) var(--delay) linear infinite; }
`;

function Petals({ count = 20 }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 733 + 41) % 96 + 2}%`,
    dur: `${5 + (i * 137) % 5}s`,
    delay: `${((i * 97) % 50) / 10}s`,
    w: 10 + (i * 53) % 10,
    h: 7 + (i * 31) % 7,
    r0: (i * 53) % 360,
    r1: (i * 53) % 360 + 540 + (i % 2 === 0 ? 180 : -180),
    hue: 270 + (i * 7) % 60,
  }));
  return (
    <>
      <style>{PETAL_CSS}</style>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:1 }}>
        {items.map(p => (
          <div key={p.id} className="petal" style={{
            position: "absolute",
            left: p.left,
            top: 0,
            width: p.w,
            height: p.h,
            borderRadius: "50% 20% 50% 20%",
            background: `linear-gradient(135deg, hsla(${p.hue},80%,78%,0.75), hsla(${p.hue + 30},70%,70%,0.5))`,
            "--dur": p.dur,
            "--delay": p.delay,
            "--r0": `${p.r0}deg`,
            "--r1": `${p.r1}deg`,
          }} />
        ))}
      </div>
    </>
  );
}

// ── Floating cover card ───────────────────────────────────────────────────────
function FloatingCard({ cover, title, rotate, style }) {
  return (
    <div style={{
      width: 130,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 24px 56px rgba(109,40,217,0.28), 0 6px 18px rgba(0,0,0,0.18)",
      transform: `rotate(${rotate}deg)`,
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "default",
      flexShrink: 0,
      position: "absolute",
      ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = `rotate(${rotate * 0.3}deg) scale(1.06) translateY(-6px)`; e.currentTarget.style.boxShadow = "0 32px 72px rgba(109,40,217,0.38), 0 8px 24px rgba(0,0,0,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rotate}deg)`; e.currentTarget.style.boxShadow = "0 24px 56px rgba(109,40,217,0.28), 0 6px 18px rgba(0,0,0,0.18)"; }}
    >
      {cover ? (
        <img src={cover} alt={title} style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ width: "100%", aspectRatio: "2/3", background: "linear-gradient(135deg,#c4b5fd,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, textAlign: "center", padding: 8 }}>{title}</span>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "28px 8px 10px" }}>
        <div style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>{title}</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [covers, setCovers] = useState({});
  const [demoStatus, setDemoStatus] = useState("Completed");
  const [demoAnime, setDemoAnime] = useState(null);

  useEffect(() => {
    fetchAniListData().then(data => {
      setCovers({
        frieren:    data.frieren?.coverImage?.extraLarge,
        jujutsu:    data.jujutsu?.coverImage?.extraLarge,
        demonSlayer:data.demonSlayer?.coverImage?.extraLarge,
        yourName:   data.yourName?.coverImage?.extraLarge,
      });
      if (data.demonSlayer) setDemoAnime(data.demonSlayer);
    });
  }, []);

  const demo = demoAnime || {
    title: { romaji: "Demon Slayer: Kimetsu no Yaiba" },
    averageScore: 84, episodes: 26, status: "FINISHED",
    genres: ["Action","Fantasy","Historical","Shounen"],
    startDate: { year: 2019 },
    description: "A kind-hearted boy joins an organization dedicated to hunting demons after his family is slaughtered and his younger sister turned into a demon.",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f0ff", fontFamily: "'Nunito', 'Segoe UI', sans-serif", overflowX: "hidden" }}>

      {/* ── NAVBAR ───────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,92,246,0.1)",
        padding: isMobile ? "0 16px" : "0 48px", height: 64,
        display: "flex", alignItems: "center", gap: isMobile ? 12 : 32,
        boxShadow: "0 1px 24px rgba(109,40,217,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "default" }}>
          <IcLeaf />
          <span style={{ fontSize: 20, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.5px" }}>Shiori</span>
        </div>

        {/* Anchor links — hidden on mobile */}
        {!isMobile && [
          { label: "Features", href: "#features" },
          { label: "Stats",    href: "#stats"    },
          { label: "Preview",  href: "#preview"  },
        ].map(({ label, href }) => (
          <a key={label} href={href}
            style={{ fontSize: 14, fontWeight: 700, textDecoration: "none", color: "#4b5563" }}
            onMouseEnter={e => e.target.style.color = "#7c3aed"}
            onMouseLeave={e => e.target.style.color = "#4b5563"}
          >{label}</a>
        ))}

        <div style={{ flex: 1 }} />

        {/* Auth buttons — both visible on desktop, only Sign Up on mobile */}
        {!isMobile && (
          <button onClick={() => navigate("/login")} style={{
            fontSize: 14, fontWeight: 700, color: "#7c3aed",
            background: "none", border: "1.5px solid #e9d5ff",
            borderRadius: 99, padding: "8px 22px", cursor: "pointer",
          }}>Log In</button>
        )}
        <button onClick={() => navigate("/register")} style={{
          fontSize: 14, fontWeight: 700, color: "#fff",
          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
          border: "none", borderRadius: 99, padding: isMobile ? "8px 16px" : "8px 22px", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
        }}>{ isMobile ? "Sign Up" : "Sign Up Free"}</button>

        {/* Mobile: Log In text link */}
        {isMobile && (
          <button onClick={() => navigate("/login")} style={{
            fontSize: 14, fontWeight: 700, color: "#7c3aed",
            background: "none", border: "none", cursor: "pointer", padding: "8px 4px",
          }}>Log In</button>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: isMobile ? "70vh" : "calc(100vh - 64px)", minHeight: isMobile ? 420 : 540, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

        {/* Radial glow */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(196,181,253,0.45) 0%, rgba(243,240,255,0) 75%)" }} />

        <Petals count={22} />

        {/* ── 4 floating cards — hidden on mobile ── */}
        {!isMobile && <>
        <FloatingCard cover={covers.frieren}    title="Frieren: Beyond Journey's End" rotate={-12} style={{ left:"6%",  top:"8%",    zIndex:3 }} />
        <FloatingCard cover={covers.yourName}   title="Your Name."                    rotate={10}  style={{ right:"7%", top:"5%",    zIndex:3 }} />
        <FloatingCard cover={covers.jujutsu}    title="Jujutsu Kaisen"               rotate={-8}  style={{ left:"4%",  bottom:"10%",zIndex:3 }} />
        <FloatingCard cover={covers.demonSlayer} title="Demon Slayer"                 rotate={7}   style={{ right:"5%", bottom:"8%", zIndex:3 }} />
        </>}

        {/* Hero text — center */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 600, padding: "0 20px" }}>
          <h1 style={{ fontSize: "clamp(36px,4.5vw,58px)", fontWeight: 900, lineHeight: 1.1, color: "#1e1b4b", letterSpacing: "-1.5px", marginBottom: 18 }}>
            Your anime journey,
            <span style={{ display: "block" }}>
              beautifully{" "}
              <em style={{ color: "#a855f7", fontStyle: "italic" }}>organized.</em>
            </span>
          </h1>
          <p style={{ fontSize: 17, color: "#6b7280", marginBottom: 38, lineHeight: 1.7, fontWeight: 500 }}>
            Track, discover, and cherish every anime that moves you.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/register")} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff",
              border: "none", borderRadius: 99, padding: "14px 30px",
              fontSize: 15, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(124,58,237,0.52)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,58,237,0.4)"; }}
            >
              Get Started <IcArrow />
            </button>
            <button onClick={() => navigate("/explore")} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#fff", color: "#374151", border: "1.5px solid #e5e7eb",
              borderRadius: 99, padding: "14px 30px", fontSize: 15, fontWeight: 700, cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#a855f7"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(168,85,247,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Explore Anime <IcArrow />
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: isMobile ? "40px 20px" : "72px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20 }}>
          {[
            { Ic: IcList,    title: "Track your watchlist",        desc: "Easily manage what you're watching, plan to watch, or have completed." },
            { Ic: IcSparkle, title: "AI-powered recommendations",  desc: "Discover anime you'll love with smart, personalized suggestions." },
            { Ic: IcChart,   title: "Detailed stats & insights",   desc: "Beautiful charts and stats to visualize your anime journey." },
          ].map(({ Ic, title, desc }) => (
            <div key={title} style={{
              background: "#fff", borderRadius: 20, padding: "32px 28px",
              boxShadow: "0 2px 20px rgba(109,40,217,0.07)",
              border: "1px solid rgba(139,92,246,0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(109,40,217,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 20px rgba(109,40,217,0.07)"; }}
            >
              <div style={{ width: 48, height: 48, background: "#f5f3ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", marginBottom: 20 }}>
                <Ic />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1e1b4b", marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ROW ────────────────────────────────────────────────────────── */}
      <section id="stats" style={{ padding: isMobile ? "32px 20px 48px" : "32px 48px 72px", maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: isMobile ? 32 : 20, textAlign: "center" }}>
        {[
          { val: "10,000+", label: "Anime Tracked", Ic: IcBookmark },
          { val: "50K+",    label: "Users",          Ic: IcUsers   },
          { val: "99%",     label: "Satisfaction",   Ic: IcHeart   },
        ].map(({ val, label, Ic }) => (
          <div key={label}>
            <div style={{ fontSize: "clamp(36px,4vw,52px)", fontWeight: 900, color: "#7c3aed", lineHeight: 1, marginBottom: 6 }}>{val}</div>
            <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600, marginBottom: 16 }}>{label}</div>
            <div style={{ display: "flex", justifyContent: "center", color: "#a855f7" }}><Ic /></div>
          </div>
        ))}
      </section>

      {/* ── DEMO CARD ────────────────────────────────────────────────────────── */}
      <section id="preview" style={{ padding: isMobile ? "0 16px 48px" : "0 48px 80px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 60px rgba(0,0,0,0.32)", position: "relative" }}>
          {/* Dark banner background */}
          <div style={{
            position: "relative",
            background: `linear-gradient(rgba(8,4,24,0.35), rgba(8,4,24,0.65)), url(${demonSlayerBanner}) center/cover no-repeat`,
            minHeight: 260, padding: "32px 32px 0",
            display: "flex", alignItems: "flex-end",
          }}>
            {/* Score badge */}
            <div style={{
              position: "absolute", top: 18, right: 20,
              background: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.22)", borderRadius: 99,
              padding: "6px 13px", display: "flex", alignItems: "center", gap: 5,
            }}>
              <IcStar filled size={13} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{((demo.averageScore || 84) / 10).toFixed(1)}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>(82.1K)</span>
            </div>

            <div style={{ display: "flex", gap: isMobile ? 14 : 22, alignItems: "flex-end", width: "100%", paddingBottom: 24, flexWrap: isMobile ? "wrap" : "nowrap" }}>
              {/* Portrait cover */}
              <div style={{ width: isMobile ? 70 : 90, flexShrink: 0, borderRadius: 10, overflow: "hidden", boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
                {covers.demonSlayer
                  ? <img src={covers.demonSlayer} alt="Demon Slayer" style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: "100%", aspectRatio: "2/3", background: "#2d1b69" }} />
                }
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 9, lineHeight: 1.2 }}>
                  {demo.title?.romaji}
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10, alignItems: "center" }}>
                  {demo.startDate?.year && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>{demo.startDate.year}</span>}
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>TV</span>
                  {demo.episodes && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>{demo.episodes} eps</span>}
                  <span style={{ background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99 }}>
                    {demo.status === "FINISHED" ? "Finished" : demo.status}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {(demo.genres || []).slice(0, 4).map(g => (
                    <span key={g} style={{ background: "rgba(255,255,255,0.11)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{g}</span>
                  ))}
                </div>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {(demo.description || "").replace(/<[^>]+>/g, "") || "A kind-hearted boy joins an organization dedicated to hunting demons after his family is slaughtered and his younger sister turned into a demon."}
                </p>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div style={{ background: "#fff", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 99, padding: "8px 16px" }}
              onClick={() => setDemoStatus(s => s === "Completed" ? "Watching" : s === "Watching" ? "Plan to Watch" : "Completed")}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{demoStatus}</span>
              <IcChevDown />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {[1,2,3,4,5].map(i => <IcStar key={i} filled size={20} />)}
              <span style={{ fontSize: 14, fontWeight: 800, color: "#374151", marginLeft: 6 }}>10 / 10</span>
            </div>
            <div style={{ width: 36, height: 36, background: "#f5f3ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#7c3aed" }}>
              <IcBookmark />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "0 16px 48px" : "0 48px 88px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ borderRadius: 28, overflow: "hidden", background: "linear-gradient(135deg,#e9d5ff 0%,#f5f3ff 45%,#fce7f3 100%)", padding: "68px 44px", textAlign: "center", position: "relative" }}>
          <Petals count={14} />
          <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: "#1e1b4b", lineHeight: 1.2, marginBottom: 30, letterSpacing: "-0.5px", position: "relative", zIndex: 2 }}>
            Ready to elevate your<br />anime experience?
          </h2>
          <button onClick={() => navigate("/register")} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff",
            border: "none", borderRadius: 99, padding: "16px 38px",
            fontSize: 15, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 8px 30px rgba(124,58,237,0.36)",
            position: "relative", zIndex: 2,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 42px rgba(124,58,237,0.52)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(124,58,237,0.36)"; }}
          >
            Get Started for Free <IcArrow />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#fff", borderTop: "1px solid rgba(139,92,246,0.1)", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IcLeaf />
          <span style={{ fontSize: 17, fontWeight: 900, color: "#1e1b4b" }}>Shiori</span>
        </div>
        <span style={{ fontSize: 12.5, color: "#9ca3af" }}>© 2025 Shiori. All rights reserved.</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy","Terms","About","Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textDecoration: "none" }}
              onMouseEnter={e => e.target.style.color = "#7c3aed"}
              onMouseLeave={e => e.target.style.color = "#6b7280"}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
