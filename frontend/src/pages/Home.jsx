import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AnimeCard from "../components/AnimeCard";
import { getTrending, getSeasonal } from "../api/anilist";
import { getLists } from "../api/backend";
import { useIsMobile } from "../hooks/useIsMobile";

import frierenBanner from "./banners/Frieren.png";
import soloLevelingBanner from "./banners/Sololeveling.png";
import demonSlayerBanner from "./banners/Demonslayer.png";

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconFire = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#a855f7" stroke="none">
    <path d="M12 2c0 0-5 5-5 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 3-2 4-3 4s-2-2-2-4c1 0 2-5 2-5z" />
  </svg>
);

// ── Static slide data ────────────────────────────────────────────────────────
// objectPosition controls which part of the image shows (e.g. "center top" keeps top)
const SLIDES = [
  {
    img: frierenBanner,
    objectPosition: "center 35%",
    title: "Frieren: Beyond Journey's End",
    description: "A journey that offers the precious gift of understanding what it truly means to live.",
    genres: ["Adventure", "Drama", "Fantasy"],
    score: 9.3,
    // The frieren image is already wide & light on the left — use a lighter overlay
    // overlayStyle: "linear-gradient(to right, rgba(245,243,255,0.96) 0%, rgba(245,243,255,0.82) 32%, rgba(245,243,255,0.25) 55%, rgba(245,243,255,0.0) 72%)",
    // textColor:   "#1e1b4b",
    // subColor:    "#6b7280",
  },
  {
    img: soloLevelingBanner,
    objectPosition: "center 20%",   // show upper part (character + sky portal)
    title: "Solo Leveling",
    description: "The weakest hunter in the world awakens a power that will shake the very foundations of reality.",
    genres: ["Action", "Fantasy", "Adventure"],
    score: 8.7,
    // Dark image — white text works, but still need left fade so text is readable
    overlayStyle: "linear-gradient(to right, rgba(10,8,25,0.90) 0%, rgba(10,8,25,0.70) 32%, rgba(10,8,25,0.25) 58%, rgba(10,8,25,0.0) 75%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.75)",
    accentColor: "rgba(255,255,255,0.9)",

  },
  {
    img: demonSlayerBanner,
    objectPosition: "center 36%",   // show upper part (sky + characters)
    title: "Demon Slayer: Kimetsu no Yaiba",
    description: "A boy joins an ancient order of swordsmen to hunt down the demon that slaughtered his family.",
    genres: ["Action", "Historical", "Supernatural"],
    score: 8.9,
    overlayStyle: "linear-gradient(to right, rgba(15,8,30,0.92) 0%, rgba(15,8,30,0.72) 32%, rgba(15,8,30,0.22) 58%, rgba(15,8,30,0.0) 75%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.75)",
    accentColor: "rgba(255,255,255,0.9)",
    // overlayStyle: "linear-gradient(to right, rgba(245,243,255,0.96) 0%, rgba(245,243,255,0.82) 32%, rgba(245,243,255,0.25) 55%, rgba(245,243,255,0.0) 72%)",
    // textColor:   "#1e1b4b",
    // subColor:    "#6b7280",
  },
];

// ── Arrow button style ───────────────────────────────────────────────────────
function arrowBtn(side) {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    [side]: 18, zIndex: 4,
    width: 40, height: 40, borderRadius: "50%",
    background: "rgba(255,255,255,0.90)", backdropFilter: "blur(6px)",
    border: "1.5px solid rgba(255,255,255,0.95)",
    boxShadow: "0 2px 14px rgba(0,0,0,0.12)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#1e1b4b",
  };
}

// ── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({ slideIndex, totalSlides, onPrev, onNext, onAddToList, onViewAnime, isMobile }) {
  const slide = SLIDES[slideIndex];
  const isLight = slideIndex === 0;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      borderRadius: isMobile ? 12 : 20,
      overflow: "hidden",
      aspectRatio: isMobile ? "1.6 / 1" : "3.9 / 1",
      marginBottom: 15,
      flexShrink: 0,
      background: "#1a1535",
    }}>

      {/* ── Background image — NO filter, NO blur, full sharp ── */}
      <img
        key={slide.img}           // re-mount on slide change for clean transition
        src={slide.img}
        alt={slide.title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: slide.objectPosition,
          // Absolutely no blur or filter
          filter: "none",
          display: "block",
        }}
      />

      {/* ── Gradient overlay — only left 70%, right side is crystal clear ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: slide.overlayStyle,
        pointerEvents: "none",
      }} />

      {/* ── Left content ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        padding: isMobile ? "0 16px" : "0 48px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        maxWidth: isMobile ? "90%" : 480,
      }}>
        {/* FEATURED label */}
        <div style={{
          fontSize: isMobile ? 9 : 10.5, fontWeight: 700, letterSpacing: 2.5,
          textTransform: "uppercase", marginBottom: isMobile ? 6 : 12,
          color: isLight ? "#9333ea" : "rgba(196,181,253,0.95)",
        }}>
          Featured
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isMobile ? 18 : 36, fontWeight: 800, lineHeight: 1.18,
          color: slide.textColor, marginBottom: isMobile ? 8 : 16,
          textShadow: isLight ? "none" : "0 1px 8px rgba(0,0,0,0.3)",
        }}>
          {slide.title}
        </h1>

        {/* Score + genre chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: isLight ? "rgba(245,158,11,0.13)" : "rgba(245,158,11,0.20)",
            border: "1px solid rgba(245,158,11,0.30)",
            borderRadius: 6, padding: "3px 8px",
          }}>
            <IconStar />
            <span style={{ fontSize: 13, fontWeight: 800, color: isLight ? "#1e1b4b" : "#fff" }}>
              {slide.score}
            </span>
          </div>
          {slide.genres.map(g => (
            <span key={g} style={{
              fontSize: 12, fontWeight: 600,
              color: isLight ? "#6b7280" : "rgba(255,255,255,0.85)",
              background: isLight ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.12)",
              border: `1px solid ${isLight ? "#e8e4f8" : "rgba(255,255,255,0.22)"}`,
              borderRadius: 6, padding: "3px 10px",
            }}>{g}</span>
          ))}
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13.5, lineHeight: 1.65, marginBottom: 26, maxWidth: 340,
          color: slide.subColor,
          textShadow: isLight ? "none" : "0 1px 4px rgba(0,0,0,0.2)",
        }}>
          {slide.description}
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={onAddToList} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "linear-gradient(135deg, #9333ea, #7c3aed)",
            color: "#fff", border: "none", borderRadius: 99,
            padding: "10px 22px", fontSize: 13.5, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.40)",
          }}>
            <IconPlus /> Add to List
          </button>
          <button onClick={onViewAnime} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: isLight ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            color: isLight ? "#1e1b4b" : "#fff",
            border: `1.5px solid ${isLight ? "#e8e4f8" : "rgba(255,255,255,0.30)"}`,
            borderRadius: 99, padding: "10px 22px",
            fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          }}>
            <IconPlay /> View Anime
          </button>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button onClick={onPrev} style={arrowBtn("left")}><IconChevronLeft /></button>
      <button onClick={onNext} style={arrowBtn("right")}><IconChevronRight /></button>

      {/* ── Slide dots ── */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, zIndex: 3,
      }}>
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div key={i} style={{
            width: i === slideIndex ? 24 : 7, height: 7,
            borderRadius: 99, transition: "width 0.25s ease",
            background: i === slideIndex ? "#7c3aed" : "rgba(255,255,255,0.55)",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Search Section ───────────────────────────────────────────────────────────
const POPULAR_CHIPS = ["Solo Leveling", "Jujutsu Kaisen", "Demon Slayer", "Attack on Titan", "One Piece"];

function SearchSection({ onSearch, onChip, isMobile }) {
  const [q, setQ] = useState("");
  if (isMobile) {
    // Compact mobile version — just search bar + chips, no big heading
    return (
      <div style={{
        background: "#fff", border: "1px solid #e8e4f8",
        borderRadius: 14, padding: "14px 14px 10px", marginBottom: 10,
        boxShadow: "0 2px 12px rgba(124,58,237,0.06)",
      }}>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
            <IconSearch />
          </span>
          <input
            value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && q.trim()) onSearch(q.trim()); }}
            placeholder="Search anime..."
            style={{
              width: "100%", height: 40, background: "#faf9ff",
              border: "1.5px solid #e8e4f8", borderRadius: 99,
              padding: "0 40px 0 38px", fontSize: 13, color: "#1e1b4b",
              outline: "none", boxSizing: "border-box",
            }}
          />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#a855f7", display: "flex" }}>
            <IconSparkle />
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>Popular:</span>
          {POPULAR_CHIPS.map(chip => (
            <button key={chip} onClick={() => onChip(chip)} style={{
              fontSize: 11, fontWeight: 600, color: "#7c3aed",
              background: "transparent", border: "1px solid #e9d5ff",
              borderRadius: 99, padding: "3px 10px", cursor: "pointer",
            }}>{chip}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8e4f8",
      borderRadius: 16, padding: "26px 36px", marginBottom: 10,
      boxShadow: "0 2px 12px rgba(124,58,237,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", fontFamily: "'Playfair Display', serif", lineHeight: 1.3 }}>
            What are you<br />planning to watch today?
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: 660 }}>
          <div style={{ position: "relative", marginBottom: 11 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
              <IconSearch />
            </span>
            <input
              value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && q.trim()) onSearch(q.trim()); }}
              placeholder="Search anime, characters, studios..."
              style={{
                width: "100%", height: 46, background: "#faf9ff",
                border: "1.5px solid #e8e4f8", borderRadius: 99,
                padding: "0 48px 0 44px", fontSize: 14, color: "#1e1b4b", outline: "none",
              }}
            />
            <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#a855f7", display: "flex" }}>
              <IconSparkle />
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>Popular right now:</span>
            {POPULAR_CHIPS.map(chip => (
              <button key={chip} onClick={() => onChip(chip)} style={{
                fontSize: 12, fontWeight: 600, color: "#7c3aed",
                background: "transparent", border: "1px solid #e9d5ff",
                borderRadius: 99, padding: "4px 12px", cursor: "pointer",
              }}>{chip}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onViewAll }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 20, background: "linear-gradient(180deg,#9333ea,#7c3aed)", borderRadius: 99 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b" }}>{title}</span>
      </div>
      {onViewAll && (
        <button onClick={onViewAll} style={{
          fontSize: 13, fontWeight: 700, color: "#9333ea",
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          View All <span style={{ fontSize: 15 }}>›</span>
        </button>
      )}
    </div>
  );
}

// ── Continue Watching Card ───────────────────────────────────────────────────
function ContinueCard({ entry, onClick }) {
  const [hov, setHov] = useState(false);
  const total = entry.total_episodes || 24;
  const pct = Math.round((entry.progress / Math.max(total, 1)) * 100);
  const season = Math.max(1, Math.ceil(entry.progress / 12));

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        position: "relative", flex: "0 0 auto", width: 290, height: 170,
        borderRadius: 14, overflow: "hidden", cursor: "pointer",
        boxShadow: hov ? "0 8px 28px rgba(124,58,237,0.18)" : "0 2px 12px rgba(124,58,237,0.08)",
        transform: hov ? "translateY(-3px)" : "none", transition: "all .22s",
      }}>
      <div style={{ position: "absolute", inset: 0, background: "#1e1b4b" }}>
        {entry.cover_image && (
          <img src={entry.cover_image} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} alt={entry.title} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,10,35,0.95) 0%, rgba(15,10,35,0.4) 55%, rgba(15,10,35,0.05) 100%)" }} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{entry.title}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#c4b5fd", marginBottom: 8 }}>S{season} · Episode {entry.progress}</div>
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 99, height: 3, overflow: "hidden", marginBottom: 5 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#a855f7,#7c3aed)", borderRadius: 99 }} />
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600, textAlign: "right" }}>{pct}%</div>
      </div>
      <div style={{
        position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)",
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed",
      }}>
        <IconPlay />
      </div>
    </div>
  );
}

