import { useState } from "react";
import { useNavigate } from "react-router-dom";

const IconStar = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

// ── Poster card used in "Recommended For You" ────────────────────────────────
export default function AnimeCard({ anime }) {
  const [hov, setHov] = useState(false);
  const navigate = useNavigate();
  const title  = anime?.title?.romaji || anime?.title?.english || anime?.title || "";
  const cover  = anime?.coverImage?.large || anime?.coverImage?.extraLarge || anime?.img || "";
  const score  = anime?.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const genres = anime?.genres?.slice(0, 2).join(", ") || anime?.genres || "";

  return (
    <div
      onClick={() => navigate(`/anime/${anime.id}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 175, flexShrink: 0, cursor: "pointer",
        borderRadius: 14, overflow: "hidden", position: "relative",
        boxShadow: hov ? "0 8px 28px rgba(124,58,237,0.18)" : "0 2px 10px rgba(124,58,237,0.08)",
        transform: hov ? "scale(1.035) translateY(-4px)" : "scale(1)",
        transition: "all .24s cubic-bezier(0.22,1,0.36,1)",
        background: "#f5f3ff",
      }}>

      {/* Poster */}
      <div style={{ height: 240, position: "relative", background: "#e8e4f8", overflow: "hidden" }}>
        {cover && (
          <img
            src={cover} alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
              transform: hov ? "scale(1.04)" : "scale(1)", transition: "transform .4s ease" }}
          />
        )}

        {/* Score badge top-left */}
        {score && (
          <div style={{
            position: "absolute", top: 9, left: 9,
            background: "rgba(255,255,255,0.96)", backdropFilter: "blur(6px)",
            borderRadius: 7, padding: "3px 7px",
            fontSize: 12, fontWeight: 800, color: "#1e1b4b",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <IconStar /> {score}
          </div>
        )}

        {/* Add button on hover */}
        {hov && (
          <div style={{
            position: "absolute", top: 9, right: 9,
            width: 28, height: 28, borderRadius: "50%",
            background: "#7c3aed",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", boxShadow: "0 2px 8px rgba(124,58,237,0.5)",
          }}>
            <IconPlus />
          </div>
        )}

        {/* Bottom gradient + text */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top,rgba(20,15,40,0.9),transparent)" }} />
        <div style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {title}
          </div>
          {genres && (
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{genres}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Continue Watching card (kept for backward compat) ─────────────────────────
export function ContinueCard({ entry, onClick }) {
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
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px",
        background: "#fff", border: "1px solid #ece8fb",
        borderRadius: 14, cursor: "pointer",
        flex: "0 0 auto", width: 300,
        boxShadow: hov ? "0 6px 20px rgba(124,58,237,0.13)" : "0 2px 10px rgba(124,58,237,0.07)",
        transform: hov ? "translateY(-2px)" : "none", transition: "all .2s",
      }}>
      <div style={{ width: 56, height: 72, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#e8e4f8" }}>
        {entry.cover_image && <img src={entry.cover_image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={entry.title} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b", marginBottom: 3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{entry.title}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9333ea", marginBottom: 8 }}>S{season} · Episode {entry.progress}</div>
        <div style={{ background: "#ede9fe", borderRadius: 99, height: 4, overflow: "hidden", marginBottom: 5 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#9333ea,#a855f7)", borderRadius: 99 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
          <span>{entry.progress} / {entry.total_episodes || "?"}</span>
          <span>{pct}%</span>
        </div>
      </div>
    </div>
  );
}