// ── Trending Row Item ────────────────────────────────────────────────────────
function TrendingItem({ rank, anime, onClick }) {
  const title = anime?.title?.romaji || anime?.title?.english || anime?.title || "";
  const cover = anime?.coverImage?.large || anime?.img || "";
  const pop = anime?.popularity ? `${(anime.popularity / 1000).toFixed(1)}K` : "—";

  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", padding: "7px 0", overflow: "hidden", minWidth: 0, }}>
      <div style={{ fontSize: 34, fontWeight: 800, color: "#8154a0", lineHeight: 1, minWidth: 42, textAlign: "right", fontFamily: "'Playfair Display', serif" }}>
        {String(rank).padStart(2, "0")}
      </div>
      <div style={{ width: 80, height: 120, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#e8e4f8" }}>
        {cover && <img src={cover} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={title} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginBottom: 4 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconFire />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#af9ca9" }}>{pop}</span>
        </div>
      </div>
    </div>
  );
}

// ── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [slideIdx, setSlideIdx] = useState(0);
  const totalSlides = SLIDES.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx(i => (i + 1) % totalSlides);
    }, 8000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const { data: trending = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"], queryFn: () => getTrending(1),
  });
  const { data: watchList = [] } = useQuery({
    queryKey: ["list", "watching"], queryFn: () => getLists("watching"),
  });

  const handleSearch = (q) => navigate(`/explore?q=${encodeURIComponent(q)}`);

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Hero Banner ── */}
      <HeroBanner
        slideIndex={slideIdx}
        totalSlides={totalSlides}
        isMobile={isMobile}
        onPrev={() => setSlideIdx(i => (i - 1 + totalSlides) % totalSlides)}
        onNext={() => setSlideIdx(i => (i + 1) % totalSlides)}
        onAddToList={() => { }}
        onViewAnime={() => navigate("/explore")}
      />

      {/* ── Search Section ── */}
      <SearchSection onSearch={handleSearch} onChip={handleSearch} isMobile={isMobile} />

      {/* ── Continue Watching ── */}
      {watchList.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader title="Continue Watching" onViewAll={() => navigate("/list")} />
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }} className="no-scroll">
            {watchList.slice(0, 6).map(e => (
              <ContinueCard key={e.id} entry={e} onClick={() => navigate(`/anime/${e.anilist_id}`)}
                style={{ width: isMobile ? "75vw" : 290 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recommended For You ── */}
      <div style={{ marginBottom: 15 }}>
        <SectionHeader title="Recommended For You" onViewAll={() => navigate("/ai")} />
        {trendingLoading ? (
          <div style={{ display: "flex", gap: 14 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ width: isMobile ? 130 : 175, height: isMobile ? 195 : 255, borderRadius: 14, flexShrink: 0 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }} className="no-scroll">
            {trending.slice(1, 12).map(a => (
              <AnimeCard key={a.id} anime={a} />
            ))}
          </div>
        )}
      </div>

      {/* ── Trending This Week ── */}
      <div style={{ marginBottom: 15 }}>
        <SectionHeader title="Trending This Week" onViewAll={() => navigate("/explore")} />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "0" : "4px 32px", overflow: "hidden", }}>
          {trending.slice(0, isMobile ? 5 : 6).map((a, i) => (
            <TrendingItem key={a.id} rank={i + 1} anime={a} onClick={() => navigate(`/anime/${a.id}`)} />
          ))}
        </div>
      </div>

    </div>
  );
}
